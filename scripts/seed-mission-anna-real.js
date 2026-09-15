const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seedRealMission() {
    console.log('--- Real-World Mission: Anna Kochanius Forensic Intel ---');

    // 1. Get Tenant
    const { data: tenants } = await supabase.from('tenants').select('id').limit(1);
    const tenantId = tenants[0].id;

    // 2. Seed REAL Intelligence Data found by Browser Subagent
    const realFindings = [
        {
            tenant_id: tenantId,
            intel_name: 'WaifuBitches Gallery: Anna-Kochanius',
            intel_type: 'surface_web',
            source: 'WaifuBitches',
            source_url: 'https://waifubitches.com/model/Anna-Kochanius',
            threat_level: 'critical',
            ai_summary: 'High-volume image gallery identified. Contains 150+ forensic matches. Active distribution node.',
            discovered_at: new Date().toISOString()
        },
        {
            tenant_id: tenantId,
            intel_name: 'Thotflix Video Leak (Massive Archive)',
            intel_type: 'surface_web',
            source: 'Thotflix',
            source_url: 'https://thotflix.com/new-onlyfans-free/anna-kochanius-massive-tits-nipple-pasties-onlyfans-video-78f5820a/',
            threat_level: 'critical',
            ai_summary: 'Primary video distribution node. High visibility in search engine results.',
            discovered_at: new Date().toISOString()
        },
        {
            tenant_id: tenantId,
            intel_name: 'BodGirls Solo Video: Anna K Kochetova',
            intel_type: 'surface_web',
            source: 'BodGirls',
            source_url: 'https://bodgirls.com/videos/video/onlyfans-anna-kochetova-kochansucks-kochanius-solo/',
            threat_level: 'high',
            ai_summary: 'Video archive correctly mapping "Kochetova" alias to the "kochanius" OnlyFans profile.',
            discovered_at: new Date().toISOString()
        }
    ];

    const { error: iError } = await supabase.from('intelligence_data').insert(realFindings);
    if (iError) {
        console.error('Error seeding real intel:', iError);
    } else {
        console.log('✅ 3 REAL Infringing URLs Seeded into Tuppli Database');
    }

    console.log('--- Mission Intel Synchronized ---');
}

seedRealMission();
