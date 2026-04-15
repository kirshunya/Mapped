import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  Avatar,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  ThumbDown,
  ThumbDownOutlined,
  Send,
} from '@mui/icons-material';
import { postsAPI } from '../../services/api';

const Comment = ({ comment, onUpdate }) => {
  const [likeCount, setLikeCount] = useState(comment.like_count || 0);
  const [userLiked, setUserLiked] = useState(comment.user_liked || false);
  const [userDisliked, setUserDisliked] = useState(comment.user_disliked || false);

  const handleReaction = async (type) => {
    try {
      await postsAPI.reactToComment(comment.id, type);
      
      // Toggle logic
      if (type === 'like') {
        if (userLiked) {
          setLikeCount(likeCount - 1);
          setUserLiked(false);
        } else {
          setLikeCount(likeCount + (userDisliked ? 2 : 1));
          setUserLiked(true);
          setUserDisliked(false);
        }
      } else {
        if (userDisliked) {
          setLikeCount(likeCount + 1);
          setUserDisliked(false);
        } else {
          setLikeCount(likeCount - (userLiked ? 2 : 1));
          setUserDisliked(true);
          setUserLiked(false);
        }
      }
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to react to comment:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1.5, py: 1.5 }}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
          fontSize: '0.85rem',
        }}
      >
        {comment.username?.[0]?.toUpperCase() || 'U'}
      </Avatar>
      
      <Box sx={{ flex: 1 }}>
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            p: 1.5,
          }}
        >
          <Typography
            sx={{
              color: '#fafafa',
              fontWeight: 600,
              fontSize: '0.85rem',
              mb: 0.5,
            }}
          >
            {comment.username || 'Anonymous'}
          </Typography>
          <Typography
            sx={{
              color: '#e4e4e7',
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}
          >
            {comment.content}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1} sx={{ mt: 0.5, ml: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <IconButton
              size="small"
              onClick={() => handleReaction('like')}
              sx={{
                color: userLiked ? '#7c3aed' : '#71717a',
                p: 0.5,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  color: '#7c3aed',
                  transform: 'scale(1.1)',
                },
              }}
            >
              {userLiked ? <ThumbUp sx={{ fontSize: '1rem' }} /> : <ThumbUpOutlined sx={{ fontSize: '1rem' }} />}
            </IconButton>
            <Typography
              sx={{
                color: '#71717a',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {likeCount}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={() => handleReaction('dislike')}
            sx={{
              color: userDisliked ? '#ef4444' : '#71717a',
              p: 0.5,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                color: '#ef4444',
                transform: 'scale(1.1)',
              },
            }}
          >
            {userDisliked ? <ThumbDown sx={{ fontSize: '1rem' }} /> : <ThumbDownOutlined sx={{ fontSize: '1rem' }} />}
          </IconButton>

          <Typography
            sx={{
              color: '#71717a',
              fontSize: '0.75rem',
              ml: 'auto !important',
              alignSelf: 'center',
            }}
          >
            {new Date(comment.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
            })}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

const CommentsSection = ({ postId, initialComments = [], onUpdate }) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await postsAPI.getComments(postId);
      setComments(response.data?.comments || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await postsAPI.createComment(postId, { content: newComment.trim() });
      setNewComment('');
      await loadComments();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', mb: 2 }} />
      
      <Typography
        sx={{
          color: '#fafafa',
          fontWeight: 600,
          fontSize: '1rem',
          mb: 2,
        }}
      >
        Comments ({comments.length})
      </Typography>

      {/* Add Comment Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ mb: 3, display: 'flex', gap: 1.5 }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={submitting}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#fafafa',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(124, 58, 237, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#7c3aed',
              },
            },
          }}
        />
        <IconButton
          type="submit"
          disabled={!newComment.trim() || submitting}
          sx={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
            color: '#fafafa',
            alignSelf: 'flex-end',
            '&:hover': {
              background: 'linear-gradient(135deg, #6d28d9 0%, #db2777 100%)',
            },
            '&:disabled': {
              background: 'rgba(124, 58, 237, 0.2)',
              color: 'rgba(250, 250, 250, 0.4)',
            },
          }}
        >
          {submitting ? <CircularProgress size={20} sx={{ color: '#fafafa' }} /> : <Send />}
        </IconButton>
      </Box>

      {/* Comments List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#7c3aed' }} />
        </Box>
      ) : comments.length === 0 ? (
        <Typography
          sx={{
            color: '#71717a',
            textAlign: 'center',
            py: 4,
            fontSize: '0.9rem',
          }}
        >
          No comments yet. Be the first to comment!
        </Typography>
      ) : (
        <Box>
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} onUpdate={loadComments} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CommentsSection;
