import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSearchVariants } from '@/lib/gemini';
import { rankVariants } from '@/lib/variant-ranker';

/**
 * POST /api/ai/variants
 *
 * Generate search name variants for a creator name.
 *
 * Body: { creator_name: string, platforms?: string[], max_results?: number, min_score?: number }
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();

        // 1. Authenticate (User Session OR Internal API Key)
        const internalKey = req.headers.get('x-internal-api-key');
        const isInternal = internalKey && internalKey === process.env.INTERNAL_API_KEY;

        if (!isInternal) {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        // 2. Parse request
        const body = await req.json();
        const { creator_name, platforms, max_results, min_score } = body;

        if (!creator_name || typeof creator_name !== 'string') {
            return NextResponse.json({ error: 'Missing or invalid creator_name' }, { status: 400 });
        }

        // 3. Generate variants via Gemini
        const raw = await generateSearchVariants(creator_name, platforms);

        // 4. Rank, deduplicate, and filter
        const ranked = rankVariants(raw, creator_name, {
            maxResults: max_results ?? 25,
            minScore: min_score ?? 10,
            platforms: platforms ?? [],
        });

        return NextResponse.json({
            success: true,
            variants: raw,
            ranked,
            meta: {
                total_raw: (raw.misspellings?.length || 0) +
                    (raw.encodings?.length || 0) +
                    (raw.acrostics?.length || 0) +
                    (raw.platform_aliases?.length || 0),
                total_ranked: ranked.length,
                top_score: ranked[0]?.score ?? 0,
            },
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[AI Variants] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
