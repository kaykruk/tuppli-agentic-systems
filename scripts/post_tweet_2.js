/**
 * Post Tweet #2 as @Tupplii using browser automation
 */
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
require('dotenv').config();

const { delay } = require('../lib/http_utils');

const AUTH_TOKEN = process.env.TUPPLI_AUTH_TOKEN || 'e14af3881a74751c479a7bc5cecef92e42902141';

// Allow tweet text to be passed as an argument, otherwise use default
const TWEET = process.argv[2] || `OnlyFans creators lose $4,700/mo to Telegram leaks.

Most protection services find "756 leaks" on Google but ignore the private Telegram groups where the real theft happens.

You're paying for reports, not protection.

DM 'PROTECT'—we don't just find links, we nuke them. 🛡️`;

async function post() {
    console.log('🚀 Posting as @Tupplii...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 },
    });

    await context.addCookies([{
        name: 'auth_token',
        value: AUTH_TOKEN,
        domain: '.x.com',
        path: '/',
        httpOnly: true,
        secure: true,
    }]);

    const page = await context.newPage();

    try {
        await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await delay(3000);

        const box = '[data-testid="tweetTextarea_0"]';
        await page.waitForSelector(box, { timeout: 15000 });
        await page.click(box);
        await delay(500);

        // Type using keyboard to avoid issues with newlines
        await page.keyboard.insertText(TWEET);
        await delay(2000);

        // Wait for Post button to become enabled
        const postBtn = page.locator('[data-testid="tweetButton"]:not([disabled])');
        await postBtn.waitFor({ state: 'visible', timeout: 10000 });
        await postBtn.click();
        await delay(3000);

        console.log('✅ Tweet #2 posted from @Tupplii!');
    } catch (err) {
        console.error('❌ Error:', err.message);
        await page.screenshot({ path: '/tmp/tweet_error2.png' });
        console.log('   Screenshot: /tmp/tweet_error2.png');
    } finally {
        await browser.close();
    }
}

post();
