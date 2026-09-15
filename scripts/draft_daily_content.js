/**
 * Tuppli Daily Draft Generator
 * Generates value-first social content and sends it to the approval bridge.
 */

const { sendDraftForApproval } = require('../lib/approval_utils');

async function generateDailyDrafts() {
    console.log('✨ Generating daily strategic drafts...');

    // 1. Twitter Thread: The Metadata Trap (Value Pillar)
    const twitterDraft = `1/4: Your photos are telling people more than you think. 🗺️

Most creators don't realize every photo they take contains "EXIF" data—hidden metadata that can leak your GPS coordinates to a stalker.

2/4: If you take a photo at your home gym and post it to X, a smart bot can extract your exact location in 2 seconds.

3/4: [The Fix]: On iPhone, go to Settings → Privacy → Location Services → Camera → Never. Or use a tool like ExifPurge.

4/4: We built Tuppli to strip this automatically on every scan, but you should be doing this manually starting TODAY. Stay safe. 🛡️`;

    // 2. Reddit Value Post: The Preview Trap
    const redditDraft = `The "Preview" Trap: How your free clips are fueling 50k sub pirate groups.

Ever wonder how a "private" Telegram group gets 50k members? It starts with your "free" previews on Reddit and X.

Bots scrape these free clips and use them as "Honeypots" to lure people into encrypted chats. Once they have you there, they start selling the "full leaks" scraped from your paid feed.

The Fix:
1. Never post previews longer than 3 seconds.
2. Use dynamic watermarking.
3. If you see your free clips on a Telegram aggregate, your paid feed is likely next.

Education is your best defense. Stay safe. 🛡️`;

    await sendDraftForApproval('Twitter (X)', twitterDraft);
    await sendDraftForApproval('Reddit', redditDraft);

    console.log('✅ Daily drafts generated and sent for approval.');
}

generateDailyDrafts();
