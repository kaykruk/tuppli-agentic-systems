const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seedMission() {
    console.log('--- Starting Mission: Anna Kochanius ---');

    // 1. Get Tenant
    const { data: tenants, error: tError } = await supabase.from('tenants').select('id, display_name').limit(1);
    if (tError || !tenants.length) {
        console.error('Error fetching tenant:', tError);
        return;
    }
    const tenantId = tenants[0].id;
    console.log(`Found Tenant: ${tenants[0].display_name} (${tenantId})`);

    // 2. Create Recon Target
    const { data: target, error: rError } = await supabase.from('recon_targets').insert({
        tenant_id: tenantId,
        target_name: 'Anna Kochanius',
        target_type: 'creator_name',
        target_value: 'Anna Kochanius',
        target_aliases: ['Anna K', 'A. Kochanius', 'AnnaK Leak'],
        status: 'completed',
        priority: 10,
        last_scanned_at: new Date().toISOString()
    }).select().single();

    if (rError) {
        console.error('Error creating recon target:', rError);
    } else {
        console.log('✅ Recon Target Created: Anna Kochanius');
    }

    // 3. Seed Intelligence Data (Findings)
    const findings = [
        {
            tenant_id: tenantId,
            intel_name: 'Mega Folder: Anna Kochanius Full Archive 2026',
            intel_type: 'forum',
            source: 'CyberLeak Forum',
            source_url: 'https://cyberleak.com/thread/anna-kochanius-archive',
            threat_level: 'critical',
            ai_summary: 'Massive unencrypted archive containing 400+ forensic assets. High-volume distribution detected.',
            discovered_at: new Date().toISOString()
        },
        {
            tenant_id: tenantId,
            intel_name: 'Anna Kochanius - Exclusive Early Access (Mirror)',
            intel_type: 'surface_web',
            source: 'Google Search Result',
            source_url: 'https://leaked-hub.xyz/anna-kochanius',
            threat_level: 'high',
            ai_summary: 'Indexed URL on leached-hub.xyz appearing on Page 1 for broad creator searches.',
            discovered_at: new Date().toISOString()
        },
        {
            tenant_id: tenantId,
            intel_name: 'AnnaK Premium Content Blowout',
            intel_type: 'marketplace',
            source: 'PirateBay Mirror',
            source_url: 'https://thepiratebay.com/search/anna-kochanius',
            threat_level: 'medium',
            ai_summary: 'Historical torrent listing with active seeders. Low-latency distribution detected.',
            discovered_at: new Date().toISOString()
        }
    ];

    const { data: intel, error: iError } = await supabase.from('intelligence_data').insert(findings).select();
    if (iError) {
        console.error('Error seeding intel:', iError);
    } else {
        console.log('✅ 3 Intelligence Findings Seeded');
    }

    // 4. Seed Forensic Evidence (Specific Files)
    const evidence = [
        {
            tenant_id: tenantId,
            evidence_name: 'anna_k_beach_shoot_master.jpg',
            evidence_type: 'image',
            source_platform: 'forum',
            source_url: 'https://cyberleak.com/assets/anna_k_beach_shoot_master.jpg',
            similarity_score: 0.985,
            verification_status: 'matched',
            phash_image: '8c8c8c8c8c8c8c8c',
            discovered_at: new Date().toISOString()
        },
        {
            tenant_id: tenantId,
            evidence_name: 'anna_k_behind_the_scenes_vlog.mp4',
            evidence_type: 'video',
            source_platform: 'surface_web',
            source_url: 'https://leaked-hub.xyz/files/anna_k_behind_the_scenes_vlog.mp4',
            similarity_score: 0.942,
            verification_status: 'matched',
            phash_video: 'f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0',
            discovered_at: new Date().toISOString()
        }
    ];

    const { data: ev, error: eError } = await supabase.from('forensic_evidence').insert(evidence).select();
    if (eError) {
        console.error('Error seeding evidence:', eError);
    } else {
        console.log('✅ 2 Forensic Evidence Items Seeded');
    }

    console.log('--- Seeding Complete. Ready for Enforcement ---');
}

seedMission();
