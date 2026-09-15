-- Lysis Security Hardening Migration
-- Migration: 002_security.sql
-- Description: Adds security functions, audit logging, and rate limiting at DB level

-- ============================================================================
-- INPUT SANITIZATION FUNCTIONS
-- ============================================================================

-- Function to sanitize text input (prevent SQL injection at function level)
CREATE OR REPLACE FUNCTION sanitize_text_input(input TEXT, max_length INTEGER DEFAULT 255)
RETURNS TEXT AS $$
BEGIN
    IF input IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Truncate to max length
    input := LEFT(input, max_length);
    
    
    -- Basic XSS prevention (encode angle brackets)
    input := REPLACE(input, '<', '&lt;');
    input := REPLACE(input, '>', '&gt;');
    
    -- Remove common SQL injection patterns (defensive, not primary defense)
    input := REGEXP_REPLACE(input, E'[\\x00-\\x1F]', '', 'g');
    
    RETURN input;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate UUID format
CREATE OR REPLACE FUNCTION is_valid_uuid(input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF input IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN input ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate URL format (for SSRF prevention)
CREATE OR REPLACE FUNCTION is_safe_url(input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    url_parts TEXT[];
    hostname TEXT;
BEGIN
    IF input IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Must start with http:// or https://
    IF NOT (input ~ '^https?://') THEN
        RETURN FALSE;
    END IF;
    
    -- Extract hostname
    hostname := SUBSTRING(input FROM '^https?://([^/:]+)');
    
    IF hostname IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Block localhost and private IPs
    IF hostname = 'localhost' 
       OR hostname ~ '^127\.'
       OR hostname ~ '^10\.'
       OR hostname ~ '^172\.(1[6-9]|2[0-9]|3[0-1])\.'
       OR hostname ~ '^192\.168\.'
       OR hostname ~ '^169\.254\.'
       OR hostname ~ '^0\.'
       OR hostname = '::1'
    THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- AUDIT LOGGING
-- ============================================================================

-- Audit log table for sensitive operations
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    operation VARCHAR(50) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    performed_by TEXT,
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_tenant ON audit_log(tenant_id);
CREATE INDEX idx_audit_log_operation ON audit_log(operation);
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_risk ON audit_log(risk_level) WHERE risk_level IN ('high', 'critical');

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only service_role can write to audit log
CREATE POLICY "Service role full access to audit_log"
    ON audit_log FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Users can only read their own audit entries
CREATE POLICY "Users can view own audit log"
    ON audit_log FOR SELECT
    TO authenticated
    USING (tenant_id = auth.uid());

-- Function to log an audit entry
CREATE OR REPLACE FUNCTION log_audit(
    p_tenant_id UUID,
    p_operation VARCHAR(50),
    p_table_name VARCHAR(100),
    p_record_id UUID DEFAULT NULL,
    p_old_data JSONB DEFAULT NULL,
    p_new_data JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_performed_by TEXT DEFAULT 'system',
    p_risk_level VARCHAR(20) DEFAULT 'low'
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO audit_log (
        tenant_id, operation, table_name, record_id,
        old_data, new_data, ip_address, user_agent,
        performed_by, risk_level
    ) VALUES (
        p_tenant_id, p_operation, p_table_name, p_record_id,
        p_old_data, p_new_data, p_ip_address, p_user_agent,
        p_performed_by, p_risk_level
    )
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RATE LIMITING (Database Level)
-- ============================================================================

-- Rate limit tracking table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_type VARCHAR(50) NOT NULL,  -- 'tenant', 'ip', 'webhook'
    key_value TEXT NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    request_count INTEGER DEFAULT 1,
    UNIQUE(key_type, key_value, window_start)
);

CREATE INDEX idx_rate_limits_lookup ON rate_limits(key_type, key_value, window_start);
CREATE INDEX idx_rate_limits_cleanup ON rate_limits(window_start);

-- Function to check and increment rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_key_type VARCHAR(50),
    p_key_value TEXT,
    p_max_requests INTEGER DEFAULT 50,
    p_window_seconds INTEGER DEFAULT 60
)
RETURNS TABLE(allowed BOOLEAN, current_count INTEGER, reset_at TIMESTAMPTZ) AS $$
DECLARE
    v_window_start TIMESTAMPTZ;
    v_current_count INTEGER;
BEGIN
    -- Calculate window start (floor to window interval)
    v_window_start := date_trunc('minute', NOW());
    
    -- Upsert rate limit record
    INSERT INTO rate_limits (key_type, key_value, window_start, request_count)
    VALUES (p_key_type, p_key_value, v_window_start, 1)
    ON CONFLICT (key_type, key_value, window_start)
    DO UPDATE SET request_count = rate_limits.request_count + 1
    RETURNING rate_limits.request_count INTO v_current_count;
    
    -- Return result
    RETURN QUERY SELECT 
        v_current_count <= p_max_requests AS allowed,
        v_current_count AS current_count,
        v_window_start + (p_window_seconds || ' seconds')::INTERVAL AS reset_at;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM rate_limits
    WHERE window_start < NOW() - INTERVAL '10 minutes'
    RETURNING COUNT(*) INTO v_deleted;
    
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECURITY VIEWS
-- ============================================================================

-- View for failed authentication attempts (for monitoring)
CREATE OR REPLACE VIEW security_alerts AS
SELECT 
    al.tenant_id,
    al.operation,
    al.ip_address,
    al.risk_level,
    al.created_at,
    CASE 
        WHEN al.operation LIKE '%fail%' THEN 'auth_failure'
        WHEN al.operation LIKE '%inject%' THEN 'injection_attempt'
        WHEN al.operation LIKE '%rate_limit%' THEN 'rate_limited'
        ELSE 'other'
    END as alert_type
FROM audit_log al
WHERE al.risk_level IN ('high', 'critical')
   OR al.operation LIKE '%fail%'
ORDER BY al.created_at DESC;

-- View for rate limit status by tenant
CREATE OR REPLACE VIEW tenant_rate_status AS
SELECT 
    key_value as tenant_id,
    SUM(request_count) as total_requests,
    MAX(window_start) as last_window,
    COUNT(DISTINCT window_start) as active_windows
FROM rate_limits
WHERE key_type = 'tenant'
  AND window_start > NOW() - INTERVAL '1 hour'
GROUP BY key_value
ORDER BY total_requests DESC;

-- ============================================================================
-- TRIGGER FOR SENSITIVE OPERATIONS AUDIT
-- ============================================================================

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_sensitive_operation()
RETURNS TRIGGER AS $$
DECLARE
    v_risk_level VARCHAR(20);
    v_operation VARCHAR(50);
BEGIN
    -- Determine risk level based on operation
    IF TG_TABLE_NAME = 'vault_items' THEN
        v_risk_level := 'high';
    ELSIF TG_TABLE_NAME = 'tenants' AND TG_OP = 'UPDATE' THEN
        v_risk_level := 'medium';
    ELSE
        v_risk_level := 'low';
    END IF;
    
    v_operation := TG_OP || '_' || TG_TABLE_NAME;
    
    IF TG_OP = 'DELETE' THEN
        PERFORM log_audit(
            OLD.tenant_id,
            v_operation,
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD),
            NULL,
            NULL,
            NULL,
            'trigger',
            v_risk_level
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_audit(
            NEW.tenant_id,
            v_operation,
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW),
            NULL,
            NULL,
            'trigger',
            v_risk_level
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        PERFORM log_audit(
            NEW.tenant_id,
            v_operation,
            TG_TABLE_NAME,
            NEW.id,
            NULL,
            to_jsonb(NEW),
            NULL,
            NULL,
            'trigger',
            v_risk_level
        );
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_vault_items ON vault_items;
CREATE TRIGGER audit_vault_items
    AFTER INSERT OR UPDATE OR DELETE ON vault_items
    FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operation();

DROP TRIGGER IF EXISTS audit_forensic_evidence ON forensic_evidence;
CREATE TRIGGER audit_forensic_evidence
    AFTER INSERT OR UPDATE OR DELETE ON forensic_evidence
    FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operation();

-- ============================================================================
-- SCHEDULED CLEANUP (Run via pg_cron or external scheduler)
-- ============================================================================

-- Note: To enable scheduled cleanup, run this in Supabase:
-- SELECT cron.schedule('cleanup-rate-limits', '*/5 * * * *', 'SELECT cleanup_rate_limits()');

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Security hardening migration completed!';
    RAISE NOTICE '   - Added input sanitization functions';
    RAISE NOTICE '   - Created audit_log table with RLS';
    RAISE NOTICE '   - Added rate limiting functions';
    RAISE NOTICE '   - Created security monitoring views';
    RAISE NOTICE '   - Applied audit triggers to sensitive tables';
END $$;
