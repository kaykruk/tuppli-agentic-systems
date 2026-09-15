-- Lysis Database Schema (Multi-Tenant SaaS Edition)
-- Migration: 001_initial_schema.sql
-- Description: Creates all tables, indexes, and RLS policies for multi-tenant Lysis platform
-- ⚠️ WARNING: Run this migration only once during initial setup!

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TENANT TIERS ENUM
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('freemium', 'elite');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TENANTS TABLE
-- Central tenant/user management with subscription info
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name VARCHAR(255),
    tier subscription_tier DEFAULT 'freemium',
    
    -- Subscription & Billing
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'paused')),
    credits_remaining INTEGER DEFAULT 10,
    credits_reset_at TIMESTAMPTZ,
    
    -- Feature flags
    active BOOLEAN DEFAULT true,
    dark_web_enabled BOOLEAN DEFAULT false,
    api_access_enabled BOOLEAN DEFAULT false,
    
    -- Onboarding
    onboarded_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenants_tier ON tenants(tier);
CREATE INDEX idx_tenants_active ON tenants(active) WHERE active = true;
CREATE INDEX idx_tenants_stripe ON tenants(stripe_customer_id);

-- ============================================================================
-- RECON_TARGETS Table
-- Stores reconnaissance targets and scan results per tenant
-- ============================================================================

CREATE TABLE IF NOT EXISTS recon_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    target_name VARCHAR(255) NOT NULL,
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('domain', 'ip', 'organization', 'person', 'creator_name')),
    target_value TEXT NOT NULL,
    target_aliases TEXT[], -- Alternative names/spellings to search
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'scanning', 'completed', 'failed')),
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    
    -- Scan results (JSONB for flexibility)
    whois_data JSONB,
    dns_records JSONB,
    subdomains JSONB,
    exposed_credentials JSONB,
    search_results JSONB, -- Gemini-powered search results
    matched_content JSONB, -- pHash matches found
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_scanned_at TIMESTAMPTZ,
    next_scan_at TIMESTAMPTZ,
    
    -- Notes
    notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_recon_targets_tenant ON recon_targets(tenant_id);
CREATE INDEX idx_recon_targets_status ON recon_targets(status);
CREATE INDEX idx_recon_targets_priority ON recon_targets(priority DESC);
CREATE INDEX idx_recon_targets_next_scan ON recon_targets(tenant_id, next_scan_at) WHERE status = 'pending';
CREATE INDEX idx_recon_targets_type ON recon_targets(target_type);

-- ============================================================================
-- FORENSIC_EVIDENCE Table
-- Stores digital forensic evidence with chain of custody per tenant
-- ============================================================================

CREATE TABLE IF NOT EXISTS forensic_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    evidence_name VARCHAR(255) NOT NULL,
    evidence_type VARCHAR(100) NOT NULL,
    case_id VARCHAR(100),
    
    -- Content fingerprints (NO raw media stored!)
    phash_image VARCHAR(64), -- Perceptual hash for images
    phash_video VARCHAR(128), -- Perceptual hash for video keyframes
    similarity_score DECIMAL(5,4), -- Match confidence (0.0000 to 1.0000)
    
    -- Source information
    source_url TEXT,
    source_platform VARCHAR(100),
    discovered_at TIMESTAMPTZ,
    
    -- File information (reference only, not stored)
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    -- Cryptographic hashes for integrity
    hash_md5 VARCHAR(32),
    hash_sha1 VARCHAR(40),
    hash_sha256 VARCHAR(64),
    hash_sha512 VARCHAR(128),
    
    -- Forensic watermark data (Elite tier)
    watermark_signature TEXT,
    traitor_trace_id VARCHAR(255),
    
    -- Chain of custody
    collected_by VARCHAR(255),
    collected_at TIMESTAMPTZ,
    verified_by VARCHAR(255),
    verified_at TIMESTAMPTZ,
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'tampered', 'matched')),
    
    -- Storage reference (Supabase Storage)
    storage_bucket VARCHAR(100),
    storage_path TEXT,
    
    -- Metadata
    metadata JSONB,
    tags TEXT[],
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Chain of custody log (append-only)
    custody_log JSONB DEFAULT '[]'::jsonb,
    notes TEXT
);

