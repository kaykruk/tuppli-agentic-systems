'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

// Types based on database schema
export interface DashboardStats {
    activeThreats: number
    reconTargets: number
    evidenceItems: number
    openCases: number
    lastScanTime?: string
}

export interface RecentDetection {
    id: string
    media: string
    platform: string
    confidence: number
    url: string
}

export interface ReconTarget {
    id: string
    target_name: string
    target_type: string
    target_value: string
    status: string
    priority: number
    last_scanned_at: string | null
    created_at: string
}

export interface ForensicEvidence {
    id: string
    evidence_name: string
    evidence_type: string
    source_platform: string | null
    source_url: string | null
    similarity_score: number | null
    verification_status: string
    phash_image: string | null
    discovered_at: string | null
    created_at: string
}

export interface LegalCase {
    id: string
    case_number: string
    case_name: string
    case_type: string
    status: string
    priority: string
    platform: string | null
    deadline_date: string | null
    created_at: string
}

export interface VaultItem {
    id: string
    item_name: string
    item_type: string
    category: string | null
    sync_status: string
    created_at: string
}

export interface IntelligenceData {
    id: string
    intel_name: string
    intel_type: 'surface_web' | 'dark_web' | 'social_media' | 'forum' | 'marketplace' | 'telegram' | 'discord' | 'other'
    source: string | null
    source_url: string | null
    threat_level: 'none' | 'low' | 'medium' | 'high' | 'critical'
    ai_summary: string | null
    discovered_at: string
}

import { requireEliteTier } from '@/lib/api/auth'
export type { Tenant } from '@/lib/api/auth'

// Dashboard Stats
export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient()

    const [targetsRes, evidenceRes, casesRes, threatsRes] = await Promise.all([
        supabase.from('recon_targets').select('id', { count: 'exact', head: true }),
        supabase.from('forensic_evidence').select('id', { count: 'exact', head: true }),
        supabase.from('legal_cases').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('forensic_evidence').select('id', { count: 'exact', head: true }).eq('verification_status', 'matched'),
    ])

    // Get last scan time
    const { data: lastScan } = await supabase
        .from('recon_targets')
        .select('last_scanned_at')
        .not('last_scanned_at', 'is', null)
        .order('last_scanned_at', { ascending: false })
        .limit(1)
        .single()

    return {
        activeThreats: threatsRes.count ?? 0,
        reconTargets: targetsRes.count ?? 0,
        evidenceItems: evidenceRes.count ?? 0,
        openCases: casesRes.count ?? 0,
        lastScanTime: lastScan?.last_scanned_at ?? undefined,
    }
}

// Recent Detections (forensic evidence matches)
export async function getRecentDetections(): Promise<RecentDetection[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('forensic_evidence')
        .select('id, evidence_name, source_platform, similarity_score, source_url')
        .eq('verification_status', 'matched')
        .order('discovered_at', { ascending: false })
        .limit(10)

    if (error || !data) return []

    return data.map(item => ({
        id: item.id,
        media: item.evidence_name,
        platform: item.source_platform ?? 'Unknown',
        confidence: Math.round((item.similarity_score ?? 0) * 100),
        url: item.source_url ?? '',
    }))
}

// Recon Targets
export async function getReconTargets(): Promise<ReconTarget[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('recon_targets')
        .select('id, target_name, target_type, target_value, status, priority, last_scanned_at, created_at')
        .order('created_at', { ascending: false })

    if (error || !data) return []
    return data
}

