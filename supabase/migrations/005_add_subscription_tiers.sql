-- Migration: 005_add_subscription_tiers.sql
-- Description: Adds 'basic' and 'professional' to the subscription_tier enum type

-- We use ALTER TYPE to safely add new values to the enum
-- Note: This cannot be run inside a transaction block in some older Postgres versions, 
-- but Supabase usually handles it fine.

ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'basic';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'professional';
