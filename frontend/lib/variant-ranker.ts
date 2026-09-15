/**
 * Variant Ranker & Filter
 *
 * Scores, ranks, deduplicates, and filters AI-generated search variants
 * so downstream consumers (RECON_HOURLY, Evidence pages) get a clean,
 * prioritised list of search terms.
 *
 * Scoring heuristics:
 *   • Edit-distance proximity to original name       → higher = better
 *   • Platform-specific pattern match                 → bonus points
 *   • Length plausibility (username constraints)       → filter outliers
 *   • Category weight (misspelling > alias > encoding > acrostic)
 */

import type { SearchVariants } from './gemini';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RankedVariant {
    /** The variant text itself */
    variant: string;
    /** Normalised score 0-100  (higher = more likely to find infringing content) */
    score: number;
    /** Which category produced this variant */
    category: 'misspelling' | 'encoding' | 'acrostic' | 'platform_alias' | 'other';
    /** Which platforms this variant is most likely to appear on */
    platforms: string[];
}

export interface RankingOptions {
    /** Maximum variants to return (default 25) */
    maxResults?: number;
    /** Minimum score threshold 0-100 (default 10) */
    minScore?: number;
    /** Target platforms to boost platform-specific aliases */
    platforms?: string[];
    /** Maximum variant length (default 30 – most platforms cap usernames) */
    maxLength?: number;
}

// ---------------------------------------------------------------------------
// Platform username constraints
// ---------------------------------------------------------------------------

const PLATFORM_MAX_LENGTH: Record<string, number> = {
    instagram: 30,
    twitter: 15,
    tiktok: 24,
    onlyfans: 50,
    reddit: 20,
    youtube: 100,
    fansly: 30,
};

const PLATFORM_ALLOWED_CHARS: Record<string, RegExp> = {
    instagram: /^[a-z0-9._]+$/i,
    twitter: /^[a-z0-9_]+$/i,
    tiktok: /^[a-z0-9._]+$/i,
    reddit: /^[a-z0-9_-]+$/i,
};

// ---------------------------------------------------------------------------
// Category base weights  (higher = more valuable for search)
// ---------------------------------------------------------------------------

const CATEGORY_WEIGHT: Record<string, number> = {
    misspelling: 85,
    platform_alias: 75,
    encoding: 55,
    acrostic: 40,
    other: 30,
};

// ---------------------------------------------------------------------------
// Levenshtein distance (for edit-distance scoring)
// ---------------------------------------------------------------------------

function levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost,
            );
        }
    }
    return dp[m][n];
}

// ---------------------------------------------------------------------------
// Core scoring
// ---------------------------------------------------------------------------

function scoreVariant(
    variant: string,
    originalName: string,
    category: string,
    targetPlatforms: string[],
): number {
    const baseWeight = CATEGORY_WEIGHT[category] ?? 30;

    // 1. Edit-distance bonus: closer to original = higher score
    const dist = levenshtein(variant, originalName);
    const maxLen = Math.max(variant.length, originalName.length, 1);
    const editDistScore = Math.max(0, 1 - dist / maxLen); // 0‒1

    // 2. Length plausibility: extremely short (<2) or very long (>50) get penalised
    let lengthPenalty = 0;
    if (variant.length < 2) lengthPenalty = 40;
    else if (variant.length > 50) lengthPenalty = 20;
    else if (variant.length > 30) lengthPenalty = 10;

    // 3. Platform compatibility bonus
    let platformBonus = 0;
    for (const p of targetPlatforms) {
        const maxL = PLATFORM_MAX_LENGTH[p];
        const regex = PLATFORM_ALLOWED_CHARS[p];
        if (maxL && variant.length <= maxL) platformBonus += 3;
        if (regex && regex.test(variant)) platformBonus += 5;
    }

    // 4. Name-contains bonus: original name substring appears
    const containsOriginal = variant.toLowerCase().includes(
        originalName.toLowerCase().replace(/\s+/g, ''),
    );
    const containsBonus = containsOriginal ? 10 : 0;

    // Weighted sum → 0‒100
    const raw =
        baseWeight * 0.45 +
        editDistScore * 100 * 0.25 +
        platformBonus * 0.1 +
        containsBonus -
        lengthPenalty * 0.2;

    return Math.round(Math.min(100, Math.max(0, raw)));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Rank, deduplicate, and filter AI-generated search variants.
 *
 * @param variants   Raw output from `generateSearchVariants()`
 * @param originalName  The creator's real name (used for distance scoring)
 * @param options    Ranking / filtering configuration
 */
export function rankVariants(
    variants: SearchVariants,
    originalName: string,
    options: RankingOptions = {},
): RankedVariant[] {
    const {
        maxResults = 25,
        minScore = 10,
        platforms = [],
        maxLength = 50,
    } = options;

    const seen = new Set<string>();
    const results: RankedVariant[] = [];

    // Category → entries mapping
    const buckets: Array<{ entries: string[]; category: RankedVariant['category'] }> = [
        { entries: variants.misspellings || [], category: 'misspelling' },
        { entries: variants.encodings || [], category: 'encoding' },
        { entries: variants.acrostics || [], category: 'acrostic' },
        { entries: variants.platform_aliases || [], category: 'platform_alias' },
    ];

    // Also include any entries in `all_variants` that aren't already in other buckets
    const allBucketEntries = new Set(
        buckets.flatMap((b) => b.entries.map((e) => e.toLowerCase())),
    );
    const extraEntries = (variants.all_variants || []).filter(
        (v) => !allBucketEntries.has(v.toLowerCase()),
    );
    buckets.push({ entries: extraEntries, category: 'other' });

    for (const { entries, category } of buckets) {
        for (const raw of entries) {
            const v = raw.trim();

            // Dedup (case-insensitive)
            const key = v.toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);

            // Length filter
            if (v.length > maxLength || v.length === 0) continue;

            // Score
            const score = scoreVariant(v, originalName, category, platforms);
            if (score < minScore) continue;

            // Determine compatible platforms
            const compatiblePlatforms = platforms.length > 0
                ? platforms.filter((p) => {
                    const maxL = PLATFORM_MAX_LENGTH[p];
                    return !maxL || v.length <= maxL;
                })
                : Object.keys(PLATFORM_MAX_LENGTH).filter((p) => {
                    const maxL = PLATFORM_MAX_LENGTH[p];
                    return !maxL || v.length <= maxL;
                });

            results.push({ variant: v, score, category, platforms: compatiblePlatforms });
        }
    }

    // Sort by score descending, then alphabetical for ties
    results.sort((a, b) => b.score - a.score || a.variant.localeCompare(b.variant));

    return results.slice(0, maxResults);
}

/**
 * Quick helper: flat list of ranked variant strings only.
 */
export function getTopVariants(
    variants: SearchVariants,
    originalName: string,
    count: number = 15,
    platforms?: string[],
): string[] {
    return rankVariants(variants, originalName, { maxResults: count, platforms })
        .map((v) => v.variant);
}
