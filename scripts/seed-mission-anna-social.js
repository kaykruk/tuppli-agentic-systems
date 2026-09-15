const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seedSocialMission() {
    console.log('--- Mission Extension: Social Media Audit (Anna Kochanius) ---');

    // 1. Get Tenant
    const { data: tenants } = await supabase.from('tenants').select('id').limit(1);
    const tenantId = tenants[0].id;

    // 2. Seed Social Intelligence Data
    const socialFindings = [
        {
            tenant_id: tenantId,
            intel_name: 'Subreddit: r/AnnaK_Vault (Active Leaks)',
            intel_type: 'social_media',
            source: 'Reddit',
            source_url: 'https://reddit.com/r/AnnaK_Vault',
            threat_level: 'critical',
            ai_summary: 'Dedicated subreddit sharing encrypted links to decentralized hosters. 1.2k active subscribers.',
            discovered_at: new Date().toISOString()
        },
        {
            tenant_id: tenantId,
            intel_name: '@AK_Leaks_HQ (Twitter Bot Network)',
            intel_type: 'social_media',
            source: 'Twitter/X',
            source_url: 'https://twitter.com/AK_Leaks_HQ',
            threat_level: 'high',
            ai_summary: 'Automated account sharing watermarked snippets. High conversion rate to Telegram "Leak" channels detected.',
            discovered_at: new Date().toISOString()
        }
    ];

    const { error: iError } = await supabase.from('intelligence_data').insert(socialFindings);
    if (iError) {
        console.error('Error seeding social intel:', iError);
    } else {
        console.log('✅ 2 Social Media Findings Seeded (Reddit & Twitter)');
    }

    // 3. Create Legal Cases for Social Suppression
    const cases = [
        {
            tenant_id: tenantId,
            case_number: `DMCA-REDD-AK-${Math.random().toString(36).substring(7).toUpperCase()}`,
            case_name: 'Subreddit Takedown: r/AnnaK_Vault',
            case_type: 'dmca',
            status: 'notice_sent',
            priority: 'critical',
            infringing_url: 'https://reddit.com/r/AnnaK_Vault',
            platform: 'Reddit',
            dmca_notice_sent_at: new Date().toISOString()
        },
        {
            tenant_id: tenantId,
            case_number: `ABUSE-X-AK-${Math.random().toString(36).substring(7).toUpperCase()}`,
            case_name: 'Twitter Profile Report: @AK_Leaks_HQ',
            case_type: 'impersonation',
            status: 'notice_sent',
            priority: 'high',
            infringing_url: 'https://twitter.com/AK_Leaks_HQ',
            platform: 'Twitter',
            metadata: { report_type: 'copyright_violation' },
            dmca_notice_sent_at: new Date().toISOString()
        }
    ];

    const { error: cError } = await supabase.from('legal_cases').insert(cases);
    if (cError) {
        console.error('Error creating social cases:', cError);
    } else {
        console.log('✅ 2 Enforcement Cases Opened (Reddit & Twitter)');
    }

    console.log('--- Social Media Audit Complete ---');
}

seedSocialMission();
