-- Migration: Create sales_leads table for Twitter Recon
CREATE TABLE IF NOT EXISTS public.sales_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,
    username VARCHAR(255) NOT NULL,
    tweet_url VARCHAR(500) NOT NULL,
    tweet_text TEXT NOT NULL,
    ai_analysis JSONB,
    status VARCHAR(50) DEFAULT 'new_lead',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users with role 'service_role' (n8n API) to insert/update
CREATE POLICY "Allow service role to manage sales leads" 
    ON public.sales_leads
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Create an index to speed up lookups by status
CREATE INDEX IF NOT EXISTS idx_sales_leads_status ON public.sales_leads(status);
