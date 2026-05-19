-- =====================================================
-- Migration: Add Hashtags Column to Users Table
-- Description: Allows users to add hashtags to their profile for discovery
-- =====================================================

-- Add hashtags column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS hashtags TEXT DEFAULT NULL;

-- Create index on hashtags for search optimization
-- Note: PostgreSQL LIKE queries can be slow on large datasets
-- Consider using full-text search or trigram extension for production
CREATE INDEX IF NOT EXISTS idx_users_hashtags ON users USING GIN(to_tsvector('english', hashtags));

-- =====================================================
-- Notes
-- =====================================================

-- Hashtags format:
-- - Comma-separated: "golang,maps,travel"
-- - JSON array: ["golang", "maps", "travel"]
-- 
-- The application should normalize the format consistently.
-- When searching, split by comma or parse JSON array depending on chosen format.