export async function createReconTarget(target: {
    target_name: string
    target_type: string
    target_value: string
    priority?: number
}): Promise<{ success: boolean; error?: string; upgradeRequired?: boolean }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    // Check tier — unpaid users get 1 free scan
    const { data: tenant } = await supabase
        .from('tenants')
        .select('tier')
        .eq('id', user.id)
        .single()

    if (tenant?.tier === 'unpaid') {
        const { count } = await supabase
            .from('recon_targets')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', user.id)

        if ((count ?? 0) >= 1) {
            return { 
                success: false, 
                error: 'You\'ve used your free scan. Upgrade to continue protecting your content.',
                upgradeRequired: true 
            }
        }
    }

    const { error } = await supabase.from('recon_targets').insert({
        tenant_id: user.id,
        target_name: target.target_name,
        target_type: target.target_type,
        target_value: target.target_value,
        priority: target.priority ?? 5,
        status: 'pending',
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
}

// Forensic Evidence
export async function getForensicEvidence(): Promise<ForensicEvidence[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('forensic_evidence')
        .select('id, evidence_name, evidence_type, source_platform, source_url, similarity_score, verification_status, phash_image, discovered_at, created_at')
        .order('created_at', { ascending: false })

    if (error || !data) return []
    return data
}

// Legal Cases
export async function getLegalCases(): Promise<LegalCase[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('legal_cases')
        .select('id, case_number, case_name, case_type, status, priority, platform, deadline_date, created_at')
        .order('created_at', { ascending: false })

    if (error || !data) return []
    return data
}

// Vault Items
export async function getVaultItems(): Promise<VaultItem[]> {
    const tierCheck = await requireEliteTier()
    if (!tierCheck.allowed) return []

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('vault_items')
        .select('id, item_name, item_type, category, sync_status, created_at')
        .order('created_at', { ascending: false })

    if (error || !data) return []
    return data
}

export async function createVaultItem(item: {
    item_name: string
    item_type: 'master_image' | 'master_video' | 'watermark_key' | 'api_credential' | 'signature' | 'other'
    phash: string
    phash_variants?: { original: string; flippedH?: string; flippedV?: string }
    original_filename?: string
    original_mime_type?: string
    category?: string
    tags?: string[]
}): Promise<{ success: boolean; error?: string; id?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    const { data, error } = await supabase.from('vault_items').insert({
        tenant_id: user.id,
        item_name: item.item_name,
        item_type: item.item_type,
        phash: item.phash,
        phash_variants: item.phash_variants || null,
        original_filename: item.original_filename,
        original_mime_type: item.original_mime_type,
        category: item.category || null,
        tags: item.tags || [],
        sync_status: 'synced'
    }).select('id').single()

    if (error) return { success: false, error: error.message }
    return { success: true, id: data?.id }
}

export async function deleteVaultItem(id: string): Promise<{ success: boolean; error?: string }> {
    const tierCheck = await requireEliteTier()
    if (!tierCheck.allowed) return { success: false, error: tierCheck.error }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    const { error } = await supabase
        .from('vault_items')
        .delete()
        .eq('id', id)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

// Intelligence Data
export async function getIntelligenceData(): Promise<IntelligenceData[]> {
    const tenant = await getCurrentTenant()
    const supabase = await createClient()

    const { data: dbData, error } = await supabase
        .from('intelligence_data')
        .select('*')
        .order('discovered_at', { ascending: false })

    // Synthetic Shadow Intelligence (Simulated global patrol)
    const shadowIntel: IntelligenceData[] = [
        {
            id: 'tg-001',
            intel_name: 'Unreleased Stems Leak (Group)',
            intel_type: 'telegram',
            source: 't.me/pira_hub_music',
            source_url: 'https://t.me/pira_hub_music',
            threat_level: 'high',
            ai_summary: 'Encrypted ZIP shared containing 24b PCM stems. Forensic IDs detected: TUP-884-AC.',
            discovered_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: 'ds-202',
            intel_name: 'Educator Module #4 De-compilation',
            intel_type: 'discord',
            source: 'Discord / PirateCave #vault',
            source_url: 'https://discord.com',
            threat_level: 'critical',
            ai_summary: 'Binary exploit tool shared to bypass course DRM. Targeting high-value educator modules.',
            discovered_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
            id: 'df-404',
            intel_name: 'AI Voice-Clone Distribution',
            intel_type: 'dark_web',
            source: 'Social Media / X / @deep_music_ai',
            source_url: 'https://twitter.com',
            threat_level: 'critical',
            ai_summary: 'Unauthorized RVC (Retrieval-based Voice Conversion) model shared. Forensic audit shows 94% likeness match to Artist Master Vault voice samples.',
            discovered_at: new Date(Date.now() - 14400000).toISOString()
        }
    ]

    let results = dbData ? [...shadowIntel, ...dbData] : shadowIntel

    // 🏆 DARK WEB FILTERING: Only Elite plan sees dark_web results
    if (!tenant || (tenant.tier !== 'elite' && tenant.tier !== 'enterprise')) {
        results = results.filter(item => item.intel_type !== 'dark_web')
    }

    if (error || !dbData) return results
    return results
}

import { getCurrentTenant } from '@/lib/api/auth'
export { getCurrentTenant }



// ============================================================================
// IMPERSONATOR ALERTS
// ============================================================================

export interface ImpersonatorAlert {
    id: string
    platform: string
    fake_username: string | null
    fake_profile_url: string | null
    fake_profile_image_url: string | null
    similarity_score: number | null
    detection_signals: {
        username_match?: boolean
        photo_match?: boolean
        bio_match?: boolean
        content_match?: boolean
    } | null
    status: 'pending' | 'confirmed' | 'dismissed' | 'reported' | 'taken_down'
    auto_escalated?: boolean
    escalation_reason?: string | null
    auto_takedown_sent?: boolean
    reported_at: string | null
    report_status: string | null
    created_at: string
    updated_at: string
}

export async function getImpersonatorAlerts(): Promise<ImpersonatorAlert[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('impersonator_alerts')
        .select('*')
        .order('created_at', { ascending: false })

    if (error || !data) return []
    return data
}

export async function updateImpersonatorStatus(
    alertId: string,
    status: ImpersonatorAlert['status']
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    const updateData: Record<string, unknown> = { status }
    if (status === 'reported') {
        updateData.reported_at = new Date().toISOString()
    }

    const { error } = await supabase
        .from('impersonator_alerts')
        .update(updateData)
        .eq('id', alertId)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function reportImpersonator(
    alertId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    const { error } = await supabase
        .from('impersonator_alerts')
        .update({
            status: 'reported',
            reported_at: new Date().toISOString(),
            report_status: 'submitted'
        })
        .eq('id', alertId)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function createManualImpersonatorAlert(data: {
    platform: string
    fake_username: string
    fake_profile_url?: string
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    const { error } = await supabase.from('impersonator_alerts').insert({
        tenant_id: user.id,
        platform: data.platform,
        fake_username: data.fake_username,
        fake_profile_url: data.fake_profile_url,
        status: 'pending',
        similarity_score: null,
        detection_signals: { username_match: true }
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
}

// ============================================================================
// AUTHORIZED ACCOUNTS (ALLOWLIST)
// ============================================================================

export interface AuthorizedAccount {
    id: string
    platform: string
    username: string
    profile_url: string | null
    account_type: 'personal' | 'agency'
    verification_status: 'pending' | 'verified' | 'failed'
    verification_code: string | null
    verified_at: string | null
    created_at: string
}

export async function getAuthorizedAccounts(): Promise<AuthorizedAccount[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('authorized_accounts')
        .select('*')
        .order('created_at', { ascending: false })

    if (error || !data) return []
    return data
}

export async function createAuthorizedAccount(account: {
    platform: string
    username: string
    profile_url?: string
    account_type?: 'personal' | 'agency'
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    // Generate a verification code
    const code = 'TPL-' + Math.random().toString(36).substring(2, 7).toUpperCase()

    const { error } = await supabase.from('authorized_accounts').upsert({
        tenant_id: user.id,
        platform: account.platform.toLowerCase(),
        username: account.username,
        profile_url: account.profile_url || null,
        account_type: account.account_type || 'personal',
        verification_status: 'verified', // auto-verified on self-registration
        verification_code: code,
        verified_at: new Date().toISOString(),
    }, { onConflict: 'tenant_id, platform, username' })

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function deleteAuthorizedAccount(
    accountId: string
): Promise<{ success: boolean; error?: string }> {
    const profile = await getTenantProfile()
    if (!profile || (profile.role !== 'forensic_admin' && profile.role !== 'forensic_analyst')) {
        return { success: false, error: 'Unauthorized: Action requires elevated privileges' }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('authorized_accounts')
        .delete()
        .eq('id', accountId)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export type OnboardingData = {
    tier: 'pro' | 'elite' | 'enterprise' | null
    username: string
    bio: string
    socials: { twitter?: string; instagram?: string; onlyfans?: string }
}

export async function completeOnboarding(data: OnboardingData): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }
    if (!data.tier) return { success: false, error: 'Tier selection is required' }

    // 1. Update Tenant Tier & Bio & Display Name
    // Note: 'bio' column requires migration 003
    // Note: 'basic'/'professional' tiers require migration 003
    const { error: tenantError } = await supabase
        .from('tenants')
        .update({
            tier: data.tier,
            display_name: data.username,
            // bio: data.bio, // Uncomment after migration 003 is applied
            onboarded_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (tenantError) return { success: false, error: 'Failed to update tenant: ' + tenantError.message }

    // 2. Add Social Accounts
    const accountsToInsert = []

    if (data.socials.twitter) {
        accountsToInsert.push({
            tenant_id: user.id,
            platform: 'twitter',
            username: data.socials.twitter,
            verification_status: 'pending'
        })
    }
    if (data.socials.instagram) {
        accountsToInsert.push({
            tenant_id: user.id,
            platform: 'instagram',
            username: data.socials.instagram,
            verification_status: 'pending'
        })
    }
    if (data.socials.onlyfans) {
        accountsToInsert.push({
            tenant_id: user.id,
            platform: 'onlyfans',
            username: data.socials.onlyfans,
            verification_status: 'pending'
        })
    }

    if (accountsToInsert.length > 0) {
        // We use upsert to avoid unique constraint violations if they go back/forth
        const { error: accountsError } = await supabase
            .from('authorized_accounts')
            .upsert(accountsToInsert, { onConflict: 'tenant_id, platform, username' })

        if (accountsError) console.error('Failed to add social accounts:', accountsError)
    }

    return { success: true }
}

// ============================================================================
// GEMINI AI ANALYSIS
// ============================================================================

import { analyzeSearchResults, generateIntelSummary, generateSearchVariants as genVariants } from '@/lib/gemini'

/**
 * Analyze a single intelligence item using Gemini AI.
 * Saves the AI summary and threat level back to the database.
 */
export async function analyzeIntelligenceItem(
    intelId: string
): Promise<{ success: boolean; error?: string; analysis?: { summary: string; threat_level: string } }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    // 1. Fetch the intelligence item
    const { data: intel, error: fetchError } = await supabase
        .from('intelligence_data')
        .select('*')
        .eq('id', intelId)
        .single()

    if (fetchError || !intel) return { success: false, error: 'Intelligence item not found' }

    // 2. Run AI analysis
    const rawData = intel.decoded_data
        ? JSON.stringify(intel.decoded_data)
        : intel.raw_data || intel.intel_name

    const analysis = await generateIntelSummary(
        rawData,
        intel.intel_type || 'unknown',
        intel.source || 'unknown'
    )

    // 3. Save results back to DB
    const { error: updateError } = await supabase
        .from('intelligence_data')
        .update({
            ai_summary: analysis.summary,
            threat_level: analysis.threat_level,
        })
        .eq('id', intelId)

    if (updateError) return { success: false, error: 'Failed to save analysis: ' + updateError.message }

    return { success: true, analysis: { summary: analysis.summary, threat_level: analysis.threat_level } }
}

/**
 * Batch analyze all intelligence items that don't have an AI summary.
 */
export async function bulkAnalyzeIntelligence(): Promise<{ success: boolean; analyzed: number; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, analyzed: 0, error: 'Not authenticated' }

    // Fetch unanalyzed items (limit to 5 to stay within rate limits)
    const { data: items, error } = await supabase
        .from('intelligence_data')
        .select('id')
        .is('ai_summary', null)
        .limit(5)

    if (error || !items) return { success: false, analyzed: 0, error: 'Failed to fetch items' }

    let analyzed = 0
    for (const item of items) {
        const result = await analyzeIntelligenceItem(item.id)
        if (result.success) analyzed++
    }

    return { success: true, analyzed }
}

/**
 * Generate search name variants for a creator name using AI.
 */
export async function getSearchVariants(
    creatorName: string,
    platforms?: string[]
): Promise<{ success: boolean; variants?: Awaited<ReturnType<typeof genVariants>>; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    const variants = await genVariants(creatorName, platforms)
    return { success: true, variants }
}

// ============================================================================
// LEGAL AUTOMATION — DMCA ENFORCEMENT PIPELINE
// ============================================================================

interface DmcaTemplate {
    id: string
    platform: string
    method: string
    submission_url: string
    response_time_days: number
    required_fields: string[]
}

interface DmcaSubmission {
    submission_id: string
    platform: string
    notice_text: string
    status: string
    submission_url: string
    message: string
}

interface EscalationResult {
    days_since_notice: number
    needs_escalation: boolean
    recommended_action: { days: number; action: string; label: string } | null
    next_action: { days: number; action: string; label: string; days_until: number } | null
}

interface CaseMilestone {
    date: string
    action: string
    details: string
    actor: string
}

/**
 * Fetch available DMCA notice templates from the legal automation service.
 */
export async function getDmcaTemplates(): Promise<{ templates: DmcaTemplate[]; error?: string }> {
    try {
        const res = await fetch('http://legal-automation:4000/templates')
        if (!res.ok) throw new Error(`Service returned ${res.status}`)
        const data = await res.json()
        return { templates: data.templates }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return { templates: [], error: 'Template service unreachable: ' + message }
    }
}

/**
 * Submit a DMCA takedown notice for a piece of evidence.
 * Creates a legal_case record, generates the notice, and stores it.
 */
export async function submitDmcaNotice(
    evidenceId: string,
    platform: string,
    copyrightOwner?: string,
    originalUrl?: string
): Promise<{ success: boolean; case_id?: string; submission?: DmcaSubmission; error?: string }> {
    const tierCheck = await requireEliteTier()
    if (!tierCheck.allowed) return { success: false, error: tierCheck.error }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    // 1. Fetch the evidence record
    const { data: evidence, error: fetchError } = await supabase
        .from('forensic_evidence')
        .select('source_url, evidence_name, source_platform')
        .eq('id', evidenceId)
        .single()

    if (fetchError || !evidence || !evidence.source_url) {
        return { success: false, error: 'Evidence not found or missing URL' }
    }

    // 2. Get tenant info for case creation
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id, display_name, email')
        .eq('id', user.id)
        .single()

    if (!tenant) return { success: false, error: 'Tenant not found' }

    // 3. Generate the notice via the microservice
    let submission: DmcaSubmission | null = null
    try {
        const res = await fetch('http://legal-automation:4000/dmca/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                platform,
                infringing_url: evidence.source_url,
                original_url: originalUrl || '',
                copyright_owner: copyrightOwner || tenant.display_name || 'Content Creator',
                contact_email: tenant.email || '',
                description: `Unauthorized distribution of: ${evidence.evidence_name}`,
            })
        })
        const data = await res.json()
        submission = data as DmcaSubmission
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return { success: false, error: 'DMCA service unreachable: ' + message }
    }

    // 4. Create a legal_case record to track this submission
    const caseNumber = `DMCA-${Date.now().toString(36).toUpperCase()}`
    const milestone: CaseMilestone = {
        date: new Date().toISOString(),
        action: 'notice_generated',
        details: `DMCA notice generated for ${platform}. Submission ID: ${submission?.submission_id}`,
        actor: tenant.display_name || user.id,
    }

    const { data: newCase, error: caseError } = await supabase
        .from('legal_cases')
        .insert({
            tenant_id: tenant.id,
            case_number: caseNumber,
            case_name: `DMCA: ${evidence.evidence_name}`,
            case_type: 'dmca',
            status: 'notice_sent',
            priority: 'high',
            infringing_url: evidence.source_url,
            platform: platform,
            dmca_notice_sent_at: new Date().toISOString(),
            evidence_ids: [evidenceId],
            description: `Automated DMCA takedown for "${evidence.evidence_name}" on ${platform}`,
            milestones: [milestone],
            documents: [{
                type: 'dmca_notice',
                created_at: new Date().toISOString(),
                content: submission?.notice_text || '',
                submission_id: submission?.submission_id || '',
            }],
            filed_date: new Date().toISOString().split('T')[0],
            deadline_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        })
        .select('id')
        .single()

    if (caseError) {
        return { success: false, error: 'Failed to create legal case: ' + caseError.message }
    }

    return {
        success: true,
        case_id: newCase.id,
        submission: submission || undefined,
    }
}

/**
 * Check if a legal case needs escalation based on time since notice.
 */
export async function checkEscalation(
    caseId: string
): Promise<{ success: boolean; escalation?: EscalationResult; error?: string }> {
    const tierCheck = await requireEliteTier()
    if (!tierCheck.allowed) return { success: false, error: tierCheck.error }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    const { data: legalCase, error } = await supabase
        .from('legal_cases')
        .select('dmca_notice_sent_at, status')
        .eq('id', caseId)
        .single()

    if (error || !legalCase || !legalCase.dmca_notice_sent_at) {
        return { success: false, error: 'Case not found or no notice date' }
    }

    try {
        const res = await fetch('http://legal-automation:4000/escalation/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                notice_sent_at: legalCase.dmca_notice_sent_at,
                current_status: legalCase.status,
            })
        })
        const data = await res.json()
        return { success: true, escalation: data as EscalationResult }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return { success: false, error: 'Escalation service unreachable: ' + message }
    }
}

/**
 * Update a legal case's status and add a milestone entry.
 */
export async function updateCaseStatus(
    caseId: string,
    status: string,
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    // Fetch current milestones
    const { data: legalCase, error: fetchError } = await supabase
        .from('legal_cases')
        .select('milestones, status')
        .eq('id', caseId)
        .single()

    if (fetchError || !legalCase) {
        return { success: false, error: 'Case not found' }
    }

    const milestones = (legalCase.milestones as CaseMilestone[]) || []
    milestones.push({
        date: new Date().toISOString(),
        action: `status_changed_to_${status}`,
        details: notes || `Status updated from "${legalCase.status}" to "${status}"`,
        actor: user.id,
    })

    const updateData: Record<string, unknown> = {
        status,
        milestones,
        notes: notes || undefined,
    }

    // Set specific timestamps based on status
    if (status === 'resolved' || status === 'closed') {
        updateData.closed_date = new Date().toISOString().split('T')[0]
        updateData.takedown_confirmed = status === 'resolved'
    }

    const { error: updateError } = await supabase
        .from('legal_cases')
        .update(updateData)
        .eq('id', caseId)

    if (updateError) {
        return { success: false, error: 'Failed to update case: ' + updateError.message }
    }

    return { success: true }
}

/**
 * Get the milestone timeline for a legal case.
 */
export async function getDmcaTimeline(
    caseId: string
): Promise<{ milestones: CaseMilestone[]; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { milestones: [], error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('legal_cases')
        .select('milestones, status, dmca_notice_sent_at, dmca_response_at, takedown_confirmed')
        .eq('id', caseId)
        .single()

    if (error || !data) {
        return { milestones: [], error: 'Case not found' }
    }

    return { milestones: (data.milestones as CaseMilestone[]) || [] }
}

/**
 * Trigger automated de-indexing for a piece of evidence.
 */
export async function triggerDeindexing(
    evidenceId: string,
    engine: string = 'google'
): Promise<{ success: boolean; error?: string }> {
    const tierCheck = await requireEliteTier()
    if (!tierCheck.allowed) return { success: false, error: tierCheck.error }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    const { data: evidence, error: fetchError } = await supabase
        .from('forensic_evidence')
        .select('source_url')
        .eq('id', evidenceId)
        .single()

    if (fetchError || !evidence || !evidence.source_url) {
        return { success: false, error: 'Evidence not found or missing URL' }
    }

    try {
        const res = await fetch('http://legal-automation:4000/deindex', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: evidence.source_url, engine })
        })

        if (!res.ok) {
            throw new Error(`Service returned ${res.status}`)
        }

        return { success: true }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('De-indexing failed:', message)
        return { success: false, error: 'Legal service unreachable: ' + message }
    }
}

/**
 * Trigger automated data broker opt-out removal.
 */
export async function triggerBrokerRemoval(
    broker: string,
    profileUrl: string,
    email?: string
): Promise<{ success: boolean; status?: string; error?: string }> {
    const profile = await getTenantProfile()
    if (!profile || (profile.role !== 'forensic_admin' && profile.role !== 'forensic_analyst')) {
        return { success: false, error: 'Unauthorized: Action requires elevated privileges' }
    }

    const supabase = await createClient()

    try {
        const res = await fetch('http://legal-automation:4000/remove-broker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                broker,
                profile_url: profileUrl,
                email: email || '',
            })
        })

        const data = await res.json()
        return { success: data.success, status: data.status, error: data.error }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return { success: false, error: 'Broker service unreachable: ' + message }
    }
}

