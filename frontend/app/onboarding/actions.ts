'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper to generate pHash via image-hasher service
async function generatePHash(url: string): Promise<string | null> {
    try {
        const endpoints = ['http://image-hasher:8000', 'http://127.0.0.1:8000']

        for (const base of endpoints) {
            try {
                const res = await fetch(`${base}/hash/phash`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url })
                })
                if (res.ok) {
                    const data = await res.json()
                    return data.phash
                }
            } catch (e) {
                continue
            }
        }
        return null
    } catch (e) {
        console.error('PHash generation failed:', e)
        return null
    }
}

// Helper to trigger n8n webhook
async function triggerN8nWebhook(payload: any) {
    try {
        const endpoints = ['http://n8n:5678', 'http://127.0.0.1:5678']
        // Assuming a webhook path, e.g., /webhook/onboarding
        // Ideally this comes from an env var
        const webhookPath = '/webhook/onboarding'

        for (const base of endpoints) {
            try {
                await fetch(`${base}${webhookPath}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                return
            } catch (e) {
                continue
            }
        }
    } catch (e) {
        console.error('N8n webhook failed:', e)
    }
}

export async function completeOnboarding(data: {
    displayName: string,
    targetUsername: string,
    platform: string,
    persona?: string,
    variations?: string[]
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // 1. Get Tenant ID
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!tenant) return { success: false, error: 'Tenant not found' }

    // 2. Update Tenant Profile
    const { error: updateError } = await supabase
        .from('tenants')
        .update({
            display_name: data.displayName,
            persona: data.persona || 'premium_creator',
            brand_variations: data.variations || [],
            onboarded_at: new Date().toISOString()
        })
        .eq('id', tenant.id)

    if (updateError) return { success: false, error: 'Failed to update profile' }

    // 3. Add First Recon Target
    const { error: targetError } = await supabase
        .from('recon_targets')
        .insert({
            tenant_id: tenant.id,
            target_name: data.targetUsername,
            target_type: 'social_media',
            status: 'active',
            platform_configs: {
                [data.platform]: data.targetUsername
            }
        })

    if (targetError) return { success: false, error: 'Failed to add target' }

    // Trigger n8n webhook for initial recon
    await triggerN8nWebhook({
        tenant_id: tenant.id,
        action: 'initial_recon',
        target: data.targetUsername,
        platform: data.platform,
        persona: data.persona
    })

    revalidatePath('/dashboard')
    return { success: true }
}

export async function registerReferenceMedia(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!tenant) return { success: false, error: 'Tenant not found' }

    const file = formData.get('file') as File
    if (!file) return { success: false, error: 'No file provided' }

    // Upload to Supabase
    const filename = `${tenant.id}/${Date.now()}_${file.name}`
    const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('evidence')
        .upload(filename, file)

    if (uploadError) return { success: false, error: 'Upload failed: ' + uploadError.message }

    const { data: { publicUrl } } = supabase
        .storage
        .from('evidence')
        .getPublicUrl(filename)

    // Generate pHash
    const phash = await generatePHash(publicUrl)

    // Insert to DB
    const { error: dbError } = await supabase
        .from('forensic_evidence')
        .insert({
            tenant_id: tenant.id,
            evidence_type: 'reference_media',
            evidence_name: file.name,
            source_url: publicUrl,
            phash_image: phash || undefined,
            verification_status: 'trusted_reference',
            custody_log: [{
                timestamp: new Date().toISOString(),
                action: 'reference_upload',
                performed_by: user.id
            }]
        })

    if (dbError) return { success: false, error: 'DB Insert failed: ' + dbError.message }

    return { success: true }
}

export async function selectSubscriptionTier(tier: 'freemium' | 'elite') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!tenant) return { success: false, error: 'Tenant not found' }

    const { error } = await supabase
        .from('tenants')
        .update({
            tier: tier,
            credits_remaining: tier === 'elite' ? 5000 : 10
        })
        .eq('id', tenant.id)

    if (error) return { success: false, error: 'Failed to update tier' }

    // Trigger n8n webhook for subscription
    await triggerN8nWebhook({
        tenant_id: tenant.id,
        action: 'subscription_selected',
        tier: tier
    })

    revalidatePath('/dashboard')

    // In a real implementation this would return a checkout URL for Elite
    return { success: true }
}