-- Indexes
CREATE INDEX idx_forensic_evidence_tenant ON forensic_evidence(tenant_id);
CREATE INDEX idx_forensic_evidence_case ON forensic_evidence(case_id);
CREATE INDEX idx_forensic_evidence_status ON forensic_evidence(verification_status);
CREATE INDEX idx_forensic_evidence_phash ON forensic_evidence(phash_image);
CREATE INDEX idx_forensic_evidence_hash_sha256 ON forensic_evidence(hash_sha256);
CREATE INDEX idx_forensic_evidence_tags ON forensic_evidence USING GIN(tags);

-- ============================================================================
-- LEGAL_CASES Table
-- Tracks legal enforcement cases and DMCA compliance per tenant
-- ============================================================================

CREATE TABLE IF NOT EXISTS legal_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    case_number VARCHAR(100) NOT NULL,
    case_name VARCHAR(255) NOT NULL,
    case_type VARCHAR(100) NOT NULL CHECK (case_type IN ('dmca', 'copyright', 'trademark', 'harassment', 'impersonation', 'other')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'notice_sent', 'pending_response', 'escalated', 'resolved', 'closed', 'archived')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- DMCA specific
    infringing_url TEXT,
    platform VARCHAR(100),
    dmca_notice_sent_at TIMESTAMPTZ,
    dmca_response_at TIMESTAMPTZ,
    takedown_confirmed BOOLEAN DEFAULT false,
    
    -- Parties involved
    infringer_info JSONB,
    assigned_to VARCHAR(255),
    
    -- Important dates
    filed_date DATE,
    deadline_date DATE,
    closed_date DATE,
    
    -- Case details
    description TEXT,
    
    -- Related evidence
    evidence_ids UUID[],
    
    -- Milestones & documents
    milestones JSONB DEFAULT '[]'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    metadata JSONB,
    tags TEXT[],
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Notes
    notes TEXT,
    
    -- Unique case number per tenant
    UNIQUE(tenant_id, case_number)
);

-- Indexes
CREATE INDEX idx_legal_cases_tenant ON legal_cases(tenant_id);
CREATE INDEX idx_legal_cases_status ON legal_cases(status);
CREATE INDEX idx_legal_cases_priority ON legal_cases(priority);
CREATE INDEX idx_legal_cases_deadline ON legal_cases(deadline_date) WHERE status NOT IN ('closed', 'archived');
CREATE INDEX idx_legal_cases_platform ON legal_cases(platform);
CREATE INDEX idx_legal_cases_tags ON legal_cases USING GIN(tags);

-- ============================================================================
-- VAULT_ITEMS Table
-- Secure vault for pHash fingerprints and encrypted signatures per tenant
-- ============================================================================

CREATE TABLE IF NOT EXISTS vault_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(100) NOT NULL CHECK (item_type IN ('master_image', 'master_video', 'watermark_key', 'api_credential', 'signature', 'other')),
    
    -- Content fingerprints (NEVER store raw media)
    phash VARCHAR(128),
    phash_variants JSONB, -- Alternative hashes for robustness
    
    -- Encrypted data (for sensitive items like watermark keys)
    encrypted_data TEXT,
    encryption_method VARCHAR(50) DEFAULT 'aes-256-gcm',
    
    -- Metadata (non-sensitive)
    original_filename VARCHAR(255),
    original_mime_type VARCHAR(100),
    category VARCHAR(100),
    tags TEXT[],
    
    -- Access control
    access_level VARCHAR(50) DEFAULT 'private' CHECK (access_level IN ('private', 'shared')),
    
    -- Sync status
    sync_status VARCHAR(50) DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'failed')),
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Version control
    version INTEGER DEFAULT 1,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Notes
    notes TEXT
);

