-- Migration: 012_add_brand_variations.sql
-- Description: Adds brand variations column to tenants for forensic monitoring

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS brand_variations TEXT[] DEFAULT '{}';
