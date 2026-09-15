'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getTenantProfile, requireEliteTier } from '@/lib/api/auth'
import { getInviteMetadata } from '@/lib/discord/scout'
import { infiltrateDiscordServer } from '@/lib/discord/engine'

/**
 * Forensic Action: Secure and Distribute
 * Calls the watermark_service to embed an ID and returns the watermarked file.
 */
export async function secureAndDistribute(formData: FormData) {
    // 🛡️ ELITE TIER CHECK (Server Side)
    const tierCheck = await requireEliteTier()
    if (!tierCheck.allowed) return { success: false, error: tierCheck.error }

    // 🛡️ ROLE CHECK: Only Admins/Analysts can watermark and distribute
    const profile = tierCheck.tenant
    if (profile.role !== 'forensic_admin' && profile.role !== 'forensic_analyst') {
        return { success: false, error: 'Unauthorized: Action requires elevated privileges' }
    }

    const supabase = await createClient()
    const user = profile // Use the profile returned by auth check
    
    const file = formData.get('file') as File
    const platform = formData.get('platform') as string || 'custom'
    const recipientId = formData.get('recipientId') as string || user.id

    if (!file) return { success: false, error: 'No file provided' }

    try {
        // 1. Convert file to Base64 for the microservice
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64 = buffer.toString('base64')

        // 2. Call Watermark Service
        const wmUrl = process.env.WATERMARK_SERVICE_URL || 'http://watermark-service:4001'
        
        let mediaType = 'image'
        if (file.type.startsWith('video/')) {
            mediaType = 'video'
        } else if (file.type.startsWith('audio/')) {
            mediaType = 'audio'
        }

        const response = await fetch(`${wmUrl}/embed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                media_base64: base64,
                viewer_id: recipientId,
                media_type: mediaType
            })
        })

        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.error || 'Watermarking failed')
        }

        const result = await response.json()

        // 3. Log the "Distribution" event (but NOT the file)
        // We log the pHash for future scanning
        const { data: tenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('id', user.id)
            .single()

        if (tenant) {
            await supabase.from('intelligence_data').insert({
                tenant_id: tenant.id,
                intel_name: `Distributed protected file: ${file.name}`,
                intel_type: 'distribution_event',
                source: platform,
                threat_level: 'low',
                ai_summary: `Forensic watermark embedded for recipient: ${recipientId}. Platform: ${platform}.`,
                discovered_at: new Date().toISOString()
            })
        }

        return {
            success: true,
            filename: `tuppli_protected_${file.name}`,
            mimeType: file.type,
            base64: result.watermarked_base64
        }
    } catch (error) {
        console.error('[Secure Share Error]', error)
        return { success: false, error: (error as Error).message }
    }
}

/**
 * Scout Action: Save Discord Token
 * Stores a burner account token in the tenant's auto_pilot_config.
 */
export async function saveScoutToken(token: string) {
    const profile = await getTenantProfile()
    if (!profile || profile.role !== 'forensic_admin') {
        return { success: false, error: 'Unauthorized' }
    }

    const supabase = await createClient()

    // We store tokens in a hidden field in auto_pilot_config
    const { data: tenant } = await supabase
        .from('tenants')
        .select('auto_pilot_config')
        .eq('id', profile.id)
        .single()

    const config = tenant?.auto_pilot_config || {}
    const updatedConfig = {
        ...config,
        discord_scout_tokens: [
            ...(config.discord_scout_tokens || []),
            { token, added_at: new Date().toISOString() }
        ]
    }

    await supabase
        .from('tenants')
        .update({ auto_pilot_config: updatedConfig })
        .eq('id', profile.id)

    revalidatePath('/vault')
    return { success: true }
}

/**
 * Intelligence Action: Trigger Discord Scout
 * Performs a passive server check and returns metadata.
 */
export async function triggerDiscordScout(inviteUrl: string) {
    // 🏆 ELITE TIER CHECK (Server Side)
    const tierCheck = await requireEliteTier()
    if (!tierCheck.allowed) return { success: false, error: tierCheck.error }

    const profile = tierCheck.tenant

    const metadata = await getInviteMetadata(inviteUrl)
    if (!metadata) return { success: false, error: 'Could not fetch server metadata' }

    const supabase = await createClient()

    // Insert into Intelligence Data
    await supabase.from('intelligence_data').insert({
        tenant_id: profile.id,
        intel_name: `Discord: ${metadata.serverName}`,
        intel_type: 'discord',
        source: 'Discord Scout',
        source_url: `https://discord.gg/${metadata.code}`,
        threat_level: metadata.riskScore > 50 ? 'high' : 'medium',
        ai_summary: `${metadata.memberCount} members. ${metadata.description || 'No description available.'}`,
        discovered_at: new Date().toISOString()
    })

    revalidatePath('/intelligence')
    return { success: true, metadata }
}