-- Indexes
CREATE INDEX idx_vault_items_tenant ON vault_items(tenant_id);
CREATE INDEX idx_vault_items_type ON vault_items(item_type);
CREATE INDEX idx_vault_items_phash ON vault_items(phash);
CREATE INDEX idx_vault_items_tags ON vault_items USING GIN(tags);

-- ============================================================================
-- INTELLIGENCE_DATA Table
-- Stores decoded and processed intelligence information per tenant
-- ============================================================================

CREATE TABLE IF NOT EXISTS intelligence_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    intel_name VARCHAR(255) NOT NULL,
    intel_type VARCHAR(100) NOT NULL CHECK (intel_type IN ('surface_web', 'dark_web', 'social_media', 'forum', 'marketplace', 'other')),
    source VARCHAR(255),
    source_url TEXT,
    
    -- Search context
    search_query TEXT,
    search_platform VARCHAR(100),
    
    -- Raw and processed data
    raw_data TEXT,
    decoded_data JSONB,
    
    -- AI analysis (Gemini)
    ai_summary TEXT,
    threat_level VARCHAR(20) CHECK (threat_level IN ('none', 'low', 'medium', 'high', 'critical')),
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    
    -- Extracted entities
    entities JSONB DEFAULT '[]'::jsonb,
    keywords TEXT[],
    
    -- Related items
    related_evidence_ids UUID[],
    related_case_ids UUID[],
    
    -- Processing status
    processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- Metadata
    metadata JSONB,
    tags TEXT[],
    
    -- Timestamps
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Notes
    notes TEXT
);

-- Indexes
CREATE INDEX idx_intelligence_data_tenant ON intelligence_data(tenant_id);
CREATE INDEX idx_intelligence_data_type ON intelligence_data(intel_type);
CREATE INDEX idx_intelligence_data_status ON intelligence_data(processing_status);
CREATE INDEX idx_intelligence_data_threat ON intelligence_data(threat_level);
CREATE INDEX idx_intelligence_data_keywords ON intelligence_data USING GIN(keywords);
CREATE INDEX idx_intelligence_data_tags ON intelligence_data USING GIN(tags);
CREATE INDEX idx_intelligence_data_discovered ON intelligence_data(discovered_at DESC);

