-- Add Paddle billing columns to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS paddle_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS paddle_subscription_id VARCHAR(255);
