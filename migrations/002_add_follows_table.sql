-- =====================================================
-- Mapped Application - Add Following System
-- Version: 2.0.0
-- =====================================================

-- Follows table - User following/followers relationships
CREATE TABLE IF NOT EXISTS follows (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at);

-- Comments on the new table
COMMENT ON TABLE follows IS 'User following relationships for social features';
COMMENT ON COLUMN follows.follower_id IS 'User ID of the follower';
COMMENT ON COLUMN follows.following_id IS 'User ID of the user being followed';
COMMENT ON COLUMN follows.created_at IS 'Timestamp when the follow relationship was created';

-- Add helper function to get follower count
CREATE OR REPLACE FUNCTION get_follower_count(user_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN COUNT(*)::INTEGER FROM follows WHERE following_id = user_id;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add helper function to get following count
CREATE OR REPLACE FUNCTION get_following_count(user_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN COUNT(*)::INTEGER FROM follows WHERE follower_id = user_id;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Grant permissions on new table
GRANT ALL PRIVILEGES ON follows TO mapsocial;
GRANT ALL PRIVILEGES ON SEQUENCE follows_id_seq TO mapsocial;
GRANT EXECUTE ON FUNCTION get_follower_count TO mapsocial;
GRANT EXECUTE ON FUNCTION get_following_count TO mapsocial;