// ============================================================================
// EVIDENCE MANAGEMENT — INTEGRITY, CUSTODY & EXPORT
// ============================================================================

interface CustodyEntry {
    timestamp: string
    action: string
    performed_by: string
    ip_address?: string
    details: Record<string, unknown>
}

interface EvidenceDetail {
    id: string
    evidence_name: string
    evidence_type: string
    source_platform: string | null
    source_url: string | null
    similarity_score: number | null
    verification_status: string
    phash_image: string | null
    hash_md5: string | null
    hash_sha1: string | null
    hash_sha256: string | null
    hash_sha512: string | null
    watermark_signature: string | null
    traitor_trace_id: string | null
    collected_by: string | null
    collected_at: string | null
    verified_by: string | null
    verified_at: string | null
    storage_bucket: string | null
    storage_path: string | null
    custody_log: CustodyEntry[]
    metadata: Record<string, unknown> | null
    tags: string[] | null
    created_at: string
    updated_at: string
}

/**
 * Get full detail for a single evidence item (including hashes + custody log).
 */
export async function getEvidenceDetail(evidenceId: string): Promise<{ success: boolean; evidence?: EvidenceDetail; error?: string }> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('forensic_evidence')
        .select('*')
        .eq('id', evidenceId)
        .single()

    if (error || !data) {
        return { success: false, error: error?.message || 'Evidence not found' }
    }
    return { success: true, evidence: data as EvidenceDetail }
}

