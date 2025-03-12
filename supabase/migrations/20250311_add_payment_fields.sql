-- Add payment tracking fields to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
