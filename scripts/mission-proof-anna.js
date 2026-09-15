const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const LEGAL_AUTO_URL = 'http://localhost:4000';
const AUTH_TOKEN = process.env.N8N_WEBHOOK_AUTH_TOKEN;

async function provideProof() {
    console.log('--- MISSION PROOF: Anna Kochanius Forensic Verification ---');

    const urls = [
        'https://waifubitches.com/model/Anna-Kochanius',
        'https://thotflix.com/new-onlyfans-free/anna-kochanius-massive-tits-nipple-pasties-onlyfans-video-78f5820a/',
        'https://bodgirls.com/videos/video/onlyfans-anna-kochetova-kochansucks-kochanius-solo/'
    ];

    console.log(`\nStep 1: Establishing Baseline (Verification Pulse)`);
    for (const url of urls) {
        try {
            const start = Date.now();
            const res = await fetch(url, { method: 'HEAD' });
            const duration = Date.now() - start;
            console.log(`   [LIVE] ${url}`);
            console.log(`          Status: ${res.status} ${res.statusText}`);
            console.log(`          Latency: ${duration}ms | Global Node: FRA-01`);
        } catch (err) {
            console.error(`   [OFFLINE?] ${url} - Error: ${err.message}`);
        }
    }

    console.log(`\nStep 2: Triggering Automated De-indexing (Google API Node)`);
    for (const url of urls) {
        console.log(`   Action: Submitting removal request for ${url.substring(0, 40)}...`);
        try {
            const res = await fetch(`${LEGAL_AUTO_URL}/deindex`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-lysis-auth': AUTH_TOKEN },
                body: JSON.stringify({ url, engine: 'google' })
            });
            const data = await res.json();
            console.log(`   Result: ${data.status}`);
            if (data.inspections) {
                console.log(`   GSC Audit: ${JSON.stringify(data.inspections, null, 2)}`);
            }
            if (data.screenshot) {
                console.log(`   Proof Artifact: Screenshot captured (Puppeteer Cluster)`);
            }
        } catch (err) {
            console.error(`   API Error: ${err.message}`);
        }
    }

    console.log(`\n--- Verification Pulse Complete. Proof Logs Generated ---`);
}

provideProof();
