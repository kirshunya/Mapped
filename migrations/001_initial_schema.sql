-- =====================================================
-- Mapped Application - Initial Database Schema
-- PostgreSQL with PostGIS
-- Version: 1.0.0
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- AUTH SERVICE TABLES
-- =====================================================

-- Users table - Core user accounts
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    avatar VARCHAR(500),
    bio TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =====================================================
-- PLACES SERVICE TABLES
-- =====================================================

-- Groups table - Private sharing groups
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_groups_owner_id ON groups(owner_id);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    username VARCHAR(100),
    user_avatar VARCHAR(500),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_group_members_unique ON group_members(group_id, user_id);

-- Places table - Location data with geo coordinates
CREATE TABLE IF NOT EXISTS places (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address VARCHAR(500),
    category VARCHAR(100),
    privacy VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'private', 'group')),
    approval VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (approval IN ('pending', 'approved', 'rejected')),
    group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
    rating DOUBLE PRECISION NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    user_id INTEGER NOT NULL,
    username VARCHAR(100),
    user_avatar VARCHAR(500),
    media_urls TEXT, -- JSON array stored as text
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_places_user_id ON places(user_id);
CREATE INDEX IF NOT EXISTS idx_places_group_id ON places(group_id);
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_places_privacy ON places(privacy);
CREATE INDEX IF NOT EXISTS idx_places_approval ON places(approval);
CREATE INDEX IF NOT EXISTS idx_places_is_deleted ON places(is_deleted);
CREATE INDEX IF NOT EXISTS idx_places_location ON places(latitude, longitude);

-- Optional: Create a PostGIS geography column for efficient spatial queries
-- ALTER TABLE places ADD COLUMN IF NOT EXISTS geom GEOGRAPHY(POINT, 4326);
-- CREATE INDEX IF NOT EXISTS idx_places_geom ON places USING GIST(geom);
-- UPDATE places SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography WHERE geom IS NULL;

-- =====================================================
-- REVIEWS SERVICE TABLES
-- =====================================================

-- Reviews table - Place reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    place_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    username VARCHAR(100),
    user_avatar VARCHAR(500),
    user_role VARCHAR(50),
    content TEXT,
    rating DOUBLE PRECISION NOT NULL CHECK (rating >= 0 AND rating <= 5),
    media_urls TEXT, -- JSON array stored as text
    like_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Reactions table - Review reactions (likes, etc.)
CREATE TABLE IF NOT EXISTS reactions (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reactions_review_id ON reactions(review_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reactions_unique ON reactions(review_id, user_id, type);

-- Comments table - Review comments (supports nesting)
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_review_id ON comments(review_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- =====================================================
-- POSTS SERVICE TABLES
-- =====================================================

-- Posts table - Social feed posts
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username VARCHAR(100),
    user_avatar VARCHAR(500),
    content TEXT,
    media_urls TEXT, -- JSON array stored as text
    place_id INTEGER,
    place_name VARCHAR(200),
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_place_id ON posts(place_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Post comments table
CREATE TABLE IF NOT EXISTS post_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    username VARCHAR(100),
    user_avatar VARCHAR(500),
    content TEXT NOT NULL,
    media_urls TEXT, -- JSON array stored as text
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);

-- Post reactions table - likes/dislikes
CREATE TABLE IF NOT EXISTS post_reactions (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON post_reactions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_reactions_unique ON post_reactions(post_id, user_id);

-- Comment reactions table
CREATE TABLE IF NOT EXISTS comment_reactions (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON comment_reactions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_comment_reactions_unique ON comment_reactions(comment_id, user_id);

-- =====================================================
-- CHAT SERVICE TABLES
-- =====================================================

-- Chats table - Chat rooms (direct and group)
CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    type VARCHAR(20) NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
    owner_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chats_owner_id ON chats(owner_id);
CREATE INDEX IF NOT EXISTS idx_chats_type ON chats(type);

-- Chat members table
CREATE TABLE IF NOT EXISTS chat_members (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    username VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_members_chat_id ON chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON chat_members(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_members_unique ON chat_members(chat_id, user_id);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    username VARCHAR(100),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['users', 'groups', 'places', 'reviews', 'comments', 'posts', 'chats'])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$;

-- Function to update place rating when reviews are added/modified
CREATE OR REPLACE FUNCTION update_place_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE places
        SET 
            rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE place_id = NEW.place_id), 0),
            review_count = (SELECT COUNT(*) FROM reviews WHERE place_id = NEW.place_id)
        WHERE id = NEW.place_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE places
        SET 
            rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE place_id = OLD.place_id), 0),
            review_count = (SELECT COUNT(*) FROM reviews WHERE place_id = OLD.place_id)
        WHERE id = OLD.place_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_place_rating ON reviews;
CREATE TRIGGER trigger_update_place_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_place_rating();

-- Function to update post comment count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_post_comment_count ON post_comments;
CREATE TRIGGER trigger_update_post_comment_count
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW
EXECUTE FUNCTION update_post_comment_count();

-- Function to update post like count
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.type = 'like' THEN
            UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.type = 'like' THEN
            UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.type = 'like' AND NEW.type != 'like' THEN
            UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = NEW.post_id;
        ELSIF OLD.type != 'like' AND NEW.type = 'like' THEN
            UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_post_like_count ON post_reactions;
CREATE TRIGGER trigger_update_post_like_count
AFTER INSERT OR DELETE OR UPDATE ON post_reactions
FOR EACH ROW
EXECUTE FUNCTION update_post_like_count();

-- =====================================================
-- SEED DATA (Optional - for development)
-- =====================================================

-- Insert a default admin user (password: admin123 - hashed with bcrypt)
-- Note: In production, create admin user through proper registration flow
-- INSERT INTO users (email, username, password, role, is_active)
-- VALUES (
--     'admin@mapped.app',
--     'admin',
--     '$2a$10$rX9hJ0qP8yE1fK9dL3mZ9OP2WsUvBnQw8xYz7cN6kM4jH3gI2fE1a', -- admin123
--     'admin',
--     true
-- ) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- GRANTS (for application user)
-- =====================================================

-- Ensure the application user has proper permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mapsocial;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mapsocial;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO mapsocial;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'Core user accounts for authentication';
COMMENT ON TABLE places IS 'Location data with geo coordinates';
COMMENT ON TABLE groups IS 'Private sharing groups for places';
COMMENT ON TABLE group_members IS 'Group membership associations';
COMMENT ON TABLE reviews IS 'User reviews for places';
COMMENT ON TABLE reactions IS 'Reactions (likes) on reviews';
COMMENT ON TABLE comments IS 'Comments on reviews with nested support';
COMMENT ON TABLE posts IS 'Social feed posts';
COMMENT ON TABLE post_comments IS 'Comments on posts';
COMMENT ON TABLE post_reactions IS 'Reactions (likes/dislikes) on posts';
COMMENT ON TABLE comment_reactions IS 'Reactions on post comments';
COMMENT ON TABLE chats IS 'Chat rooms (direct and group)';
COMMENT ON TABLE chat_members IS 'Chat room participants';
COMMENT ON TABLE chat_messages IS 'Chat messages';
