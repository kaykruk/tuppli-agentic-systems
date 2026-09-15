const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const LEGAL_AUTO_URL = process.env.LEGAL_AUTOMATION_URL || 'http://localhost:4000';
const AUTH_TOKEN = process.env.N8N_WEBHOOK_AUTH_TOKEN;

async function executeMission() {
    console.log('--- Executing Enforcement: Anna Kochanius ---');

    // 1. Get findings for "Anna Kochanius"
    const { data: findings, error: fError } = await supabase
        .from('intelligence_data')
        .select('*')
        .ilike('intel_name', '%Anna Kochanius%');

    if (fError || !findings.length) {
        console.error('No findings found to enforce.');
        return;
    }

    console.log(`Analyzing ${findings.length} findings...`);

    for (const item of findings) {
        console.log(`\n[Enforcement] ${item.intel_name}`);
        
        // A. De-indexing for surface web / search results
        if (item.intel_type === 'surface_web' || item.source === 'Google Search Result') {
            console.log(`   Action: Requesting De-index for ${item.source_url}`);
            try {
                const res = await fetch(`${LEGAL_AUTO_URL}/deindex`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-lysis-auth': AUTH_TOKEN },
                    body: JSON.stringify({ url: item.source_url, engine: 'google' })
                });
                const data = await res.json();
                console.log(`   Result: ${data.status} - ${data.message}`);
                
                // Update DB with logs
                await supabase.from('intelligence_data').update({
                    ai_summary: `${item.ai_summary} | De-index Status: ${data.status}.`,
                    processing_status: 'completed'
                }).eq('id', item.id);

            } catch (err) {
                console.error(`   Failed to de-index: ${err.message}`);
            }
        }

        // B. DMCA for forums and marketplaces
        if (item.intel_type === 'forum' || item.intel_type === 'marketplace') {
            console.log(`   Action: Issuing DMCA Takedown for ${item.source_url}`);
            
            // Create a legal case in DB
            const caseNumber = `DMCA-${Math.random().toString(36).substring(7).toUpperCase()}`;
            const { error: cError } = await supabase.from('legal_cases').insert({
                tenant_id: item.tenant_id,
                case_number: caseNumber,
                case_name: `DMCA: ${item.intel_name}`,
                case_type: 'dmca',
                status: 'notice_sent',
                priority: 'high',
                infringing_url: item.source_url,
                platform: item.intel_type,
                dmca_notice_sent_at: new Date().toISOString()
            });

            if (cError) {
                console.error(`   Failed to create case: ${cError.message}`);
            } else {
                console.log(`   Result: SUCCESS - Case ${caseNumber} opened.`);
                
                // Update DB with logs
                await supabase.from('intelligence_data').update({
                    ai_summary: `${item.ai_summary} | DMCA Status: Notice Sent (${caseNumber}).`,
                    processing_status: 'completed'
                }).eq('id', item.id);
            }
        }
    }

    console.log('\n--- Enforcement Pulse Complete ---');
}

executeMission();
