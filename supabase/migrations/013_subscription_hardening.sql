-- Migration: 013_subscription_hardening.sql
-- Description: Standardizes tiers and sets default to 'unpaid' to prevent auto-pro entry.

-- Add 'unpaid' and 'pro' to the enum if they don't exist
-- Note: 'freemium' and 'professional' might already exist from previous migrations
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'unpaid';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'pro';

-- Set 'unpaid' as the default for new tenants
ALTER TABLE tenants ALTER COLUMN tier SET DEFAULT 'unpaid';

-- Move existing 'freemium' users to 'unpaid'
UPDATE tenants SET tier = 'unpaid' WHERE tier = 'freemium';

-- Ensure the specific test user is on the 'elite' plan
UPDATE tenants SET tier = 'elite' WHERE email = 'kenechukwuudeh.tech@gmail.com';
