-- Migration: Add ROI Metrics and Escalation Tracking
-- Description: Tracks the total views and estimated revenue saved per target, and supports tracking deepfakes/impersonators.

-- 1. Update the recon_targets table
ALTER TABLE recon_targets
ADD COLUMN IF NOT EXISTS total_views_saved BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_revenue_recovered_cents BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_type TEXT DEFAULT 'keyword' CHECK (target_type IN ('keyword', 'alias', 'face_embedding', 'watermark_id', 'impersonator_account'));

-- 2. Update the intelligence_data table
ALTER TABLE intelligence_data
ADD COLUMN IF NOT EXISTS views_at_discovery BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_revenue_value_cents BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'unknown' CHECK (media_type IN ('video', 'image', 'text', 'archive', 'profile', 'unknown')),
ADD COLUMN IF NOT EXISTS is_impersonator BOOLEAN DEFAULT false;

-- 3. Update the legal_cases table
ALTER TABLE legal_cases
ADD COLUMN IF NOT EXISTS escalation_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS latest_escalation_target TEXT; -- e.g., 'Cloudflare', 'Namecheap'

-- 4. Enable RLS on the new columns (inherited from the table, but good practice to state intent)
-- The existing policies on these tables will naturally cover these new columns for SELECT/UPDATE by tenant_id.