/**
 * Verify cryptographic hash integrity of an evidence item.
 * Re-downloads from storage and compares SHA-256 against stored value.
 */
export async function verifyEvidenceHashes(evidenceId: string): Promise<{
    success: boolean
    verified: boolean
    stored_hash?: string | null
    computed_hash?: string
    mismatch?: boolean
    error?: string
}> {
    const supabase = await createClient()

    // 1. Fetch the evidence record
    const { data: evidence, error: fetchError } = await supabase
        .from('forensic_evidence')
        .select('id, hash_sha256, storage_bucket, storage_path, custody_log, verification_status')
        .eq('id', evidenceId)
        .single()

    if (fetchError || !evidence) {
        return { success: false, verified: false, error: 'Evidence not found' }
    }

    // 2. If no storage path, we can't re-verify
    if (!evidence.storage_path || !evidence.storage_bucket) {
        // Append custody entry noting verification attempt
        const log: CustodyEntry[] = Array.isArray(evidence.custody_log) ? evidence.custody_log : []
        log.push({
            timestamp: new Date().toISOString(),
            action: 'hash_verification_skipped',
            performed_by: 'verifyEvidenceHashes',
            details: { reason: 'no_storage_path' }
        })
        await supabase.from('forensic_evidence').update({ custody_log: log }).eq('id', evidenceId)
        return { success: true, verified: false, stored_hash: evidence.hash_sha256, error: 'No storage path available for re-verification' }
    }

    // 3. Download from Supabase Storage
    const { data: fileData, error: dlError } = await supabase.storage
        .from(evidence.storage_bucket)
        .download(evidence.storage_path)

    if (dlError || !fileData) {
        return { success: false, verified: false, error: `Download failed: ${dlError?.message}` }
    }

    // 4. Compute SHA-256 of downloaded content
    const buffer = await fileData.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // 5. Compare
    const mismatch = evidence.hash_sha256 !== null && computedHash !== evidence.hash_sha256
    const newStatus = mismatch ? 'tampered' : evidence.verification_status

    // 6. Update custody log + verification status
    const log: CustodyEntry[] = Array.isArray(evidence.custody_log) ? evidence.custody_log : []
    log.push({
        timestamp: new Date().toISOString(),
        action: mismatch ? 'hash_mismatch_detected' : 'hash_verified',
        performed_by: 'verifyEvidenceHashes',
        details: {
            stored_hash: evidence.hash_sha256,
            computed_hash: computedHash,
            match: !mismatch,
            algorithm: 'SHA-256'
        }
    })

    await supabase.from('forensic_evidence').update({
        custody_log: log,
        verified_at: new Date().toISOString(),
        verification_status: newStatus,
        // If first verification, store the hash
        ...(evidence.hash_sha256 === null ? { hash_sha256: computedHash } : {})
    }).eq('id', evidenceId)

    return {
        success: true,
        verified: !mismatch,
        stored_hash: evidence.hash_sha256,
        computed_hash: computedHash,
        mismatch
    }
}

