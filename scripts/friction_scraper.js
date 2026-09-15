/**
 * Tuppli Friction Scraper
 * 
 * Specifically designed to mine competitor weaknesses and creator frustrations
 * to inform product roadmap and marketing/blog content.
 * 
 * Usage: node scripts/friction_scraper.js
 */

require('dotenv').config();
const { delay, sendToWebhook } = require('../lib/http_utils');

const SUBREDDITS = [
    'OnlyFansAdvice',
    'CreatorsAdvice',
    'Fansly',
    'adultcontentcreators',
];

const COMPETITORS = [
    'Rentity',
    'BranditScan',
    'CamModelProtection',
    'DMCA.com',
    'Pixsy',
    'CopyTrack',
    'Pimeyes'
];

const FRICTION_KEYWORDS = [
    'expensive', 'slow', 'missed', 'didn\'t find', 'failed', 'useless',
    'customer support', 'bad', 'issue', 'problem', 'waste of money',
    'alternative to', 'better than', 'not working', 'stolen anyway'
];

const TARGET_USERNAME = process.argv[2];
const REDDIT_BASE = 'https://www.reddit.com';

async function fetchFrictionPosts(subreddit) {
    console.log(`\n🔍 Mining signals on r/${subreddit}...`);
    let allPosts = [];

    const searchTargets = TARGET_USERNAME ? [TARGET_USERNAME] : COMPETITORS;

    for (const target of searchTargets) {
        console.log(`   Searching for: ${target}`);
        const url = `${REDDIT_BASE}/r/${subreddit}/search.json?q=${encodeURIComponent(target)}&restrict_sr=on&sort=new&t=year&limit=50`;

        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': 'TuppliFrictionBot/1.0 (by /u/tuppli_official)' }
            });

            if (!res.ok) continue;

            const data = await res.json();
            const posts = data?.data?.children || [];
            allPosts = allPosts.concat(posts.map(p => p.data));

            await delay(1500); // Rate limit
        } catch (err) {
            continue;
        }
    }

    // Filter for friction/negative sentiment
    const seen = new Set();
    const frictionLeads = allPosts
        .filter(post => {
            if (seen.has(post.id)) return false;
            seen.add(post.id);
            const text = `${post.title} ${post.selftext}`.toLowerCase();
            return FRICTION_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
        })
        .map(post => ({
            platform: 'reddit',
            source: 'friction_audit',
            subreddit: post.subreddit,
            author: post.author,
            title: post.title,
            text: post.selftext?.substring(0, 1000) || '',
            url: `https://reddit.com${post.permalink}`,
            created: new Date(post.created_utc * 1000).toISOString(),
            competitor_mentioned: COMPETITORS.find(c => `${post.title} ${post.selftext}`.includes(c))
        }));

    return frictionLeads;
}

async function main() {
    console.log('🚀 Tuppli Deep Friction Scraper Started');
    let totalFrictionFound = 0;

    for (const sub of SUBREDDITS) {
        const results = await fetchFrictionPosts(sub);
        totalFrictionFound += results.length;

        for (const item of results) {
            console.log(`   [FOUND] ${item.competitor_mentioned || 'General'} Friction: "${item.title.substring(0, 50)}..."`);
            // Optional: Send to a separate n8n webhook for "Strategic Intelligence"
            if (process.env.STRATEGIC_INTEL_WEBHOOK) {
                await sendToWebhook(process.env.STRATEGIC_INTEL_WEBHOOK, item);
            }
        }
    }

    console.log(`\n✅ Audit Complete. Found ${totalFrictionFound} specific friction points.`);
    console.log('Results are intended to inform:');
    console.log('1. Blog: "Why [Competitor] Misses Telegram Leaks"');
    console.log('2. Roadmap: Priority on faster takedowns / support.');
}

main();
