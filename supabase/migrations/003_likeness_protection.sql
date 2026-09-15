-- Migration: 003_likeness_protection.sql
-- Description: Expands vault item types to support Likeness and Voice protection

-- Update vault_items check constraint (Supabase usually needs drop and recreate)
ALTER TABLE vault_items DROP CONSTRAINT IF EXISTS vault_items_item_type_check;
ALTER TABLE vault_items ADD CONSTRAINT vault_items_item_type_check 
CHECK (item_type IN ('master_image', 'master_video', 'master_audio', 'voice_signature', 'likeness_map', 'watermark_key', 'api_credential', 'signature', 'other'));
