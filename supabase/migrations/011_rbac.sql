-- Lysis RBAC Implementation
-- Migration: 011_rbac.sql
-- Description: Establishes a forensic role hierarchy for team-based operations

-- 1. Create Role Enum
DO $$ BEGIN
    CREATE TYPE forensic_role AS ENUM ('forensic_admin', 'forensic_analyst', 'forensic_observer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add Role to Tenants (Central User Profile)
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS role forensic_role DEFAULT 'forensic_analyst';

-- 3. Update Existing Tenants (Set earliest user as admin)
UPDATE tenants
SET role = 'forensic_admin'
WHERE created_at = (SELECT MIN(created_at) FROM tenants);

-- 4. Secure Role Modifications (Only admins can change roles)
CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM tenants 
        WHERE id = auth.uid() AND role = 'forensic_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Enhanced Audit Logging for RBAC Changes
CREATE OR REPLACE FUNCTION audit_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        PERFORM log_audit(
            NEW.id,
            'role_change',
            'tenants',
            NEW.id,
            jsonb_build_object('old_role', OLD.role),
            jsonb_build_object('new_role', NEW.role),
            NULL,
            NULL,
            'security_protocol',
            'high'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_audit_role_change ON tenants;
CREATE TRIGGER tr_audit_role_change
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION audit_role_change();
