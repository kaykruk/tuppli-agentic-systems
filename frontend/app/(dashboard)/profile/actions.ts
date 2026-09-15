'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AuthorizedAccount = {
    id: string
    platform: string
    username: string
    profile_url: string | null
    account_type: 'personal' | 'agency'
    verification_status: 'pending' | 'verified' | 'failed'
    verification_method: string | null
    verification_code: string | null
    verified_at: string | null
    created_at: string
}

export type ProfileData = {
    id: string
    email: string | null
    display_name: string | null
    tier: string
    credits_remaining: number
    stripe_customer_id: string | null
    subscription_status: string
}

// Get user profile
export async function getProfile(): Promise<ProfileData | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', user.id)
        .single()

    return data
}

// Update profile
export async function updateProfile(displayName: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('tenants')
        .update({ display_name: displayName })
        .eq('id', user.id)

    if (error) throw error

    revalidatePath('/profile')
    return { success: true }
}

// Get authorized accounts
export async function getAuthorizedAccounts(): Promise<AuthorizedAccount[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
        .from('authorized_accounts')
        .select('*')
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false })

    return data || []
}

// Generate verification code
function generateVerificationCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = 'LYS-'
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

// Add authorized account
export async function addAuthorizedAccount(
    platform: string,
    username: string,
    profileUrl: string,
    accountType: 'personal' | 'agency' = 'personal'
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const verificationCode = generateVerificationCode()

    const { data, error } = await supabase
        .from('authorized_accounts')
        .insert({
            tenant_id: user.id,
            platform,
            username,
            profile_url: profileUrl,
            account_type: accountType,
            verification_status: 'pending',
            verification_method: 'bio_code',
            verification_code: verificationCode
        })
        .select()
        .single()

    if (error) throw error

    revalidatePath('/profile')
    return data
}

// Delete authorized account
export async function deleteAuthorizedAccount(accountId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('authorized_accounts')
        .delete()
        .eq('id', accountId)
        .eq('tenant_id', user.id)

    if (error) throw error

    revalidatePath('/profile')
    return { success: true }
}

// Verify account with bio code
export async function verifyAccountWithCode(accountId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Get account details
    const { data: account } = await supabase
        .from('authorized_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('tenant_id', user.id)
        .single()

    if (!account) throw new Error('Account not found')

    // TODO: Implement actual scraping/verification logic
    // For now, mock verification
    const verified = true

    if (verified) {
        const { error } = await supabase
            .from('authorized_accounts')
            .update({
                verification_status: 'verified',
                verified_at: new Date().toISOString()
            })
            .eq('id', accountId)

        if (error) throw error

        revalidatePath('/profile')
        return { success: true, verified: true }
    }

    return { success: false, verified: false }
}
