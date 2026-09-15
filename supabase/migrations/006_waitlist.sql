-- Migration: 006_waitlist.sql
-- Description: Creates waitlist table for capturing early interest

CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'invited', 'onboarded')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Anonymous users can INSERT (to join list)
CREATE POLICY "Public can join waitlist" 
ON waitlist FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 2. Only Service Role can SELECT/UPDATE (Admins/Systems)
CREATE POLICY "Service role full access to waitlist" 
ON waitlist FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 3. No public SELECT access (prevent scraping email lists)
-- (Implicit deny for everyone else)
