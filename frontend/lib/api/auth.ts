import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createHash } from 'crypto'

export interface Tenant {
    id: string
    email: string | null
    display_name: string | null
    persona: string | null
    tier: 'unpaid' | 'pro' | 'elite' | 'enterprise'
    role: 'forensic_admin' | 'forensic_analyst' | 'forensic_observer'
    credits_remaining: number
    active: boolean
}

export interface TenantProfile {
    id: string
    email: string
    display_name: string
    role: 'forensic_admin' | 'forensic_analyst' | 'forensic_observer'
    tier: 'unpaid' | 'pro' | 'elite' | 'enterprise'
}

const ELITE_TIERS = ['elite', 'enterprise']

/**
 * Retrieves the current authenticated user's tenant profile.
 * Standardizes role-based access control (RBAC).
 */
export async function getTenantProfile(): Promise<TenantProfile | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile, error } = await supabase
        .from('tenants')
        .select('id, email, display_name, role, tier')
        .eq('id', user.id)
        .single()

    if (error || !profile) {
        console.error('[AUTH_ERROR] Failed to fetch tenant profile:', error)
        return null
    }

    return profile as TenantProfile
}

/**
 * Higher-order helper for Page enforcement.
 * Redirects non-admins to the dashboard.
 */
export async function requireAdmin() {
    const profile = await getTenantProfile()
    
    if (!profile) {
        redirect('/login')
    }

    if (profile.role !== 'forensic_admin') {
        console.warn(`[UNAUTHORIZED_ACCESS] User ${profile.id} attempted admin-only access.`)
        redirect('/dashboard')
    }

    return profile
}
/**
 * Retrieves the current tenant data.
 */
export async function getCurrentTenant(): Promise<Tenant | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('tenants')
        .select('id, email, display_name, persona, tier, role, credits_remaining, active')
        .eq('id', user.id)
        .single()

    if (error || !data) return null
    return data as Tenant
}

/**
 * Guard: ensures the current user is on an Elite (or Professional) tier.
 * Returns { allowed: true, tenant } or { allowed: false, error }.
 */
export async function requireEliteTier(): Promise<
    { allowed: true; tenant: Tenant } | { allowed: false; error: string }
> {
    const tenant = await getCurrentTenant()
    if (!tenant) return { allowed: false, error: 'Not authenticated' }
    if (!ELITE_TIERS.includes(tenant.tier)) {
        return { 
            allowed: false, 
            error: 'This premium feature is available on our Elite plan. Upgrade to access automated de-indexing, advanced watermarking, and deeper web recovery.' 
        }
    }
    return { allowed: true, tenant }
}

/**
 * Validates a Lysis Connect API key from an incoming request.
 * Used by external integrations and automated forensic tools.
 */
export async function validateApiKey(request: Request): Promise<{
    success: boolean
    tenantId?: string
    scopes?: string[]
    error?: string
}> {
    const authHeader = request.headers.get('Authorization')
    const keyHeader = request.headers.get('X-API-Key')
    
    const fullKey = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : keyHeader

    if (!fullKey) {
        return { success: false, error: 'Missing API key' }
    }

    // Standard Tuppli format: tp_[prefix]_[rest]
    // Migration 004 uses a simpler prefix strategy: 8 chars
    const prefix = fullKey.substring(0, 8)
    const hashedKey = createHash('sha256').update(fullKey).digest('hex')

    const supabase = await createClient()
    
    // We use the service role bypass for API key lookup because 
    // the request is coming from an unauthenticated (no session) origin
    const { data: keyData, error } = await supabase
        .from('api_keys')
        .select('tenant_id, scopes, revoked_at')
        .eq('key_prefix', prefix)
        .eq('hashed_key', hashedKey)
        .is('revoked_at', null)
        .single()

    if (error || !keyData) {
        console.error('[AUTH_ERROR] Invalid API key attempt:', prefix)
        return { success: false, error: 'Invalid or revoked API key' }
    }

    return {
        success: true,
        tenantId: keyData.tenant_id,
        scopes: keyData.scopes || []
    }
}
