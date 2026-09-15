-- Migration: 002_auto_pilot.sql
-- Description: Adds configuration for automated enforcement (Auto-Pilot)

-- Add auto_pilot_config to tenants for global and asset-level settings
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS auto_pilot_config JSONB DEFAULT '{
    "global_enabled": false,
    "confidence_threshold": 0.95,
    "auto_approve_platforms": ["google", "bing", "duckduckgo", "instagram", "onlyfans"],
    "asset_overrides": {}
}'::jsonb;

-- Function to check if auto-pilot is enabled for a specific asset
CREATE OR REPLACE FUNCTION is_auto_pilot_enabled(p_tenant_id UUID, p_asset_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_config JSONB;
    v_asset_enabled BOOLEAN;
BEGIN
    SELECT auto_pilot_config INTO v_config FROM tenants WHERE id = p_tenant_id;
    
    -- Check asset override first
    v_asset_enabled := (v_config->'asset_overrides'->>p_asset_name)::BOOLEAN;
    
    IF v_asset_enabled IS NOT NULL THEN
        RETURN v_asset_enabled;
    END IF;
    
    -- Fallback to global setting
    RETURN (v_config->>'global_enabled')::BOOLEAN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
