package service

import (
	"encoding/json"
	"errors"

	"github.com/mapsocial/posts-service/internal/models"
	"github.com/mapsocial/posts-service/internal/repository"
)

type PostsService struct {
	repo *repository.PostsRepository
}

func NewPostsService(repo *repository.PostsRepository) *PostsService {
	return &PostsService{repo: repo}
}

// Posts
func (s *PostsService) CreatePost(userID uint, username, userAvatar string, req *models.CreatePostRequest) (*models.Post, error) {
	if userID == 0 {
		return nil, errors.New("unauthorized")
	}
	if req.Content == "" && len(req.MediaURLs) == 0 {
		return nil, errors.New("content or media required")
	}
	mediaJSON, _ := json.Marshal(req.MediaURLs)

	post := &models.Post{
		UserID:     userID,
		Username:   username,
		UserAvatar: userAvatar,
		Content:    req.Content,
		MediaURLs:  string(mediaJSON),
		PlaceID:    req.PlaceID,
		PlaceName:  req.PlaceName,
	}

	err := s.repo.CreatePost(post)
	return post, err
}

func (s *PostsService) GetPost(id, userID uint) (*models.PostResponse, error) {
	post, err := s.repo.GetPostByID(id)
	if err != nil {
		return nil, err
	}

	reaction, _ := s.repo.GetPostReaction(id, userID)
	resp := &models.PostResponse{
		Post:         *post,
		UserLiked:    reaction != nil && reaction.Type == "like",
		UserDisliked: reaction != nil && reaction.Type == "dislike",
	}
	return resp, nil
}

func (s *PostsService) GetFeed(userID uint, limit, offset int) ([]models.PostResponse, error) {
	if limit == 0 {
		limit = 20
	}

	posts, err := s.repo.GetFeed(limit, offset)
	if err != nil {
		return nil, err
	}

	resp := make([]models.PostResponse, len(posts))
	for i, post := range posts {
		reaction, _ := s.repo.GetPostReaction(post.ID, userID)
		resp[i] = models.PostResponse{
			Post:         post,
			UserLiked:    reaction != nil && reaction.Type == "like",
			UserDisliked: reaction != nil && reaction.Type == "dislike",
		}
	}
	return resp, nil
}

func (s *PostsService) GetUserPosts(targetUserID, requesterID uint, limit, offset int) ([]models.PostResponse, error) {
	if limit == 0 {
		limit = 20
	}

	posts, err := s.repo.GetUserPosts(targetUserID, limit, offset)
	if err != nil {
		return nil, err
	}

	resp := make([]models.PostResponse, len(posts))
	for i, post := range posts {
		reaction, _ := s.repo.GetPostReaction(post.ID, requesterID)
		resp[i] = models.PostResponse{
			Post:         post,
			UserLiked:    reaction != nil && reaction.Type == "like",
			UserDisliked: reaction != nil && reaction.Type == "dislike",
		}
	}
	return resp, nil
}

func (s *PostsService) DeletePost(postID, userID uint) error {
	post, err := s.repo.GetPostByID(postID)
	if err != nil {
		return err
	}
	if post.UserID != userID {
		return errors.New("not authorized")
	}
	return s.repo.DeletePost(postID)
}

// Comments
func (s *PostsService) CreateComment(postID, userID uint, username, userAvatar string, req *models.CreateCommentRequest) (*models.PostComment, error) {
	mediaJSON, _ := json.Marshal(req.MediaURLs)

	comment := &models.PostComment{
		PostID:     postID,
		UserID:     userID,
		Username:   username,
		UserAvatar: userAvatar,
		Content:    req.Content,
		MediaURLs:  string(mediaJSON),
	}

	err := s.repo.CreateComment(comment)
	if err == nil {
		_ = s.repo.IncrementCommentCount(postID)
	}
	return comment, err
}

func (s *PostsService) GetComments(postID, userID uint) ([]models.CommentResponse, error) {
	comments, err := s.repo.GetCommentsByPostID(postID)
	if err != nil {
		return nil, err
	}

	resp := make([]models.CommentResponse, len(comments))
	for i, comment := range comments {
		reaction, _ := s.repo.GetCommentReaction(comment.ID, userID)
		likes, dislikes, _ := s.repo.GetCommentReactionCounts(comment.ID)
		resp[i] = models.CommentResponse{
			PostComment:  comment,
			UserLiked:    reaction != nil && reaction.Type == "like",
			UserDisliked: reaction != nil && reaction.Type == "dislike",
			LikeCount:    int(likes),
			DislikeCount: int(dislikes),
		}
	}
	return resp, nil
}

func (s *PostsService) DeleteComment(commentID, userID uint) error {
	comment, err := s.repo.GetCommentByID(commentID)
	if err != nil {
		return err
	}
	if comment.UserID != userID {
		return errors.New("not authorized")
	}
	err = s.repo.DeleteComment(commentID)
	if err == nil {
		_ = s.repo.DecrementCommentCount(comment.PostID)
	}
	return err
}

// Post Reactions
func (s *PostsService) ReactToPost(postID, userID uint, reactionType string) error {
	existingReaction, err := s.repo.GetPostReaction(postID, userID)
	if err != nil {
		return err
	}

	if existingReaction == nil {
		// Create new reaction
		reaction := &models.PostReaction{
			PostID: postID,
			UserID: userID,
			Type:   reactionType,
		}
		err = s.repo.CreatePostReaction(reaction)
	} else if existingReaction.Type == reactionType {
		// Remove reaction (toggle off)
		err = s.repo.DeletePostReaction(postID, userID)
	} else {
		// Update reaction type
		err = s.repo.UpdatePostReaction(postID, userID, reactionType)
	}

	if err != nil {
		return err
	}

	// Update post like count
	likes, _, _ := s.repo.GetPostReactionCounts(postID)
	_ = s.repo.UpdatePostLikeCount(postID, int(likes))
	return nil
}

// Comment Reactions
func (s *PostsService) ReactToComment(commentID, userID uint, reactionType string) error {
	existingReaction, err := s.repo.GetCommentReaction(commentID, userID)
	if err != nil {
		return err
	}

	if existingReaction == nil {
		// Create new reaction
		reaction := &models.CommentReaction{
			CommentID: commentID,
			UserID:    userID,
			Type:      reactionType,
		}
		return s.repo.CreateCommentReaction(reaction)
	} else if existingReaction.Type == reactionType {
		// Remove reaction (toggle off)
		return s.repo.DeleteCommentReaction(commentID, userID)
	} else {
		// Update reaction type
		return s.repo.UpdateCommentReaction(commentID, userID, reactionType)
	}
}