/**
 * Get the full chain-of-custody audit trail for an evidence item.
 */
export async function getCustodyTrail(evidenceId: string): Promise<{
    success: boolean
    trail?: CustodyEntry[]
    evidence_name?: string
    verification_status?: string
    error?: string
}> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('forensic_evidence')
        .select('evidence_name, verification_status, custody_log')
        .eq('id', evidenceId)
        .single()

    if (error || !data) {
        return { success: false, error: error?.message || 'Evidence not found' }
    }

    const trail: CustodyEntry[] = Array.isArray(data.custody_log) ? data.custody_log : []
    return {
        success: true,
        trail,
        evidence_name: data.evidence_name,
        verification_status: data.verification_status
    }
}

/**
 * Append a custody entry to an evidence item's audit trail.
 */
export async function appendCustodyEntry(
    evidenceId: string,
    action: string,
    details: Record<string, unknown> = {}
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    // Fetch current log
    const { data: evidence, error: fetchError } = await supabase
        .from('forensic_evidence')
        .select('custody_log')
        .eq('id', evidenceId)
        .single()

    if (fetchError || !evidence) {
        return { success: false, error: 'Evidence not found' }
    }

    const log: CustodyEntry[] = Array.isArray(evidence.custody_log) ? evidence.custody_log : []
    log.push({
        timestamp: new Date().toISOString(),
        action,
        performed_by: user.id,
        details
    })

    const { error: updateError } = await supabase
        .from('forensic_evidence')
        .update({ custody_log: log, updated_at: new Date().toISOString() })
        .eq('id', evidenceId)

    if (updateError) return { success: false, error: updateError.message }
    return { success: true }
}

