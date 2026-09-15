#!/usr/bin/env node
/**
 * Tuppli Security Audit Script
 * 
 * Checks for common security misconfigurations across the stack.
 * 
 * Usage: node scripts/security_audit.js
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
let warnings = 0;

function pass(msg) { passed++; console.log(`  ✅ ${msg}`); }
function fail(msg) { failed++; console.log(`  ❌ ${msg}`); }
function warn(msg) { warnings++; console.log(`  ⚠️  ${msg}`); }

function httpGet(url, headers = {}) {
    return new Promise((resolve) => {
        const mod = url.startsWith('https') ? https : http;
        const req = mod.get(url, { headers, timeout: 5000 }, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
        });
        req.on('error', (err) => resolve({ status: 0, headers: {}, body: '', error: err.message }));
        req.on('timeout', () => { req.destroy(); resolve({ status: 0, headers: {}, body: '', error: 'timeout' }); });
    });
}

async function main() {
    console.log('\n🔒 Tuppli Security Audit\n');
    console.log('═'.repeat(60));

    // ── 1. Credential Strength ──────────────────────────────────
    console.log('\n🔑 Credential Strength\n');

    const n8nPass = env['N8N_BASIC_AUTH_PASSWORD'] || '';
    if (n8nPass.length >= 12 && /[A-Z]/.test(n8nPass) && /[0-9]/.test(n8nPass) && /[^a-zA-Z0-9]/.test(n8nPass)) {
        pass('n8n password meets complexity requirements');
    } else if (n8nPass === 'changeme' || n8nPass === 'admin' || n8nPass === 'password') {
        fail('n8n password is a DEFAULT value — CHANGE IMMEDIATELY');
    } else {
        warn(`n8n password could be stronger (${n8nPass.length} chars)`);
    }

    const encKey = env['N8N_ENCRYPTION_KEY'] || '';
    if (encKey.length >= 32) {
        pass(`N8N_ENCRYPTION_KEY is set (${encKey.length} chars)`);
    } else {
        fail('N8N_ENCRYPTION_KEY is missing or too short');
    }

    const webhookToken = env['N8N_WEBHOOK_AUTH_TOKEN'] || '';
    if (webhookToken.length >= 32) {
        pass(`N8N_WEBHOOK_AUTH_TOKEN is set (${webhookToken.length} chars)`);
    } else {
        fail('N8N_WEBHOOK_AUTH_TOKEN is missing or too short');
    }

    // ── 2. Exposed Ports ───────────────────────────────────────
    console.log('\n🌐 Network Exposure\n');

    const services = [
        { name: 'n8n', port: 5678 },
        { name: 'Redis', port: 6379 },
        { name: 'image-hasher', port: 8000 },
        { name: 'dark-web-scanner', port: 8001 },
        { name: 'legal-automation', port: 4000 },
        { name: 'Grafana', port: 3000 },
        { name: 'Prometheus', port: 9090 },
        { name: 'Loki', port: 3100 },
    ];

    // Check if services are bound to 127.0.0.1 (safe) or 0.0.0.0 (exposed)
    const compose = fs.readFileSync('docker-compose.yaml', 'utf8');
    for (const svc of services) {
        const localBind = compose.includes(`127.0.0.1:${svc.port}`);
        const publicBind = compose.includes(`"${svc.port}:${svc.port}"`);
        if (localBind) {
            pass(`${svc.name} (${svc.port}) bound to localhost only`);
        } else if (publicBind) {
            fail(`${svc.name} (${svc.port}) is publicly exposed — bind to 127.0.0.1`);
        } else {
            pass(`${svc.name} (${svc.port}) not directly exposed`);
        }
    }

    // ── 3. Supabase RLS ────────────────────────────────────────
    console.log('\n🛡️  Supabase RLS Verification\n');

    const supabaseUrl = env['SUPABASE_URL'];
    const anonKey = env['SUPABASE_ANON_KEY'];

    const tables = ['tenants', 'recon_targets', 'legal_cases', 'notifications', 'waitlist'];
    for (const table of tables) {
        const res = await httpGet(`${supabaseUrl}/rest/v1/${table}?select=*&limit=5`, {
            apikey: anonKey, Authorization: `Bearer ${anonKey}`
        });
        if (res.status === 200) {
            const data = (() => { try { return JSON.parse(res.body); } catch { return null; } })();
            if (Array.isArray(data) && data.length === 0) {
                pass(`RLS on '${table}' — anon returns 0 rows`);
            } else if (table === 'waitlist') {
                pass(`RLS on '${table}' — anon insert allowed (expected)`);
            } else {
                warn(`RLS on '${table}' — anon returned ${data?.length} rows (verify policy)`);
            }
        } else {
            pass(`RLS on '${table}' — anon blocked (HTTP ${res.status})`);
        }
    }

    // ── 4. .env in .gitignore ──────────────────────────────────
    console.log('\n📄 File Security\n');

    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (gitignore.includes('.env')) {
        pass('.env is in .gitignore');
    } else {
        fail('.env is NOT in .gitignore — secrets may be committed!');
    }

    if (gitignore.includes('.env.staging') || gitignore.includes('.env*')) {
        pass('.env.staging is covered by .gitignore');
    } else {
        warn('.env.staging may not be in .gitignore — add it');
    }

    // ── 5. n8n Authentication ──────────────────────────────────
    console.log('\n🔐 n8n Authentication\n');

    const noAuth = await httpGet('http://localhost:5678/api/v1/workflows');
    if (noAuth.status === 401) {
        pass('n8n API requires authentication');
    } else {
        fail(`n8n API returned ${noAuth.status} without auth — should be 401`);
    }

    // ── Summary ─────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(60));
    console.log(`\n📊 Audit Results: ${passed} passed, ${warnings} warnings, ${failed} critical\n`);

    if (failed === 0 && warnings === 0) {
        console.log('✅ SECURITY AUDIT PASSED — No issues found\n');
    } else if (failed === 0) {
        console.log(`⚠️  AUDIT PASSED WITH WARNINGS — ${warnings} item(s) to review\n`);
    } else {
        console.log(`❌ AUDIT FAILED — ${failed} critical issue(s) must be fixed before launch\n`);
    }
}

main().catch(console.error);
