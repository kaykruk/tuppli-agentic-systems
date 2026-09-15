-- Migration: 003_onboarding_updates.sql
-- Description: Updates enum for new tiers and adds bio to tenants

-- Add new tier values
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'basic';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'professional';

-- Add bio column to tenants
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS bio TEXT;
