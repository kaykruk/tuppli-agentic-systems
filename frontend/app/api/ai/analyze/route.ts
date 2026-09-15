import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeSearchResults, generateIntelSummary, assessThreatLevel } from '@/lib/gemini';

/**
 * POST /api/ai/analyze
 *
 * On-demand AI analysis for search results, intelligence, or evidence.
 *
 * Body: { type: 'search_results' | 'intel' | 'evidence', data: any, creator_name?: string }
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { requireEliteTier } = await import('@/lib/api/auth');

        // 1. Authenticate & Tier Check
        const tierCheck = await requireEliteTier();
        if (!tierCheck.allowed) {
            return NextResponse.json({ error: tierCheck.error }, { status: 403 });
        }

        // 2. Parse request
        const body = await req.json();
        const { type, data, creator_name } = body;

        // Security Hardening: Strict Type Bounds & Payload Limiting
        if (!type || !data) {
            return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
        }
        
        const MAX_DATA_LENGTH = 100_000; // Protect against memory exhaustion / prompt bloat
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        
        if (dataString.length > MAX_DATA_LENGTH) {
            return NextResponse.json({ error: 'Payload exceeds maximum allowed analysis size (100KB).' }, { status: 413 });
        }
        if (creator_name && typeof creator_name === 'string' && creator_name.length > 200) {
            return NextResponse.json({ error: 'Creator name field exceeds allowed bounds.' }, { status: 400 });
        }

        let result;

        switch (type) {
            case 'search_results':
                result = await analyzeSearchResults(
                    dataString,
                    creator_name || 'Unknown Creator'
                );
                break;

            case 'intel':
                result = await generateIntelSummary(
                    dataString,
                    data.intel_type || 'unknown',
                    data.source || 'unknown'
                );
                break;

            case 'evidence':
                result = await assessThreatLevel({
                    evidence_name: data.evidence_name || '',
                    evidence_type: data.evidence_type || '',
                    source_url: data.source_url || null,
                    source_platform: data.source_platform || null,
                    similarity_score: data.similarity_score || null,
                });
                break;

            default:
                return NextResponse.json({ error: `Unknown analysis type: ${type}` }, { status: 400 });
        }

        return NextResponse.json({ success: true, analysis: result });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[AI Analyze] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
