#!/usr/bin/env npx tsx
/**
 * Cross-Platform AI Variant Test
 *
 * Tests the username-variant generation across multiple platforms
 * and validates the ranking/filtering pipeline.
 *
 * Usage:
 *   GEMINI_API_KEY=your-key npx tsx scripts/test_ai_variants.ts
 *
 * Requires: @google/genai (already in frontend deps)
 */

/* eslint-disable no-console */

// We import from the compiled frontend lib, so we run from project root
import { generateSearchVariants } from '../frontend/lib/gemini';
import { rankVariants, getTopVariants } from '../frontend/lib/variant-ranker';

// ---- Test configuration ----

const TEST_CASES = [
    {
        name: 'StellaRose',
        platforms: ['instagram', 'twitter', 'onlyfans'],
        description: 'Common single-word alias',
    },
    {
        name: 'The Real Jasmine',
        platforms: ['tiktok', 'reddit', 'instagram'],
        description: 'Multi-word name with acrostic potential',
    },
    {
        name: 'xo_mikayla',
        platforms: ['twitter', 'onlyfans', 'fansly'],
        description: 'Handle-style name with prefix',
    },
    {
        name: 'DarkAngelxx',
        platforms: ['instagram', 'reddit'],
        description: 'Name with character suffix',
    },
];

// ---- Colour helpers ----
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

// ---- Main ----

async function main() {
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌  Set GEMINI_API_KEY to run this test.');
        process.exit(1);
    }

    console.log(bold('\n🧪  Tuppli AI Variant — Cross-Platform Test\n'));
    console.log(dim(`Running ${TEST_CASES.length} test cases across multiple platforms\n`));
    console.log('═'.repeat(70));

    const results: Array<{
        name: string;
        platforms: string[];
        totalRaw: number;
        totalRanked: number;
        topScore: number;
        categories: Record<string, number>;
        elapsed: number;
    }> = [];

    for (const tc of TEST_CASES) {
        console.log(`\n${cyan(`▶ Test: "${tc.name}"`)}  ${dim(`(${tc.description})`)}`);
        console.log(`  Platforms: ${tc.platforms.join(', ')}`);

        const start = Date.now();

        // 1. Generate variants
        const raw = await generateSearchVariants(tc.name, tc.platforms);
        const elapsed = Date.now() - start;

        const totalRaw =
            (raw.misspellings?.length || 0) +
            (raw.encodings?.length || 0) +
            (raw.acrostics?.length || 0) +
            (raw.platform_aliases?.length || 0);

        console.log(`  ${green('✓')} Generated ${totalRaw} raw variants in ${elapsed}ms`);

        // 2. Show raw counts per category
        console.log(`    misspellings:     ${raw.misspellings?.length || 0}  ${dim(JSON.stringify(raw.misspellings?.slice(0, 3)))}`);
        console.log(`    encodings:        ${raw.encodings?.length || 0}  ${dim(JSON.stringify(raw.encodings?.slice(0, 3)))}`);
        console.log(`    acrostics:        ${raw.acrostics?.length || 0}  ${dim(JSON.stringify(raw.acrostics?.slice(0, 3)))}`);
        console.log(`    platform_aliases: ${raw.platform_aliases?.length || 0}  ${dim(JSON.stringify(raw.platform_aliases?.slice(0, 3)))}`);

        // 3. Rank and filter
        const ranked = rankVariants(raw, tc.name, {
            maxResults: 15,
            minScore: 10,
            platforms: tc.platforms,
        });

        console.log(`\n  ${yellow('📊 Ranked Results')} (top ${ranked.length} of ${totalRaw}):`);

        const categories: Record<string, number> = {};
        for (const r of ranked) {
            categories[r.category] = (categories[r.category] || 0) + 1;
            const bar = '█'.repeat(Math.round(r.score / 5));
            console.log(
                `    ${String(r.score).padStart(3)}  ${bar.padEnd(20)}  ${r.variant.padEnd(25)}  ${dim(r.category)}  ${dim(`[${r.platforms.join(',')}]`)}`,
            );
        }

        // 4. Quick variant helper
        const topFlat = getTopVariants(raw, tc.name, 5, tc.platforms);
        console.log(`\n  ${green('⚡ Top 5 quick')}: ${topFlat.join(', ')}`);

        results.push({
            name: tc.name,
            platforms: tc.platforms,
            totalRaw,
            totalRanked: ranked.length,
            topScore: ranked[0]?.score || 0,
            categories,
            elapsed,
        });

        console.log('─'.repeat(70));
    }

    // ---- Summary ----
    console.log(bold('\n📋  SUMMARY\n'));
    console.log(
        '  Name'.padEnd(25) +
        'Raw'.padStart(5) +
        'Ranked'.padStart(8) +
        'Top Score'.padStart(11) +
        'Time(ms)'.padStart(10),
    );
    console.log('  ' + '─'.repeat(57));

    for (const r of results) {
        console.log(
            `  ${r.name.padEnd(23)}` +
            `${String(r.totalRaw).padStart(5)}` +
            `${String(r.totalRanked).padStart(8)}` +
            `${String(r.topScore).padStart(11)}` +
            `${String(r.elapsed).padStart(10)}`,
        );
    }

    const avgTime = Math.round(results.reduce((s, r) => s + r.elapsed, 0) / results.length);
    const avgRanked = Math.round(results.reduce((s, r) => s + r.totalRanked, 0) / results.length);
    console.log('  ' + '─'.repeat(57));
    console.log(`  ${'Average'.padEnd(23)}${' '.padStart(5)}${String(avgRanked).padStart(8)}${' '.padStart(11)}${String(avgTime).padStart(10)}`);

    console.log(green('\n✅  All tests complete\n'));
}

main().catch((err) => {
    console.error('❌  Test failed:', err);
    process.exit(1);
});
