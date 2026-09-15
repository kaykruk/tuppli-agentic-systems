-- Migration: 004_api_keys.sql
-- Description: Infrastructure for Tuppli API Gateway (Lysis Connect)

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL, -- Human-friendly name for the key (e.g. "Law Firm Dashboard")
    key_prefix VARCHAR(8) NOT NULL, -- Visible prefix (e.g. "tp_")
    hashed_key TEXT NOT NULL, -- PBKDF2 or SHA-256 hash of the full key
    
    scopes TEXT[] DEFAULT '{"read:discoveries", "write:enforcement"}',
    
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance and lookup
CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

-- RLS Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys"
    ON api_keys FOR SELECT
    TO authenticated
    USING (tenant_id = auth.uid());

CREATE POLICY "Users can create own API keys"
    ON api_keys FOR INSERT
    TO authenticated
    WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can revoke own API keys"
    ON api_keys FOR UPDATE
    TO authenticated
    USING (tenant_id = auth.uid())
    WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Service role full access to api_keys"
    ON api_keys FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
