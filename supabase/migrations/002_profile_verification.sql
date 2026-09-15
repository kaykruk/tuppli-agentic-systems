-- Lysis Profile & Verification Schema
-- Migration: 002_profile_verification.sql
-- Description: Adds tables for authorized accounts and impersonator detection

-- ============================================================================
-- AUTHORIZED ACCOUNTS TABLE
-- Stores creator's verified social media accounts
-- ============================================================================

CREATE TABLE IF NOT EXISTS authorized_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Platform info
    platform VARCHAR(50) NOT NULL CHECK (platform IN (
        'twitter', 'instagram', 'onlyfans', 'fansly', 'pornhub', 
        'reddit', 'tiktok', 'youtube', 'website', 'other'
    )),
    username VARCHAR(255) NOT NULL,
    profile_url TEXT,
    account_type VARCHAR(20) DEFAULT 'personal' 
        CHECK (account_type IN ('personal', 'agency')),
    
    -- Verification
    verification_status VARCHAR(20) DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'verified', 'failed')),
    verification_method VARCHAR(20),
    verification_code VARCHAR(50) UNIQUE, -- e.g., LYS-A7K92
    verified_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, platform, username)
);

CREATE INDEX idx_authorized_accounts_tenant ON authorized_accounts(tenant_id);
CREATE INDEX idx_authorized_accounts_status ON authorized_accounts(verification_status);

-- ============================================================================
-- IMPERSONATOR ALERTS TABLE
-- Stores detected fake accounts impersonating creators
-- ============================================================================

CREATE TABLE IF NOT EXISTS impersonator_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Fake account info
    platform VARCHAR(50) NOT NULL,
    fake_username VARCHAR(255),
    fake_profile_url TEXT,
    fake_profile_image_url TEXT,
    
    -- Detection
    similarity_score DECIMAL(3,2) CHECK (similarity_score >= 0 AND similarity_score <= 1),
    detection_signals JSONB, -- username_match, photo_match, bio_match, etc.
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'dismissed', 'reported', 'taken_down')),
    reported_at TIMESTAMPTZ,
    report_status VARCHAR(50), -- platform response
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_impersonator_alerts_tenant ON impersonator_alerts(tenant_id);
CREATE INDEX idx_impersonator_alerts_status ON impersonator_alerts(status);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Authorized accounts - users only see their own
ALTER TABLE authorized_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY authorized_accounts_tenant_isolation ON authorized_accounts
    FOR ALL USING (tenant_id = auth.uid());

-- Impersonator alerts - users only see their own
ALTER TABLE impersonator_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY impersonator_alerts_tenant_isolation ON impersonator_alerts
    FOR ALL USING (tenant_id = auth.uid());

-- ============================================================================
-- UPDATE TRIGGER FOR TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_authorized_accounts_updated_at
    BEFORE UPDATE ON authorized_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_impersonator_alerts_updated_at
    BEFORE UPDATE ON impersonator_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
