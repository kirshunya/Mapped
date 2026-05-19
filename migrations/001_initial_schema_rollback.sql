-- =====================================================
-- Mapped Application - Rollback Initial Schema
-- WARNING: This will destroy all data!
-- =====================================================

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_update_post_like_count ON post_reactions;
DROP TRIGGER IF EXISTS trigger_update_post_comment_count ON post_comments;
DROP TRIGGER IF EXISTS trigger_update_place_rating ON reviews;

-- Drop updated_at triggers
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['users', 'groups', 'places', 'reviews', 'comments', 'posts', 'chats'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;', t, t);
    END LOOP;
END;
$$;

-- Drop functions
DROP FUNCTION IF EXISTS update_post_like_count();
DROP FUNCTION IF EXISTS update_post_comment_count();
DROP FUNCTION IF EXISTS update_place_rating();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in order (respecting foreign key constraints)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_members CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS comment_reactions CASCADE;
DROP TABLE IF EXISTS post_reactions CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Note: Extensions are not dropped as they may be used by other databases
-- DROP EXTENSION IF EXISTS "postgis";
-- DROP EXTENSION IF EXISTS "uuid-ossp";
