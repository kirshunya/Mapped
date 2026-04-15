package repository

import (
	"github.com/mapsocial/posts-service/internal/models"
	"gorm.io/gorm"
)

type PostsRepository struct {
	db *gorm.DB
}

func NewPostsRepository(db *gorm.DB) *PostsRepository {
	return &PostsRepository{db: db}
}

// Posts
func (r *PostsRepository) CreatePost(post *models.Post) error {
	return r.db.Create(post).Error
}

func (r *PostsRepository) GetPostByID(id uint) (*models.Post, error) {
	var post models.Post
	err := r.db.First(&post, id).Error
	return &post, err
}

func (r *PostsRepository) GetFeed(limit, offset int) ([]models.Post, error) {
	var posts []models.Post
	err := r.db.Order("created_at DESC").Limit(limit).Offset(offset).Find(&posts).Error
	return posts, err
}

func (r *PostsRepository) GetUserPosts(userID uint, limit, offset int) ([]models.Post, error) {
	var posts []models.Post
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Limit(limit).Offset(offset).Find(&posts).Error
	return posts, err
}

func (r *PostsRepository) DeletePost(id uint) error {
	return r.db.Delete(&models.Post{}, id).Error
}

func (r *PostsRepository) IncrementCommentCount(postID uint) error {
	return r.db.Model(&models.Post{}).Where("id = ?", postID).UpdateColumn("comment_count", gorm.Expr("comment_count + ?", 1)).Error
}

func (r *PostsRepository) DecrementCommentCount(postID uint) error {
	return r.db.Model(&models.Post{}).Where("id = ?", postID).UpdateColumn("comment_count", gorm.Expr("comment_count - ?", 1)).Error
}

// Comments
func (r *PostsRepository) CreateComment(comment *models.PostComment) error {
	return r.db.Create(comment).Error
}

func (r *PostsRepository) GetCommentsByPostID(postID uint) ([]models.PostComment, error) {
	var comments []models.PostComment
	err := r.db.Where("post_id = ?", postID).Order("created_at DESC").Find(&comments).Error
	return comments, err
}

func (r *PostsRepository) DeleteComment(id uint) error {
	return r.db.Delete(&models.PostComment{}, id).Error
}

func (r *PostsRepository) GetCommentByID(id uint) (*models.PostComment, error) {
	var comment models.PostComment
	err := r.db.First(&comment, id).Error
	return &comment, err
}

// Post Reactions
func (r *PostsRepository) GetPostReaction(postID, userID uint) (*models.PostReaction, error) {
	var reaction models.PostReaction
	err := r.db.Where("post_id = ? AND user_id = ?", postID, userID).First(&reaction).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &reaction, err
}

func (r *PostsRepository) CreatePostReaction(reaction *models.PostReaction) error {
	return r.db.Create(reaction).Error
}

func (r *PostsRepository) UpdatePostReaction(postID, userID uint, reactionType string) error {
	return r.db.Model(&models.PostReaction{}).
		Where("post_id = ? AND user_id = ?", postID, userID).
		Update("type", reactionType).Error
}

func (r *PostsRepository) DeletePostReaction(postID, userID uint) error {
	return r.db.Where("post_id = ? AND user_id = ?", postID, userID).Delete(&models.PostReaction{}).Error
}

func (r *PostsRepository) GetPostReactionCounts(postID uint) (likes, dislikes int64, err error) {
	err = r.db.Model(&models.PostReaction{}).Where("post_id = ? AND type = ?", postID, "like").Count(&likes).Error
	if err != nil {
		return 0, 0, err
	}
	err = r.db.Model(&models.PostReaction{}).Where("post_id = ? AND type = ?", postID, "dislike").Count(&dislikes).Error
	return likes, dislikes, err
}

func (r *PostsRepository) UpdatePostLikeCount(postID uint, count int) error {
	return r.db.Model(&models.Post{}).Where("id = ?", postID).Update("like_count", count).Error
}

// Comment Reactions
func (r *PostsRepository) GetCommentReaction(commentID, userID uint) (*models.CommentReaction, error) {
	var reaction models.CommentReaction
	err := r.db.Where("comment_id = ? AND user_id = ?", commentID, userID).First(&reaction).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &reaction, err
}

func (r *PostsRepository) CreateCommentReaction(reaction *models.CommentReaction) error {
	return r.db.Create(reaction).Error
}

func (r *PostsRepository) UpdateCommentReaction(commentID, userID uint, reactionType string) error {
	return r.db.Model(&models.CommentReaction{}).
		Where("comment_id = ? AND user_id = ?", commentID, userID).
		Update("type", reactionType).Error
}

func (r *PostsRepository) DeleteCommentReaction(commentID, userID uint) error {
	return r.db.Where("comment_id = ? AND user_id = ?", commentID, userID).Delete(&models.CommentReaction{}).Error
}

func (r *PostsRepository) GetCommentReactionCounts(commentID uint) (likes, dislikes int64, err error) {
	err = r.db.Model(&models.CommentReaction{}).Where("comment_id = ? AND type = ?", commentID, "like").Count(&likes).Error
	if err != nil {
		return 0, 0, err
	}
	err = r.db.Model(&models.CommentReaction{}).Where("comment_id = ? AND type = ?", commentID, "dislike").Count(&dislikes).Error
	return likes, dislikes, err
}
