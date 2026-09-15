-- Tuppli Anti-Impersonation Allowlist Auto-Escalation
-- Migration: 007_allowlist_autoescalation.sql
-- Description: Adds auto-escalation support to impersonator_alerts and
--              creates an RPC function for the n8n allowlist check.

-- ============================================================================
-- 1. ADD AUTO-ESCALATION COLUMNS TO impersonator_alerts
-- ============================================================================

ALTER TABLE impersonator_alerts 
    ADD COLUMN IF NOT EXISTS auto_escalated BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS escalation_reason TEXT,
    ADD COLUMN IF NOT EXISTS auto_takedown_sent BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS takedown_sent_at TIMESTAMPTZ;

-- ============================================================================
-- 2. RPC FUNCTION: is_authorized_account
-- Called by RECON_HOURLY to check if a detected account is allowlisted.
-- Returns TRUE if the account belongs to the creator (skip it).
-- ============================================================================

CREATE OR REPLACE FUNCTION is_authorized_account(
    p_tenant_id UUID,
    p_platform VARCHAR,
    p_username VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM authorized_accounts
        WHERE tenant_id = p_tenant_id
          AND platform = LOWER(p_platform)
          AND LOWER(username) = LOWER(p_username)
          AND verification_status = 'verified'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. RPC FUNCTION: auto_flag_impersonator
-- Called by RECON_HOURLY when a non-allowlisted account is detected.
-- Inserts the alert and returns the alert ID for downstream escalation.
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_flag_impersonator(
    p_tenant_id UUID,
    p_platform VARCHAR,
    p_fake_username VARCHAR,
    p_fake_profile_url TEXT,
    p_fake_profile_image_url TEXT,
    p_similarity_score DECIMAL,
    p_detection_signals JSONB
) RETURNS UUID AS $$
DECLARE
    v_alert_id UUID;
    v_status VARCHAR;
    v_auto_escalated BOOLEAN;
    v_reason TEXT;
BEGIN
    -- Determine auto-escalation based on confidence score
    IF p_similarity_score >= 0.85 THEN
        v_status := 'confirmed';
        v_auto_escalated := true;
        v_reason := 'Auto-confirmed: similarity score ' || p_similarity_score || ' >= 0.85 threshold';
    ELSIF p_similarity_score >= 0.60 THEN
        v_status := 'pending';
        v_auto_escalated := false;
        v_reason := 'Flagged for review: similarity score ' || p_similarity_score;
    ELSE
        -- Below threshold, don't flag
        RETURN NULL;
    END IF;

    -- Check if this exact impersonator was already flagged (deduplication)
    SELECT id INTO v_alert_id
    FROM impersonator_alerts
    WHERE tenant_id = p_tenant_id
      AND platform = p_platform
      AND LOWER(fake_username) = LOWER(p_fake_username)
      AND status NOT IN ('dismissed', 'taken_down');

    IF v_alert_id IS NOT NULL THEN
        -- Already flagged, update the score if higher
        UPDATE impersonator_alerts
        SET similarity_score = GREATEST(similarity_score, p_similarity_score),
            detection_signals = p_detection_signals,
            updated_at = NOW()
        WHERE id = v_alert_id;
        RETURN v_alert_id;
    END IF;

    -- Insert new alert
    INSERT INTO impersonator_alerts (
        tenant_id, platform, fake_username, fake_profile_url,
        fake_profile_image_url, similarity_score, detection_signals,
        status, auto_escalated, escalation_reason
    ) VALUES (
        p_tenant_id, p_platform, p_fake_username, p_fake_profile_url,
        p_fake_profile_image_url, p_similarity_score, p_detection_signals,
        v_status, v_auto_escalated, v_reason
    ) RETURNING id INTO v_alert_id;

    RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
