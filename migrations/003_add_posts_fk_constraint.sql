-- =====================================================
-- Migration: Add Foreign Key Constraint on posts.user_id
-- Description: Enforce referential integrity between posts and users tables
-- =====================================================

-- Add foreign key constraint on posts.user_id
ALTER TABLE posts
ADD CONSTRAINT fk_posts_user_id
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- Add foreign key constraint on post_comments.user_id
ALTER TABLE post_comments
ADD CONSTRAINT fk_post_comments_user_id
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- Add foreign key constraint on post_reactions.user_id
ALTER TABLE post_reactions
ADD CONSTRAINT fk_post_reactions_user_id
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- Add foreign key constraint on comment_reactions.user_id
ALTER TABLE comment_reactions
ADD CONSTRAINT fk_comment_reactions_user_id
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- =====================================================
-- Verification
-- =====================================================

-- Note: These constraints ensure:
-- 1. All posts must belong to a valid user
-- 2. All post comments must be by a valid user
-- 3. All post reactions must be by a valid user
-- 4. All comment reactions must be by a valid user
-- 5. When a user is deleted, all their posts/comments/reactions are cascade deleted