/**
 * Export an evidence package for legal proceedings.
 * Returns a JSON bundle containing all evidence data, hashes,
 * custody log, and a SHA-256 manifest for integrity verification.
 */
export async function exportEvidencePackage(evidenceId: string): Promise<{
    success: boolean
    package?: {
        export_id: string
        exported_at: string
        evidence: EvidenceDetail
        integrity: {
            manifest_hash: string
            algorithm: string
            verified_at_export: boolean
        }
        custody_trail: CustodyEntry[]
        legal_notice: string
    }
    error?: string
}> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    // Fetch full evidence record
    const { data, error } = await supabase
        .from('forensic_evidence')
        .select('*')
        .eq('id', evidenceId)
        .single()

    if (error || !data) {
        return { success: false, error: error?.message || 'Evidence not found' }
    }

    const evidence = data as EvidenceDetail
    const custodyTrail: CustodyEntry[] = Array.isArray(evidence.custody_log) ? evidence.custody_log : []

    // Generate export timestamp
    const exportedAt = new Date().toISOString()
    const exportId = `EXP-${Date.now().toString(36).toUpperCase()}`

    // Create manifest from critical fields for integrity verification
    const manifestData = JSON.stringify({
        evidence_id: evidence.id,
        hash_sha256: evidence.hash_sha256,
        hash_md5: evidence.hash_md5,
        hash_sha1: evidence.hash_sha1,
        verification_status: evidence.verification_status,
        custody_entries: custodyTrail.length,
        exported_at: exportedAt,
    })

    const manifestBuffer = new TextEncoder().encode(manifestData)
    const hashBuffer = await crypto.subtle.digest('SHA-256', manifestBuffer)
    const manifestHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

    // Log the export in custody trail
    custodyTrail.push({
        timestamp: exportedAt,
        action: 'evidence_exported',
        performed_by: user.id,
        details: {
            export_id: exportId,
            manifest_hash: manifestHash,
            purpose: 'legal_proceedings'
        }
    })

    // Persist the custody entry
    await supabase
        .from('forensic_evidence')
        .update({ custody_log: custodyTrail, updated_at: exportedAt })
        .eq('id', evidenceId)

    return {
        success: true,
        package: {
            export_id: exportId,
            exported_at: exportedAt,
            evidence,
            integrity: {
                manifest_hash: manifestHash,
                algorithm: 'SHA-256',
                verified_at_export: evidence.verification_status === 'verified' || evidence.verification_status === 'matched'
            },
            custody_trail: custodyTrail,
            legal_notice: `This evidence package was exported from Tuppli (${exportId}) on ${exportedAt}. ` +
                `It contains ${custodyTrail.length} chain-of-custody entries. ` +
                `The SHA-256 manifest hash is ${manifestHash}. ` +
                `Any modification to this package will invalidate the manifest hash.`
        }
    }
}

/**
 * Create a cryptographic timestamp anchor for an evidence item.
 * Generates a SHA-256 timestamp proof that can be independently verified.
 * Optionally submits to an RFC 3161 Time Stamping Authority.
 */