-- ============================================================================
-- NOTIFICATIONS Table
-- Stores notifications for tenants
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL CHECK (type IN ('threat_detected', 'case_update', 'dmca_response', 'system', 'billing')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
    
    -- Related entities
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    
    -- Status
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    -- Action URL
    action_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX idx_notifications_unread ON notifications(tenant_id, read) WHERE read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- Auto-update updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recon_targets_updated_at BEFORE UPDATE ON recon_targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forensic_evidence_updated_at BEFORE UPDATE ON forensic_evidence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_cases_updated_at BEFORE UPDATE ON legal_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vault_items_updated_at BEFORE UPDATE ON vault_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intelligence_data_updated_at BEFORE UPDATE ON intelligence_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-tenant isolation: users can ONLY access their own data
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE recon_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE forensic_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =========================
-- TENANTS POLICIES
-- =========================

-- Users can read their own tenant record
CREATE POLICY "Users can view own tenant"
    ON tenants FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Users can update their own tenant (non-billing fields only)
CREATE POLICY "Users can update own tenant"
    ON tenants FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Service role has full access (for n8n workflows and admin)
CREATE POLICY "Service role full access to tenants"
    ON tenants FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =========================
-- RECON_TARGETS POLICIES
-- =========================

CREATE POLICY "Users can view own recon targets"
    ON recon_targets FOR SELECT
    TO authenticated
    USING (tenant_id = auth.uid());

CREATE POLICY "Users can create own recon targets"
    ON recon_targets FOR INSERT
    TO authenticated
    WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can update own recon targets"
    ON recon_targets FOR UPDATE
    TO authenticated
    USING (tenant_id = auth.uid())
    WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can delete own recon targets"
    ON recon_targets FOR DELETE
    TO authenticated
    USING (tenant_id = auth.uid());

CREATE POLICY "Service role full access to recon_targets"
    ON recon_targets FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =========================
-- FORENSIC_EVIDENCE POLICIES
-- =========================

CREATE POLICY "Users can view own forensic evidence"
    ON forensic_evidence FOR SELECT
    TO authenticated
    USING (tenant_id = auth.uid());

CREATE POLICY "Users can create own forensic evidence"
    ON forensic_evidence FOR INSERT
    TO authenticated
    WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can update own forensic evidence"
    ON forensic_evidence FOR UPDATE
    TO authenticated
    USING (tenant_id = auth.uid())
    WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can delete own forensic evidence"
    ON forensic_evidence FOR DELETE
    TO authenticated
    USING (tenant_id = auth.uid());

CREATE POLICY "Service role full access to forensic_evidence"
    ON forensic_evidence FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =========================
-- LEGAL_CASES POLICIES
-- =========================

CREATE POLICY "Users can view own legal cases"
    ON legal_cases FOR SELECT
    TO authenticated
    USING (tenant_id = auth.uid());

CREATE POLICY "Users can create own legal cases"
    ON legal_cases FOR INSERT
    TO authenticated
    WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can update own legal cases"
    ON legal_cases FOR UPDATE
    TO authenticated
    USING (tenant_id = auth.uid())
    WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can delete own legal cases"
    ON legal_cases FOR DELETE
    TO authenticated
    USING (tenant_id = auth.uid());

CREATE POLICY "Service role full access to legal_cases"
    ON legal_cases FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =========================
-- VAULT_ITEMS POLICIES
-- =========================

CREATE POLICY "Users can view own vault items"
    ON vault_items FOR SELECT
    TO authenticated
    USING (tenant_id = auth.uid());

CREATE POLICY "Users can create own vault items"
    ON vault_items FOR INSERT
    TO authenticated
    WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can update own vault items"
    ON vault_items FOR UPDATE
    TO authenticated
    USING (tenant_id = auth.uid())
    WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can delete own vault items"
    ON vault_items FOR DELETE
    TO authenticated
    USING (tenant_id = auth.uid());

CREATE POLICY "Service role full access to vault_items"
    ON vault_items FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =========================
-- INTELLIGENCE_DATA POLICIES
-- =========================

CREATE POLICY "Users can view own intelligence data"
    ON intelligence_data FOR SELECT
    TO authenticated
    USING (tenant_id = auth.uid());

CREATE POLICY "Users can create own intelligence data"
    ON intelligence_data FOR INSERT
    TO authenticated
    WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can update own intelligence data"
    ON intelligence_data FOR UPDATE
    TO authenticated
    USING (tenant_id = auth.uid())
    WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can delete own intelligence data"
    ON intelligence_data FOR DELETE
    TO authenticated
    USING (tenant_id = auth.uid());

CREATE POLICY "Service role full access to intelligence_data"
    ON intelligence_data FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =========================
-- NOTIFICATIONS POLICIES
-- =========================

CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (tenant_id = auth.uid());

CREATE POLICY "Users can update own notifications (mark read)"
    ON notifications FOR UPDATE
    TO authenticated
    USING (tenant_id = auth.uid())
    WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Service role full access to notifications"
    ON notifications FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to create tenant on user signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.tenants (id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create tenant on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to add custody log entry
CREATE OR REPLACE FUNCTION add_custody_log_entry(
    p_evidence_id UUID,
    p_action TEXT,
    p_performed_by TEXT,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
    UPDATE forensic_evidence
    SET custody_log = custody_log || jsonb_build_object(
        'timestamp', NOW(),
        'action', p_action,
        'performed_by', p_performed_by,
        'details', p_details
    )
    WHERE id = p_evidence_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check tenant tier
CREATE OR REPLACE FUNCTION get_tenant_tier(p_tenant_id UUID)
RETURNS subscription_tier AS $$
DECLARE
    v_tier subscription_tier;
BEGIN
    SELECT tier INTO v_tier FROM tenants WHERE id = p_tenant_id;
    RETURN COALESCE(v_tier, 'freemium');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if tenant has feature access
CREATE OR REPLACE FUNCTION tenant_has_feature(p_tenant_id UUID, p_feature TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_tenant tenants%ROWTYPE;
BEGIN
    SELECT * INTO v_tenant FROM tenants WHERE id = p_tenant_id;
    
    IF NOT FOUND OR NOT v_tenant.active THEN
        RETURN false;
    END IF;
    
    CASE p_feature
        WHEN 'dark_web' THEN
            RETURN v_tenant.tier = 'elite' AND v_tenant.dark_web_enabled;
        WHEN 'forensic_tracing' THEN
            RETURN v_tenant.tier = 'elite';
        WHEN 'api_access' THEN
            RETURN v_tenant.tier = 'elite' AND v_tenant.api_access_enabled;
        WHEN 'hourly_scan' THEN
            RETURN v_tenant.tier = 'elite';
        ELSE
            RETURN true; -- Default features available to all
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement credits
CREATE OR REPLACE FUNCTION decrement_tenant_credits(p_tenant_id UUID, p_amount INTEGER DEFAULT 1)
RETURNS INTEGER AS $$
DECLARE
    v_remaining INTEGER;
BEGIN
    UPDATE tenants
    SET credits_remaining = credits_remaining - p_amount
    WHERE id = p_tenant_id AND credits_remaining >= p_amount
    RETURNING credits_remaining INTO v_remaining;
    
    RETURN COALESCE(v_remaining, -1); -- -1 indicates insufficient credits
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Active reconnaissance targets for scheduling
CREATE OR REPLACE VIEW active_recon_targets AS
SELECT 
    rt.id,
    rt.tenant_id,
    rt.target_name,
    rt.target_type,
    rt.target_value,
    rt.status,
    rt.priority,
    rt.last_scanned_at,
    rt.next_scan_at,
    t.tier,
    t.active as tenant_active
FROM recon_targets rt
JOIN tenants t ON rt.tenant_id = t.id
WHERE rt.status IN ('pending', 'scanning')
  AND t.active = true
ORDER BY rt.priority DESC, rt.next_scan_at ASC;

-- Pending legal case deadlines
CREATE OR REPLACE VIEW upcoming_legal_deadlines AS
SELECT 
    lc.id,
    lc.tenant_id,
    lc.case_number,
    lc.case_name,
    lc.case_type,
    lc.deadline_date,
    lc.priority,
    (lc.deadline_date - CURRENT_DATE) as days_until_deadline
FROM legal_cases lc
JOIN tenants t ON lc.tenant_id = t.id
WHERE lc.status NOT IN ('closed', 'archived')
  AND lc.deadline_date IS NOT NULL
  AND lc.deadline_date >= CURRENT_DATE
  AND t.active = true
ORDER BY lc.deadline_date ASC;

-- Recent threat intelligence
CREATE OR REPLACE VIEW recent_threats AS
SELECT 
    id.id,
    id.tenant_id,
    id.intel_name,
    id.intel_type,
    id.source,
    id.threat_level,
    id.ai_summary,
    id.discovered_at
FROM intelligence_data id
JOIN tenants t ON id.tenant_id = t.id
WHERE id.threat_level IN ('medium', 'high', 'critical')
  AND id.discovered_at > NOW() - INTERVAL '7 days'
  AND t.active = true
ORDER BY 
    CASE id.threat_level 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
    END,
    id.discovered_at DESC;

-- ============================================================================
-- COMPLETION VERIFICATION
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('tenants', 'recon_targets', 'forensic_evidence', 'legal_cases', 'vault_items', 'intelligence_data', 'notifications');
    
    -- Count RLS policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    IF table_count = 7 THEN
        RAISE NOTICE '✅ SUCCESS: All 7 tables created successfully!';
    ELSE
        RAISE WARNING '⚠️ WARNING: Expected 7 tables, found %', table_count;
    END IF;
    
    RAISE NOTICE '📋 RLS Policies created: %', policy_count;
END $$;