/**
 * Enforcement Action: Active Infiltration
 * Triggers the stealth engine to join a server and extract leak URLs.
 */
export async function triggerDiscordInfiltration(inviteCode: string) {
    // 🏆 ELITE TIER CHECK (Server Side)
    const tierCheck = await requireEliteTier()
    if (!tierCheck.allowed || tierCheck.tenant.role !== 'forensic_admin') {
        return { success: false, error: 'Unauthorized: Elite Admin privileges required' }
    }

    const profile = tierCheck.tenant
    const supabase = await createClient()

    // 1. Get Token
    const { data: tenant } = await supabase
        .from('tenants')
        .select('auto_pilot_config')
        .eq('id', profile.id)
        .single()

    const tokens = tenant?.auto_pilot_config?.discord_scout_tokens || []
    if (tokens.length === 0) {
        return { success: false, error: 'No Discord Scout tokens available in your Vault' }
    }

    const activeToken = tokens[0].token // Use the first available token

    // 2. Run Engine
    try {
        const result = await infiltrateDiscordServer(inviteCode, activeToken)

        if (!result.success) {
            return { success: false, error: result.error || 'Infiltration failed' }
        }

        // 3. Save Discovered Assets to Forensic Evidence
        if (result.assetsDiscovered.length > 0) {
            const evidenceToInsert = result.assetsDiscovered.map(asset => ({
                tenant_id: profile.id,
                evidence_name: `Discord Leak: ${asset.fileName}`,
                evidence_type: 'discord_leak',
                source_platform: 'discord',
                source_url: asset.url,
                verification_status: 'matched',
                metadata: {
                    invite_code: inviteCode,
                    channel: asset.channelName,
                    scanned_at: asset.timestamp
                }
            }))

            await supabase.from('forensic_evidence').insert(evidenceToInsert)
        }

        revalidatePath('/evidence')
        return { 
            success: true, 
            message: `Successfully infiltrated. Discovered ${result.assetsDiscovered.length} assets.`,
            result 
        }
    } catch (error) {
        return { success: false, error: 'Infiltration engine crashed' }
    }
}

/**
 * Enforcement Action: Search Engine De-indexing
 * Submits a request to remove infringing URLs from search results.
 */
export async function requestDeindexing(evidenceId: string) {
    // 🏆 ELITE TIER CHECK
    const tierCheck = await requireEliteTier()
    if (!tierCheck.allowed) return { success: false, error: tierCheck.error }

    const profile = tierCheck.tenant
    const supabase = await createClient()

    // 1. Fetch evidence
    const { data: evidence, error } = await supabase
        .from('forensic_evidence')
        .select('source_url, evidence_name')
        .eq('id', evidenceId)
        .single()

    if (error || !evidence) return { success: false, error: 'Evidence not found' }

    // 2. Call Legal Automation Service
    const legalUrl = process.env.LEGAL_AUTOMATION_URL || 'http://legal-automation:4000'
    const authToken = process.env.N8N_WEBHOOK_AUTH_TOKEN || 'dev_secret'

    try {
        const response = await fetch(`${legalUrl}/deindex`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-lysis-auth': authToken
            },
            body: JSON.stringify({
                url: evidence.source_url,
                engine: 'google'
            })
        })

        const result = await response.json()

        // 3. Log de-indexing request
        await supabase.from('intelligence_data').insert({
            tenant_id: profile.id,
            intel_name: `De-indexing Request: ${evidence.evidence_name}`,
            intel_type: 'other',
            source: 'Google API',
            threat_level: 'none',
            ai_summary: `Submission result: ${result.message}${result.inspection ? ` (Inspection: ${result.inspection.indexStatusResult?.verdict})` : ''}`,
            discovered_at: new Date().toISOString()
        })

        if (!response.ok) throw new Error(result.error || 'De-indexing request failed')

        return { 
            success: true, 
            message: result.message || 'De-indexing request submitted successfully.' 
        }
    } catch (error) {
        console.error('[De-index Error]', error)
        return { success: false, error: (error as Error).message }
    }
}
