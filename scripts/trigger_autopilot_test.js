const { Client } = require('pg');

const connectionString = 'postgresql://postgres.xlupdcvldwprizuftkvf:[REDACTED_SUPABASE_DB_PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';
const bridgeUrl = 'https://n8n.tuppli.com/webhook/4QB0IdIAaPODUJ85/callback/webhook'; // This is actually the trigger URL for the bridge

// Actually, the trigger URL for the bridge is the Webhook node, not the Trigger node.
// Let me verify the bridge workflow again.
// Webhook Trigger positioned at [100, 300] has path "telegram-approval-personal"
const webhookUrl = 'https://n8n.tuppli.com/webhook/telegram-approval-personal';

async function sendDraft(content, pillar) {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const insertQuery = `
            INSERT INTO n8n.content_history (platform, pillar, content, status)
            VALUES ($1, $2, $3, $4)
            RETURNING id;
        `;
        const values = ['Twitter', pillar, content, 'pending'];
        const res = await client.query(insertQuery, values);
        const draftId = res.rows[0].id;
        console.log(`Draft [${pillar}] inserted with ID: ${draftId}`);

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                platform: 'Twitter',
                content: content,
                id: draftId
            })
        });

        if (response.ok) {
            console.log(`✅ Test draft [${pillar}] sent to Telegram!`);
        } else {
            console.error(`❌ Failed to send [${pillar}]:`, response.status);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

async function runTests() {
    await sendDraft(
        "🚀 Test Draft #1: Automated Content Defense\n\nTuppli is now self-driving. This draft was generated and sent automatically across the new bridge.\n\n#Security #Automation",
        "Defense"
    );

    await sendDraft(
        "📊 Test Draft #2: Content Analytics & History\n\nBy tracking every post in Supabase, Tuppli ensures your brand voice stay fresh and repeats are a thing of the past.\n\n#Data #Marketing",
        "Analytics"
    );
}

runTests();
