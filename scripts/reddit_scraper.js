/**
 * Tuppli Reddit Lead Scraper
 * 
 * Scrapes subreddits where creators discuss content theft, leaks, and DMCA issues.
 * Sends qualified leads to the n8n webhook for AI qualification and outreach.
 * 
 * Usage: node scripts/reddit_scraper.js
 */

require('dotenv').config();

const SUBREDDITS = [
    'OnlyFansAdvice',
    'CreatorsAdvice',
    'Fansly',
    'adultcontentcreators',
    'onlyfans101',
    'StreamersGoneWild',
];

const PAIN_KEYWORDS = [
    'leaked', 'stolen', 'DMCA', 'takedown', 'impersonator', 'catfish',
    'someone stole', 'found my content', 'piracy', 'leak site', 'tube site',
    'copyright', 'chargeback', 'scraper', 'bot downloaded', 'reposted my',
    'selling my content', 'watermark', 'protect my content', 'content theft',
];

// Use Reddit's public JSON API (no auth required for public subreddits)
const REDDIT_BASE = 'https://www.reddit.com';
const { delay, sendToWebhook } = require('../lib/http_utils');

async function fetchSubreddit(subreddit, timeRange = 'month') {
    console.log(`\n🔍 Scanning r/${subreddit}...`);
    let allPosts = [];

    // Search each keyword group individually since Reddit chokes on complex OR queries
    const searchTerms = [
        'leaked content',
        'stolen content DMCA',
        'someone stole my content',
        'content theft protection',
        'catfish impersonator',
        'leak site takedown',
        'watermark protect',
    ];

    for (const term of searchTerms) {
        const url = `${REDDIT_BASE}/r/${subreddit}/search.json?q=${encodeURIComponent(term)}&restrict_sr=on&sort=new&t=${timeRange}&limit=25`;

        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'TuppliLeadScanner/1.0 (by /u/tuppli_official)',
                },
            });

            if (!res.ok) {
                if (res.status === 404) {
                    console.log(`   ⚠️ r/${subreddit} not found or private`);
                    return [];
                }
                continue;
            }

            const data = await res.json();
            const posts = data?.data?.children || [];
            allPosts = allPosts.concat(posts.map(p => p.data));

            // Rate limit between searches
            await delay(1500);
        } catch (err) {
            continue;
        }
    }

    // Filter and deduplicate
    const seen = new Set();
    const filtered = allPosts
        .filter(post => {
            if (seen.has(post.id)) return false;
            seen.add(post.id);
            const text = `${post.title} ${post.selftext}`.toLowerCase();
            return PAIN_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
        })
        .map(post => ({
            platform: 'reddit',
            subreddit: post.subreddit,
            author: post.author,
            title: post.title,
            text: post.selftext?.substring(0, 500) || '',
            url: `https://reddit.com${post.permalink}`,
            score: post.score,
            num_comments: post.num_comments,
            created: new Date(post.created_utc * 1000).toISOString(),
            flair: post.link_flair_text || '',
        }));

    console.log(`   Found ${filtered.length} posts matching pain keywords`);
    return filtered;
}

async function sendRedditToWebhook(lead) {
    const payload = {
        source: 'reddit',
        ...lead,
        fullText: `[Reddit r/${lead.subreddit}] ${lead.title}: ${lead.text}`,
        author: { userName: lead.author },
    };
    try {
        await sendToWebhook(process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/twitter-recon-scrape', payload);
    } catch (e) {
        // Webhook may not be running locally
    }
}

async function alertSlack(leads) {
    if (!process.env.SLACK_WEBHOOK_URL || leads.length === 0) return;

    const summary = leads.slice(0, 10).map(l =>
        `• *r/${l.subreddit}* — u/${l.author}: "${l.title.substring(0, 80)}..." (${l.score}⬆️) [${l.url}]`
    ).join('\n');

    try {
        await sendToWebhook(process.env.SLACK_WEBHOOK_URL, {
            text: `🔴 *Reddit Lead Scan Complete*\n\n*${leads.length} potential leads found across ${SUBREDDITS.length} subreddits:*\n\n${summary}\n\n_Action: Review and DM high-score posts with value-first outreach._`
        });
        console.log('\n📢 Slack alert sent!');
    } catch (e) {
        console.log('\n⚠️ Slack alert failed:', e.message);
    }
}

async function main() {
    console.log('🚀 Tuppli Reddit Lead Scraper');
    console.log(`   Scanning ${SUBREDDITS.length} subreddits for creator pain...`);
    console.log(`   Keywords: ${PAIN_KEYWORDS.length} pain signals\n`);

    let allLeads = [];

    for (const sub of SUBREDDITS) {
        const leads = await fetchSubreddit(sub, 'year');
        allLeads = allLeads.concat(leads);

        // Rate limit: Reddit allows ~60 requests/min for unauthenticated
        await delay(2000);
    }

    // Dedupe by URL
    const seen = new Set();
    allLeads = allLeads.filter(l => {
        if (seen.has(l.url)) return false;
        seen.add(l.url);
        return true;
    });

    // Sort by score (engagement = higher intent)
    allLeads.sort((a, b) => b.score - a.score);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 RESULTS: ${allLeads.length} unique leads found`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Print top 15
    allLeads.slice(0, 15).forEach((lead, i) => {
        console.log(`${i + 1}. [r/${lead.subreddit}] (${lead.score}⬆️ | ${lead.num_comments} comments)`);
        console.log(`   "${lead.title}"`);
        console.log(`   by u/${lead.author} — ${lead.created}`);
        console.log(`   ${lead.url}\n`);
    });

    // Send to n8n webhook
    console.log(`\n📤 Sending ${allLeads.length} leads to n8n webhook...`);
    for (const lead of allLeads) {
        await sendRedditToWebhook(lead);
        await delay(100);
    }

    // Alert Slack
    await alertSlack(allLeads);

    console.log('\n✅ Reddit scrape complete!');
}

main();