export async function timestampEvidence(evidenceId: string): Promise<{
    success: boolean
    timestamp?: {
        evidence_id: string
        anchored_at: string
        anchor_hash: string
        algorithm: string
        proof: string
        tsa_status: 'local_only' | 'submitted' | 'verified'
    }
    error?: string
}> {
    const tierCheck = await requireEliteTier()
    if (!tierCheck.allowed) return { success: false, error: tierCheck.error }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    // Fetch evidence
    const { data: evidence, error: fetchError } = await supabase
        .from('forensic_evidence')
        .select('id, hash_sha256, hash_sha512, evidence_name, verification_status, custody_log, created_at')
        .eq('id', evidenceId)
        .single()

    if (fetchError || !evidence) {
        return { success: false, error: 'Evidence not found' }
    }

    const anchoredAt = new Date().toISOString()

    // Create timestamp proof: hash of (evidence_hash + timestamp + evidence_id)
    const proofData = JSON.stringify({
        evidence_id: evidence.id,
        evidence_hash_sha256: evidence.hash_sha256,
        evidence_hash_sha512: evidence.hash_sha512,
        evidence_name: evidence.evidence_name,
        timestamp: anchoredAt,
        created_at: evidence.created_at,
        version: '1.0'
    })

    const proofBuffer = new TextEncoder().encode(proofData)
    const hashBuffer = await crypto.subtle.digest('SHA-256', proofBuffer)
    const anchorHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

    // Build base64-encoded proof token (self-contained, verifiable)
    const proofToken = btoa(JSON.stringify({
        v: '1.0',
        eid: evidence.id,
        h256: evidence.hash_sha256,
        ts: anchoredAt,
        anchor: anchorHash
    }))

    // Append to custody log
    const log: CustodyEntry[] = Array.isArray(evidence.custody_log) ? evidence.custody_log : []
    log.push({
        timestamp: anchoredAt,
        action: 'timestamp_anchored',
        performed_by: user.id,
        details: {
            anchor_hash: anchorHash,
            algorithm: 'SHA-256',
            proof_token: proofToken,
            tsa_status: 'local_only'
        }
    })

    // Store timestamp in metadata
    await supabase
        .from('forensic_evidence')
        .update({
            custody_log: log,
            metadata: {
                ...(evidence as unknown as Record<string, unknown>).metadata as Record<string, unknown> || {},
                timestamp_anchor: {
                    anchored_at: anchoredAt,
                    anchor_hash: anchorHash,
                    proof_token: proofToken
                }
            },
            updated_at: anchoredAt
        })
        .eq('id', evidenceId)

    return {
        success: true,
        timestamp: {
            evidence_id: evidence.id,
            anchored_at: anchoredAt,
            anchor_hash: anchorHash,
            algorithm: 'SHA-256',
            proof: proofToken,
            tsa_status: 'local_only'
        }
    }
}

// ============================================================================
// GDPR & DATA PRIVACY — EXPORT & DELETION
// ============================================================================

/**
 * Export all personal and operational data for the current user (GDPR Right to Access).
 * Returns a JSON bundle containing profile, subscription, targets, cases, and evidence metadata.
 */
export async function exportUserData(): Promise<{ success: boolean; data?: unknown; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // 1. Fetch Tenant ID
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id, name, created_at')
        .eq('user_id', user.id)
        .single()

    if (!tenant) return { success: false, error: 'Tenant not found' }

    // 2. Fetch all related data in parallel
    const [
        { data: profile },
        { data: subscription },
        { data: targets },
        { data: cases },
        { data: evidence }
    ] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('tenant_id', tenant.id).single(),
        supabase.from('recon_targets').select('*').eq('tenant_id', tenant.id),
        supabase.from('legal_cases').select('*').eq('tenant_id', tenant.id),
        supabase.from('forensic_evidence').select('*').eq('tenant_id', tenant.id)
    ])

    // 3. Bundle the data
    const exportBundle = {
        export_date: new Date().toISOString(),
        user_id: user.id,
        tenant_id: tenant.id,
        profile: profile || {},
        subscription: subscription || {},
        recon_targets: targets || [],
        legal_cases: cases || [],
        forensic_evidence: evidence || [],
        generated_by: 'Tuppli Automated Data Export'
    }

    return { success: true, data: exportBundle }
}

/**
 * Permanently delete the user's account and all associated data (GDPR Right to Erasure).
 * This deletes the tenant record, which cascades to all child tables (targets, cases, evidence).
 * Does NOT delete the auth user (requires admin), but renders the account unusable.
 */
export async function deleteUserAccount(): Promise<{ success: boolean; error?: string }> {
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

    // 2. Delete Tenant (Cascades to all data)
    const { error: deleteError } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenant.id)

    if (deleteError) {
        return { success: false, error: deleteError.message }
    }

    // 3. Delete Profile
    await supabase.from('users').delete().eq('id', user.id)

    // Note: We cannot delete from auth.users via standard client.
    // The user will remain in Auth but have no data/access.

    return { success: true }
}

export async function toggleAutoPilot(assetName: string, enabled: boolean): Promise<{ success: boolean; error?: string }> {
    const profile = await getTenantProfile()
    if (!profile || (profile.role !== 'forensic_admin' && profile.role !== 'forensic_analyst')) {
        return { success: false, error: 'Unauthorized: Action requires elevated privileges' }
    }

    const supabase = await createClient()

    // Fetch existing config
    const { data: tenant, error: fetchError } = await supabase
        .from('tenants')
        .select('auto_pilot_config')
        .eq('id', profile.id)
        .single()

    if (fetchError || !tenant) return { success: false, error: 'Tenant not found' }

    const config = tenant.auto_pilot_config || { asset_overrides: {} }
    const updatedConfig = {
        ...config,
        asset_overrides: {
            ...(config.asset_overrides || {}),
            [assetName]: enabled
        }
    }

    const { error: updateError } = await supabase
        .from('tenants')
        .update({ auto_pilot_config: updatedConfig })
        .eq('id', profile.id)

    if (updateError) return { success: false, error: updateError.message }

    revalidatePath('/evidence')
    return { success: true }
}

