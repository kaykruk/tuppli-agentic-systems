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

const sqlFile = process.argv[2] || 'supabase/migrations/007_allowlist_autoescalation.sql';
const sql = fs.readFileSync(sqlFile, 'utf8');

// Split into individual statements
const statements = sql
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

const url = new URL(env['SUPABASE_URL']);

async function runStatement(stmt) {
    return new Promise((resolve) => {
        const payload = JSON.stringify({ query: stmt + ';' });
        const options = {
            hostname: url.hostname, port: 443, method: 'POST',
            path: '/rest/v1/rpc/exec_sql',
            headers: {
                'apikey': env['SUPABASE_SERVICE_ROLE_KEY'],
                'Authorization': 'Bearer ' + env['SUPABASE_SERVICE_ROLE_KEY'],
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
            }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.write(payload);
        req.end();
    });
}

async function main() {
    console.log('Running migration:', sqlFile);
    console.log('Statements:', statements.length);

    // Try running as a single batch first via the SQL Editor endpoint
    const payload = JSON.stringify({ query: sql });
    const options = {
        hostname: url.hostname, port: 443, method: 'POST',
        path: '/rest/v1/rpc/exec_sql',
        headers: {
            'apikey': env['SUPABASE_SERVICE_ROLE_KEY'],
            'Authorization': 'Bearer ' + env['SUPABASE_SERVICE_ROLE_KEY'],
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
        }
    };

    const result = await new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.write(payload);
        req.end();
    });

    if (result.status === 200) {
        console.log('Migration applied successfully via exec_sql');
    } else {
        console.log('exec_sql returned:', result.status, result.body.substring(0, 200));
        console.log('\nNote: You may need to run this migration manually via the Supabase SQL Editor:');
        console.log('  1. Go to https://supabase.com/dashboard');
        console.log('  2. Open SQL Editor');
        console.log('  3. Paste the contents of', sqlFile);
        console.log('  4. Click Run');
    }
}

main();
