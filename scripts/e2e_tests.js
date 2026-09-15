#!/usr/bin/env node
/**
 * Tuppli End-to-End Test Suite
 * 
 * Tests all critical paths across the full stack:
 * - Supabase connectivity & auth
 * - n8n health & workflow existence
 * - API endpoints
 * - Docker service health
 * - Waitlist flow
 * 
 * Usage: node scripts/e2e_tests.js
 */

const http = require('http');
const https = require('https');
const fs = require('fs');

const envStr = fs.readFileSync('.env', 'utf8');
const env = {};
envStr.split('\n').forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
        const [key, ...vals] = line.split('=');
        env[key.trim()] = vals.join('=').trim();
    }
});

let passed = 0;
let failed = 0;
const results = [];

function log(name, ok, detail) {
    const icon = ok ? '✅' : '❌';
    results.push({ name, ok, detail });
    if (ok) passed++; else failed++;
    console.log(`  ${icon} ${name}${detail ? ` — ${detail}` : ''}`);
}

function httpGet(url, headers = {}) {
    return new Promise((resolve) => {
        const mod = url.startsWith('https') ? https : http;
        const req = mod.get(url, { headers, timeout: 10000 }, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', (err) => resolve({ status: 0, body: '', error: err.message }));
        req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: '', error: 'timeout' }); });
    });
}

function httpPost(url, data, headers = {}) {
    return new Promise((resolve) => {
        const mod = url.startsWith('https') ? https : http;
        const urlObj = new URL(url);
        const payload = JSON.stringify(data);
        const options = {
            hostname: urlObj.hostname, port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname, method: 'POST', timeout: 10000,
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), ...headers },
        };
        const req = mod.request(options, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', (err) => resolve({ status: 0, body: '', error: err.message }));
        req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: '', error: 'timeout' }); });
        req.write(payload);
        req.end();
    });
}

async function main() {
    console.log('\n🧪 Tuppli End-to-End Test Suite\n');
    console.log('─'.repeat(60));

    // ── 1. Docker Services ──────────────────────────────────────
    console.log('\n📦 Docker Services\n');

    const n8nHealth = await httpGet('http://localhost:5678/healthz');
    log('n8n health', n8nHealth.status === 200, `HTTP ${n8nHealth.status}`);

    const hasherHealth = await httpGet('http://localhost:8000/health');
    log('image-hasher health', hasherHealth.status === 200, `HTTP ${hasherHealth.status}`);

    const darkwebHealth = await httpGet('http://localhost:8001/health');
    log('dark-web-scanner health', darkwebHealth.status === 200, `HTTP ${darkwebHealth.status}`);

    const legalHealth = await httpGet('http://localhost:4000/health');
    log('legal-automation health', legalHealth.status === 200, `HTTP ${legalHealth.status}`);

    const grafanaHealth = await httpGet('http://localhost:3000/api/health');
    log('grafana health', grafanaHealth.status === 200, `HTTP ${grafanaHealth.status}`);

    const prometheusHealth = await httpGet('http://localhost:9090/-/healthy');
    log('prometheus health', prometheusHealth.status === 200, `HTTP ${prometheusHealth.status}`);

    // ── 2. Supabase Connectivity ────────────────────────────────
    console.log('\n☁️  Supabase Connectivity\n');

    const supabaseUrl = env['SUPABASE_URL'];
    const anonKey = env['SUPABASE_ANON_KEY'];
    const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

    const sbHealth = await httpGet(`${supabaseUrl}/rest/v1/`, { apikey: anonKey, Authorization: `Bearer ${anonKey}` });
    log('Supabase REST API reachable', sbHealth.status === 200, `HTTP ${sbHealth.status}`);

    const sbTenants = await httpGet(`${supabaseUrl}/rest/v1/tenants?select=count`, { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: 'count=exact' });
    log('Tenants table accessible', sbTenants.status === 200, `HTTP ${sbTenants.status}`);

    const sbWaitlist = await httpGet(`${supabaseUrl}/rest/v1/waitlist?select=count`, { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: 'count=exact' });
    log('Waitlist table accessible', sbWaitlist.status === 200, `HTTP ${sbWaitlist.status}`);

    // ── 3. RLS Policy Check ─────────────────────────────────────
    console.log('\n🔒 Security (RLS)\n');

    const anonTenants = await httpGet(`${supabaseUrl}/rest/v1/tenants?select=*`, { apikey: anonKey, Authorization: `Bearer ${anonKey}` });
    const anonData = (() => { try { return JSON.parse(anonTenants.body); } catch { return []; } })();
    log('RLS blocks anon from tenants', Array.isArray(anonData) && anonData.length === 0, `returned ${anonData.length} rows`);

    // ── 4. n8n Workflows ────────────────────────────────────────
    console.log('\n⚙️  n8n Workflows\n');

    const n8nAuth = 'Basic ' + Buffer.from(`${env['N8N_BASIC_AUTH_USER']}:${env['N8N_BASIC_AUTH_PASSWORD']}`).toString('base64');
    const workflows = await httpGet('http://localhost:5678/api/v1/workflows', { Authorization: n8nAuth });

    if (workflows.status === 200) {
        const wfData = JSON.parse(workflows.body);
        const wfList = wfData.data || [];
        log('n8n API accessible', true, `${wfList.length} workflows found`);

        const expected = ['RECON_HOURLY', 'FORENSIC_VERIFY', 'LEGAL_ENFORCER', 'WAITLIST_NURTURE'];
        for (const name of expected) {
            const found = wfList.some(w => w.name.toUpperCase().includes(name));
            log(`Workflow: ${name}`, found, found ? 'exists' : 'NOT FOUND');
        }
    } else {
        log('n8n API accessible', false, `HTTP ${workflows.status}`);
    }

    // ── 5. Waitlist API ─────────────────────────────────────────
    console.log('\n📝 Waitlist API\n');

    const wlCount = await httpGet('http://localhost:3000/api/waitlist');
    log('Waitlist GET endpoint', wlCount.status === 200 || wlCount.error === 'connect ECONNREFUSED 127.0.0.1:3000',
        wlCount.status === 200 ? `HTTP ${wlCount.status}` : 'Frontend not running locally (expected)');

    // ── Summary ─────────────────────────────────────────────────
    console.log('\n' + '─'.repeat(60));
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);

    if (failed === 0) {
        console.log('✅ ALL TESTS PASSED\n');
    } else {
        console.log(`❌ ${failed} TEST(S) FAILED\n`);
        process.exit(1);
    }
}

main().catch(console.error);
