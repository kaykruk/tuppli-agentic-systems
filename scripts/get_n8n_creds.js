const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        // Querying for Twitter credentials
        const res = await client.query(`SELECT "name", "data" FROM n8n.credentials_entity WHERE "type" = 'twitterOAuth2Api'`);

        if (res.rows.length === 0) {
            console.log("No twitterOAuth2Api credentials found.");
        } else {
            for (const row of res.rows) {
                console.log(`\n--- Credential Name: ${row.name} ---`);
                console.log(row.data);
            }
        }
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        await client.end();
    }
}

run();
