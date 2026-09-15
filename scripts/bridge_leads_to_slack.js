const { Client } = require('pg');
const https = require('https');
require('dotenv').config();

function postToSlack(url, data) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve(body));
        });

        req.on('error', (e) => reject(e));
        req.write(JSON.stringify(data));
        req.end();
    });
}

async function bridgeLeads() {
    const dbClient = new Client({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    const SLACK_URL = process.env.SLACK_WEBHOOK_URL;

    if (!SLACK_URL) {
        console.error("Missing SLACK_WEBHOOK_URL in .env");
        return;
    }

    try {
        await dbClient.connect();
        console.log("Connected to Supabase. Fetching new leads...");

        const res = await dbClient.query(`
            SELECT id, username, tweet_url, tweet_text 
            FROM public.sales_leads 
            WHERE status = 'new_lead' 
            LIMIT 5
        `);

        if (res.rows.length === 0) {
            console.log("No new leads to bridge.");
            return;
        }

        for (const lead of res.rows) {
            const slackMessage = {
                blocks: [
                    {
                        type: "header",
                        text: {
                            type: "plain_text",
                            text: "🚀 New Sales Lead Detected!",
                            emoji: true
                        }
                    },
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `*User:* @${lead.username}\n*Tweet:* ${lead.tweet_text}\n*URL:* ${lead.tweet_url}`
                        }
                    },
                    {
                        type: "actions",
                        elements: [
                            {
                                type: "button",
                                text: {
                                    type: "plain_text",
                                    text: "Open Lead",
                                    emoji: true
                                },
                                url: lead.tweet_url,
                                action_id: "open_lead"
                            }
                        ]
                    }
                ]
            };

            await postToSlack(SLACK_URL, slackMessage);

            // Update status to 'bridged'
            await dbClient.query(`UPDATE public.sales_leads SET status = 'bridged' WHERE id = $1`, [lead.id]);
            console.log(`Successfully bridged lead: @${lead.username}`);
        }

    } catch (err) {
        console.error("Bridge Error:", err);
    } finally {
        await dbClient.end();
    }
}

bridgeLeads();
