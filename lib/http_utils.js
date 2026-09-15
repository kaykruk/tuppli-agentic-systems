/**
 * Tuppli shared HTTP and utility functions.
 */

const https = require('https');
const http = require('http');

/**
 * Human-like delay helper.
 */
const delay = (min, max) => {
    const ms = max ? Math.floor(Math.random() * (max - min + 1) + min) : min;
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Send data to a specific webhook URL.
 */
async function sendToWebhook(urlStr, data) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const url = new URL(urlStr);
        const lib = url.protocol === 'https:' ? https : http;

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = lib.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400) {
                    console.error(`📡 Webhook [${res.statusCode}]: ${body}`);
                }
                resolve({ body, statusCode: res.statusCode });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(payload);
        req.end();
    });
}

module.exports = {
    delay,
    sendToWebhook
};
