/**
 * Tuppli Approval Utilities
 * Bridge for sending drafts to Telegram/n8n for user confirmation.
 */

const { sendToWebhook } = require('./http_utils');
require('dotenv').config();

const APPROVAL_WEBHOOK_URL = process.env.N8N_APPROVAL_WEBHOOK_URL || 'https://n8n.tuppli.com/webhook/telegram-approval-personal';

/**
 * Sends a draft to n8n for forwarding to Slack/Telegram.
 */
async function sendDraftForApproval(platform, content, meta = {}) {
    if (!APPROVAL_WEBHOOK_URL) {
        console.warn('⚠️ No APPROVAL_WEBHOOK_URL configured. Draft printed to console:');
        console.log(`\n--- [DRAFT: ${platform}] ---\n${content}\n--------------------\n`);
        return;
    }

    // Determine the approval command based on platform
    let approval_cmd = `node scripts/post_tweet_2.js "${content.replace(/"/g, '\\"')}"`;

    if (platform.toLowerCase().includes('reddit') && meta.targetId) {
        approval_cmd = `node scripts/post_reddit.js "${meta.targetId}" "${content.replace(/"/g, '\\"')}" reply`;
    }

    try {
        await sendToWebhook(APPROVAL_WEBHOOK_URL, {
            platform,
            content,
            timestamp: new Date().toISOString(),
            // Provide a quick-approval link that n8n can use
            approval_cmd
        });
        console.log(`✅ Draft for ${platform} sent for approval.`);
    } catch (err) {
        console.error(`❌ Failed to send draft to approval bridge: ${err.message}`);
    }
}

module.exports = {
    sendDraftForApproval
};
