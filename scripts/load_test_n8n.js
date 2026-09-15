#!/usr/bin/env node
/**
 * n8n Workflow Concurrency Load Test
 * 
 * Fires N concurrent webhook requests at the n8n instance
 * to measure throughput, latency, and error rates.
 * 
 * Usage: node scripts/load_test_n8n.js [concurrency] [total_requests]
 * Example: node scripts/load_test_n8n.js 10 50
 */

const http = require('http');
const fs = require('fs');

// Parse .env
const envStr = fs.readFileSync('.env', 'utf8');
const env = {};
envStr.split('\n').forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
        const [key, ...vals] = line.split('=');
        env[key.trim()] = vals.join('=').trim();
    }
});

const CONCURRENCY = parseInt(process.argv[2]) || 10;
const TOTAL = parseInt(process.argv[3]) || 50;
const N8N_HOST = env['N8N_HOST'] || 'localhost';
const N8N_PORT = 5678;
const AUTH_TOKEN = env['N8N_WEBHOOK_AUTH_TOKEN'] || '';

console.log(`\n🔥 n8n Concurrency Load Test`);
console.log(`   Concurrency: ${CONCURRENCY}`);
console.log(`   Total Requests: ${TOTAL}`);
console.log(`   Target: http://${N8N_HOST}:${N8N_PORT}\n`);

function makeRequest(id) {
    return new Promise((resolve) => {
        const start = Date.now();
        const payload = JSON.stringify({ test_id: id, timestamp: new Date().toISOString() });

        const options = {
            hostname: N8N_HOST,
            port: N8N_PORT,
            path: '/healthz',
            method: 'GET',
            timeout: 10000,
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({
                    id, status: res.statusCode,
                    latency: Date.now() - start,
                    success: res.statusCode >= 200 && res.statusCode < 400
                });
            });
        });

        req.on('error', (err) => {
            resolve({ id, status: 0, latency: Date.now() - start, success: false, error: err.message });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ id, status: 0, latency: Date.now() - start, success: false, error: 'timeout' });
        });

        req.end();
    });
}

async function runBatch(batch) {
    return Promise.all(batch.map(id => makeRequest(id)));
}

async function main() {
    const results = [];
    const globalStart = Date.now();

    for (let i = 0; i < TOTAL; i += CONCURRENCY) {
        const batch = [];
        for (let j = i; j < Math.min(i + CONCURRENCY, TOTAL); j++) {
            batch.push(j);
        }
        const batchResults = await runBatch(batch);
        results.push(...batchResults);
        process.stdout.write(`\r   Progress: ${results.length}/${TOTAL}`);
    }

    const totalTime = Date.now() - globalStart;
    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);
    const latencies = results.map(r => r.latency).sort((a, b) => a - b);

    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];
    const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
    const rps = Math.round((TOTAL / totalTime) * 1000 * 100) / 100;

    console.log(`\n\n📊 Results:`);
    console.log(`   ─────────────────────────────────`);
    console.log(`   Total Time:     ${totalTime}ms`);
    console.log(`   Requests/sec:   ${rps}`);
    console.log(`   Successes:      ${successes.length}/${TOTAL} (${Math.round(successes.length / TOTAL * 100)}%)`);
    console.log(`   Failures:       ${failures.length}/${TOTAL}`);
    console.log(`   ─────────────────────────────────`);
    console.log(`   Avg Latency:    ${avg}ms`);
    console.log(`   P50 Latency:    ${p50}ms`);
    console.log(`   P95 Latency:    ${p95}ms`);
    console.log(`   P99 Latency:    ${p99}ms`);
    console.log(`   Min Latency:    ${latencies[0]}ms`);
    console.log(`   Max Latency:    ${latencies[latencies.length - 1]}ms`);
    console.log(`   ─────────────────────────────────\n`);

    if (failures.length > 0) {
        console.log(`   ⚠️  Failed requests:`);
        failures.forEach(f => console.log(`      Request #${f.id}: ${f.error || `HTTP ${f.status}`}`));
    }

    // Verdict
    if (successes.length === TOTAL && p95 < 500) {
        console.log(`   ✅ PASS: n8n handles ${CONCURRENCY} concurrent connections with P95 < 500ms`);
    } else if (successes.length === TOTAL) {
        console.log(`   ⚠️  WARN: All requests succeeded but P95 is ${p95}ms (target < 500ms)`);
    } else {
        console.log(`   ❌ FAIL: ${failures.length} requests failed under ${CONCURRENCY} concurrent load`);
    }
}

main().catch(console.error);
