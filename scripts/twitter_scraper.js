/**
 * Local Free Twitter Scraper 
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your terminal in this folder
 * 2. Run: npm install playwright
 * 3. Run: npx playwright install chromium
 * 4. Add your auth_token and webhook URL below, and run with: node twitter_scraper.js
 */

const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

const https = require('https');
const http = require('http');

// ==============================
// CONFIGURATION
// ==============================
// Burner accounts for scraping only (NOT the Tuppli account)
const SCRAPER_TOKENS = [
    process.env.SCRAPER_TOKEN_A || 'e8d6b483727bc3a8c2388d4dd8feef7562d875b6',
    process.env.SCRAPER_TOKEN_B || 'PASTE_BURNER_ACCOUNT_B_AUTH_TOKEN_HERE',
];
// Round-robin: pick a token based on the current hour
const AUTH_TOKEN = SCRAPER_TOKENS[new Date().getHours() % SCRAPER_TOKENS.length];
console.log(`Using scraper token: ...${AUTH_TOKEN.slice(-6)}`);

// Targeted query catching creators actively dealing with leaks or seeking solutions
const TARGET_USERNAME = process.argv[2];
let SEARCH_QUERY = '("found my content on" OR "DMCA takedown" OR "stealing my content" OR "someone is selling" OR "tired of people leaking" OR "how to stop leaks") ("onlyfans" OR "fansly" OR "creator" OR "leak site") -filter:replies since:2025-09-01';

if (TARGET_USERNAME) {
    console.log(`🎯 Targeted Recon for: @${TARGET_USERNAME}`);
    // Search for the username specifically to find impersonators or mentions of leaks
    SEARCH_QUERY = `(@${TARGET_USERNAME} OR "${TARGET_USERNAME}") ("impersonator" OR "fake" OR "leak" OR "ppv" OR "scam")`;
}

const { delay, sendToWebhook } = require('../lib/http_utils');

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/twitter-recon-scrape';
const MAX_TWEETS = TARGET_USERNAME ? 20 : 100; // Fewer tweets for targeted scan to be faster

(async () => {
    console.log('Starting custom Twitter scraper (Historical Scan) with Stealth Mode...');

    // Launch headless chromium with stealth
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    // Add natural variation to start time
    await delay(1000, 3000);

    // Inject Auth Cookie
    await context.addCookies([{
        name: 'auth_token',
        value: AUTH_TOKEN,
        domain: '.x.com',
        path: '/',
        secure: true,
    }]);

    const searchUrl = `https://x.com/search?q=${encodeURIComponent(SEARCH_QUERY)}&src=typed_query&f=live`;
    console.log(`Navigating to: ${searchUrl}`);

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

    try {
        await page.waitForSelector('[data-testid="tweet"]', { timeout: 30000 });
    } catch (e) {
        console.log('No tweets found or page took too long to load.');
        await browser.close();
        return;
    }

    let itemsCollected = 0;
    console.log('Scraping tweets...');

    // Collect Data
    const tweets = await page.$$('[data-testid="tweet"]');

    for (const tweet of tweets) {
        if (itemsCollected >= MAX_TWEETS) break;

        try {
            // Evaluate everything inside the browser context to avoid Playwright handle leaks/AggregateErrors
            const tweetData = await tweet.evaluate((el) => {
                const textEl = el.querySelector('[data-testid="tweetText"]');
                const text = textEl ? textEl.innerText : '';

                const userEl = el.querySelector('[data-testid="User-Name"]');
                const authorText = userEl ? userEl.innerText : '';
                const usernameMatch = authorText.match(/@([\w_]+)/);
                const username = usernameMatch ? usernameMatch[1] : '';

                const timeEl = el.querySelector('time');
                let tweetLink = '';
                if (timeEl) {
                    const parentA = timeEl.closest('a');
                    tweetLink = parentA ? parentA.getAttribute('href') : '';
                }

                return { text, username, tweetLink };
            });

            const { text, username, tweetLink } = tweetData;

            const tweetIdMatch = tweetLink ? tweetLink.match(/\/status\/(\d+)/) : null;
            const tweetId = tweetIdMatch ? tweetIdMatch[1] : `local_${Date.now()}_${itemsCollected}`;

            if (text && username) {
                const finalData = {
                    id: tweetId,
                    url: `https://x.com/${username}`,
                    fullText: text,
                    text: text,
                    createdAt: new Date().toISOString(),
                    author: {
                        userName: username,
                        name: username
                    }
                };

                // Send perfectly formatted payload to n8n webhook
                await sendToWebhook(N8N_WEBHOOK_URL, finalData);
                itemsCollected++;
                console.log(`Sent tweet ${itemsCollected}/${MAX_TWEETS} by @${username} to webhook.`);

                // Add random human delay between parsing items to avoid rate limits
                await delay(200, 800);
            }
        } catch (err) {
            console.log(`Failed to parse a tweet: ${err.message || err}`);
        }
    }

    console.log(`Finished! Sent ${itemsCollected} leads to n8n.`);
    await browser.close();
})();