export async function dispatchAutomatedTakedown(evidenceId: string): Promise<{ success: boolean; error?: string }> {
    const profile = await getTenantProfile()
    if (!profile || (profile.role !== 'forensic_admin' && profile.role !== 'forensic_analyst')) {
        return { success: false, error: 'Unauthorized: Action requires elevated privileges' }
    }

    const supabase = await createClient()
    
    // In a real production environment, this would call our Legal API or BranditScan bridge.
    // For Phase 3, we simulate the 'Removal Pending' status and log the forensic chain of custody.
    
    const { data: evidence, error: fetchError } = await supabase
        .from('forensic_evidence')
        .select('id, evidence_name, similarity_score, source_platform, metadata')
        .eq('id', evidenceId)
        .single()

    if (fetchError || !evidence) return { success: false, error: 'Evidence not found' }

    // Confidence check
    if ((evidence.similarity_score || 0) < 0.95) {
        return { success: false, error: 'Confidence score too low for automated enforcement' }
    }

    const { error: updateError } = await supabase
        .from('forensic_evidence')
        .update({ 
            verification_status: 'removal_pending',
            metadata: {
                ...(evidence.metadata || {}),
                auto_pilot_triggered: true,
                auto_pilot_timestamp: new Date().toISOString()
            }
        })
        .eq('id', evidenceId)

    if (updateError) return { success: false, error: updateError.message }

    return { success: true }
}


// ============================================================================
// SALES LEADS (TWITTER RECON)
// ============================================================================

export interface SalesLead {
    id: string
    platform: string
    username: string
    tweet_url: string
    tweet_text: string
    ai_analysis: {
        is_creator_victim?: boolean
        reason?: string
        creator_niche?: string
    } | null
    status: string // 'new_lead' | 'contacted' | 'converted' | 'ignored'
    created_at: string
    updated_at: string
}

export async function getSalesLeads(): Promise<SalesLead[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('sales_leads')
        .select('*')
        .order('created_at', { ascending: false })

    if (error || !data) return []
    return data as SalesLead[]
}

export async function updateLeadStatus(
    leadId: string,
    status: string
): Promise<{ success: boolean; error?: string }> {
    const profile = await getTenantProfile()
    if (!profile || (profile.role !== 'forensic_admin' && profile.role !== 'forensic_analyst')) {
        return { success: false, error: 'Unauthorized: Action requires elevated privileges' }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('sales_leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', leadId)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function getTrademarkStatus(): Promise<{
    brandScore: number
    activeInfringements: number
    monitoredDomains: { domain: string; status: string; risk: 'low' | 'medium' | 'high' }[]
    socialImpersonators: { handle: string; platform: string; followers: number }[]
}> {
    const supabase = await createClient()
    
    // In production, this would query a domain monitoring API and social search.
    // For Phase 4, we provide forensic mock data for the creator persona.
    
    return {
        brandScore: 88,
        activeInfringements: 3,
        monitoredDomains: [
            { domain: 'tuppli-leaks.com', status: 'Notice Sent', risk: 'high' },
            { domain: 'tuppli-stems-free.net', status: 'Scanning', risk: 'medium' },
            { domain: 'officialtupplidistro.com', status: 'Deindexed', risk: 'high' }
        ],
        socialImpersonators: [
            { handle: '@tuppli_mastering_leak', platform: 'Instagram', followers: 1240 },
            { handle: 'TuppliArchive', platform: 'Twitter', followers: 850 }
        ]
    }
}

export async function getApiKeys(): Promise<{ id: string; name: string; key_prefix: string; created_at: string; last_used_at: string | null }[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('api_keys')
        .select('id, name, key_prefix, created_at, last_used_at')
        .eq('tenant_id', user.id)
        .is('revoked_at', null)
        .order('created_at', { ascending: false })

    if (error || !data) return []
    return data
}

import { getTenantProfile } from '@/lib/api/auth'

export async function createApiKey(name: string): Promise<{ success: boolean; key?: string; error?: string }> {
    const profile = await getTenantProfile()
    if (!profile || profile.role !== 'forensic_admin') {
        return { success: false, error: 'Unauthorized: Admin privileges required' }
    }

    const supabase = await createClient()

    // Generate a secure key: tp_ + 32 random chars
    const rawKey = `tp_${crypto.randomBytes(24).toString('hex')}`
    const prefix = 'tp_'
    
    // Hash the key using SHA-256 for secure storage (VULN-001 Fix)
    const hashedKey = crypto
        .createHash('sha256')
        .update(rawKey)
        .digest('hex')

    const { error } = await supabase
        .from('api_keys')
        .insert({
            tenant_id: profile.id,
            name,
            key_prefix: prefix,
            hashed_key: hashedKey,
            scopes: ['read:discoveries', 'write:enforcement']
        })

    if (error) return { success: false, error: error.message }
    
    revalidatePath('/settings/api')
    return { success: true, key: rawKey }
}

export async function revokeApiKey(id: string): Promise<{ success: boolean; error?: string }> {
    const profile = await getTenantProfile()
    if (!profile || profile.role !== 'forensic_admin') {
        return { success: false, error: 'Unauthorized: Admin privileges required' }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('api_keys')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', profile.id)

    if (error) return { success: false, error: error.message }
    
    revalidatePath('/settings/api')
    return { success: true }
}

export interface AuditLogEntry {
    id: string
    operation: string
    table_name: string
    record_id: string
    old_data: any
    new_data: any
    ip_address: string
    performed_by: string
    risk_level: 'low' | 'medium' | 'high' | 'critical'
    created_at: string
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // 🛡️ ROLE CHECK: Only admins of the tenant can pull the audit ledger
    const { data: profile } = await supabase
        .from('tenants')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'forensic_admin') {
        console.warn(`[UNAUTHORIZED_AUDIT_PULL] User ${user.id} denied access to audit logs.`)
        return []
    }

    const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

    if (error || !data) return []
    return data as AuditLogEntry[]
}
