-- Migration: 004_payment_provider_switch.sql
-- Description: Switches payment provider schema from Stripe to LemonSqueezy
-- Renames columns in tenants table to reflect the new provider

-- 1. Rename Stripe columns to LemonSqueezy
ALTER TABLE tenants 
RENAME COLUMN stripe_customer_id TO lemonsqueezy_customer_id;

ALTER TABLE tenants 
RENAME COLUMN stripe_subscription_id TO lemonsqueezy_subscription_id;

-- 2. Add LemonSqueezy specific indexes (dropping old ones if they exist)
DROP INDEX IF EXISTS idx_tenants_stripe;
CREATE INDEX idx_tenants_lemonsqueezy ON tenants(lemonsqueezy_customer_id);

-- 3. Add variant_id column for plan tracking (useful for LemonSqueezy)
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS lemonsqueezy_variant_id VARCHAR(255);

-- 4. Create index for variant_id
CREATE INDEX idx_tenants_lemonsqueezy_variant ON tenants(lemonsqueezy_variant_id);
