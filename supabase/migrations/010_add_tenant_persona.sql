-- Migration: 010_add_tenant_persona.sql
-- Description: Adds a persona field to the tenants table to support specialized creator niches.

-- Add persona column to tenants
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS persona TEXT DEFAULT 'premium_creator';

-- Index for persona-based dashboard lookups
CREATE INDEX IF NOT EXISTS idx_tenants_persona ON tenants(persona);
