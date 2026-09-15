import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { InfiltrationResult } from './types';

// Use stealth plugin to bypass anti-bot
// Chromium is the most reliable for Discord web
const playwright = chromium;
playwright.use(StealthPlugin());

/**
 * Active Discord Infiltration Engine
 * Uses a headless browser to join servers and bypass verification walls.
 */
export async function infiltrateDiscordServer(
    inviteCode: string, 
    userToken: string
): Promise<InfiltrationResult> {
    const browser = await playwright.launch({ headless: true });
    
    try {
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        const page = await context.newPage();

        // 1. Session Injection (The Ghost Login)
        // We set the token in localStorage before hitting Discord
        await page.goto('https://discord.com/login');
        await page.evaluate((token) => {
            localStorage.setItem('token', `"${token}"`);
        }, userToken);

        // 2. Join Server
        const inviteUrl = `https://discord.com/invite/${inviteCode}`;
        await page.goto(inviteUrl);
        
        // Wait for the 'Accept Invite' button or redirection
        await page.waitForTimeout(5000); 

        // 3. Heuristic Verification Bypass
        console.log(`[Infiltrator] Attempting verification bypass for ${inviteCode}...`);
        
        // Heuristic A: Look for "Verify" buttons
        const verifyButtons = await page.$$('button:has-text("Verify"), button:has-text("Rules")');
        for (const btn of verifyButtons) {
            await btn.click();
            await page.waitForTimeout(2000);
        }

        // Heuristic B: Look for common verification reactions
        const reactions = await page.$$('div[class*="reaction"]');
        if (reactions.length > 0) {
            await reactions[0].click(); // Click the first reaction
            await page.waitForTimeout(2000);
        }

        // 4. Asset Harvesting
        // Search for channels and messages containing leak patterns
        const assets: InfiltrationResult['assetsDiscovered'] = [];
        
        // Regex for common leak hosts
        const leakRegex = /(https?:\/\/(?:www\.)?(?:mega\.nz|gofile\.io|krakenfiles\.com|mediafire\.com|dropbox\.com)\/[^\s()<>]+)/gi;

        // Scrape visible channels for message content
        const messages = await page.$$('div[class*="messageContent"]');
        for (const msg of messages) {
            const content = await msg.innerText();
            const matches = content.match(leakRegex);
            if (matches) {
                matches.forEach(url => {
                    assets.push({
                        url,
                        fileName: 'Discovered via Scraper',
                        channelName: 'Automated Insight',
                        timestamp: new Date().toISOString()
                    });
                });
            }
        }

        return {
            success: true,
            verified: true, // Simplified for now
            channelsFound: 0, // Placeholder
            assetsDiscovered: assets
        };

    } catch (error) {
        console.error('[Infiltrator] Error:', error);
        return {
            success: false,
            verified: false,
            channelsFound: 0,
            assetsDiscovered: [],
            error: (error as Error).message
        };
    } finally {
        await browser.close();
    }
}
