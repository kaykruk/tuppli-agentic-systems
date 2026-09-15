import { NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/server'
import { DiscoveriesQuerySchema, formatZodError } from '@/lib/api/validation'

/**
 * GET /api/v1/discoveries
 * 
 * Fetches all forensic discoveries associated with the tenant identity.
 * Scope required: read:discoveries
 */
export async function GET(request: Request) {
    // 1. Authenticate the key
    const auth = await validateApiKey(request)
    
    if (!auth.success) {
        return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // 2. Authorize scope
    if (!auth.scopes?.includes('read:discoveries')) {
        return NextResponse.json({ error: 'Insufficient permissions for this scope' }, { status: 403 })
    }

    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())

    // 2.1 STRICT VALIDATION (VULN_004 FIX)
    const validation = DiscoveriesQuerySchema.safeParse(queryParams)
    if (!validation.success) {
        return NextResponse.json(formatZodError(validation.error), { status: 400 })
    }

    const { limit, offset, status } = validation.data

    const supabase = await createClient()

    // 3. Retrieve forensic data
    let query = supabase
        .from('forensic_evidence')
        .select(`
            id,
            evidence_name,
            evidence_type,
            source_platform,
            source_url,
            similarity_score,
            verification_status,
            discovered_at,
            metadata
        `)
        .eq('tenant_id', auth.tenantId)
        .range(offset, offset + limit - 1)
        .order('discovered_at', { ascending: false })

    if (status) {
        query = query.eq('verification_status', status)
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: 'Forensic retrieval failed', details: error.message }, { status: 500 })
    }

    // 4. Transform to human-centric response (Removing AI lingo)
    const normalizedData = data.map(item => ({
        discovery_id: item.id,
        asset_identity: item.evidence_name,
        media_group: item.evidence_type,
        origin_hub: item.source_platform,
        location_url: item.source_url,
        match_confidence: item.similarity_score,
        enforcement_stage: item.verification_status,
        timestamp_detected: item.discovered_at,
        diagnostic_logs: item.metadata
    }))

    return NextResponse.json({
        object: 'list',
        count: normalizedData.length,
        discoveries: normalizedData,
        context: {
            tenant_id: auth.tenantId,
            scan_protocol: 'forensic_v1'
        }
    })
}
