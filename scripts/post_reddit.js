/**
 * Tuppli Reddit Posting Utility
 * 
 * Authenticates with Reddit API and submits a reply or post.
 * Primarily triggered by the n8n Social Approval Bridge.
 */

const snoowrap = require('snoowrap');
require('dotenv').config();

async function postToReddit(targetId, content, type = 'reply') {
    const r = new snoowrap({
        userAgent: process.env.REDDIT_USER_AGENT || 'TuppliBot/1.0',
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        username: process.env.REDDIT_USERNAME,
        password: process.env.REDDIT_PASSWORD
    });

    try {
        if (type === 'reply') {
            console.log(`💬 Replying to Reddit item: ${targetId}...`);
            await r.getSubmission(targetId).reply(content);
        } else {
            console.log(`📝 Submitting new post to r/${targetId}...`);
            await r.submitSelfpost({
                subredditName: targetId,
                title: 'Protecting Your Creator Content with Tuppli AI',
                text: content
            });
        }
        console.log('✅ Reddit post successful!');
    } catch (err) {
        console.error('❌ Reddit posting failed:', err.message);
        process.exit(1);
    }
}

// CLI Support: node scripts/post_reddit.js <targetId> <content> <type>
if (require.main === module) {
    const [targetId, content, type] = process.argv.slice(2);
    if (!targetId || !content) {
        console.error('Usage: node scripts/post_reddit.js <targetId> <content> [type]');
        process.exit(1);
    }
    postToReddit(targetId, content, type);
}

module.exports = { postToReddit };
