import { NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/server'
import { dispatchAutomatedTakedown } from '@/app/(dashboard)/actions'
import { EnforceSchema, formatZodError } from '@/lib/api/validation'

/**
 * POST /api/v1/enforce
 * 
 * Triggers a forensic enforcement action (takedown) for a specific discovery.
 * Scope required: write:enforcement
 */
export async function POST(request: Request) {
    // 1. Authenticate the key
    const auth = await validateApiKey(request)
    
    if (!auth.success) {
        return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // 2. Authorize scope
    if (!auth.scopes?.includes('write:enforcement')) {
        return NextResponse.json({ error: 'Insufficient permissions for this scope' }, { status: 403 })
    }

    // 3. Parse and validate body
    let body
    try {
        body = await request.json()
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    // 3.1 STRICT VALIDATION (VULN_004 FIX)
    const validation = EnforceSchema.safeParse(body)
    if (!validation.success) {
        return NextResponse.json(formatZodError(validation.error), { status: 400 })
    }

    const { discovery_id, custom_notes } = validation.data

    const supabase = await createClient()

    // 4. Verify ownership and state of the discovery
    const { data: item, error: fetchError } = await supabase
        .from('forensic_evidence')
        .select('*')
        .eq('id', discovery_id)
        .eq('tenant_id', auth.tenantId)
        .single()

    if (fetchError || !item) {
        return NextResponse.json({ error: 'Discovery not found or access denied' }, { status: 404 })
    }

    // 5. Dispatch the enforcement action
    // We reuse our existing server action logic for consistency
    try {
        const result = await dispatchAutomatedTakedown(discovery_id)
        
        if (result.success) {
            return NextResponse.json({
                success: true,
                enforcement_id: `enf_${Math.random().toString(36).substring(7)}`,
                status: 'dispatched',
                discovery_target: item.evidence_name,
                origin_hub: item.source_platform,
                timestamp: new Date().toISOString(),
                audit_log: `Action triggered via Lysis Connect API. Notes: ${custom_notes || 'None'}`
            })
        } else {
            return NextResponse.json({ error: 'Enforcement failed', details: result.error }, { status: 500 })
        }
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal system error', details: err.message }, { status: 500 })
    }
}
