/**
 * Direct Telegram Bot API Test
 * Usage: node scripts/test_telegram_direct.js
 */

const https = require('https');
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing from .env');
    process.exit(1);
}

const payload = JSON.stringify({
    chat_id: CHAT_ID,
    text: "🔍 *Direct Test*: Hello from Tuppli backend! If you see this, your credentials are correct.",
    parse_mode: "Markdown"
});

const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
};

console.log(`🚀 Sending direct message to Chat ID: ${CHAT_ID}...`);

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`📡 Status Code: ${res.statusCode}`);
        console.log(`📄 Response: ${body}`);
        if (res.statusCode === 200) {
            console.log('✅ Success! Check your Telegram.');
        } else {
            console.log('❌ Failed. Check the error message above.');
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Connection Error: ${e.message}`);
});

req.write(payload);
req.end();
