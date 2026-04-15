import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Avatar,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  ThumbDown,
  ThumbDownOutlined,
  ChatBubbleOutline,
  Place as PlaceIcon,
} from '@mui/icons-material';
import { postsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post, onCommentClick, onUpdate }) => {
  const navigate = useNavigate();
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [userLiked, setUserLiked] = useState(post.user_liked || false);
  const [userDisliked, setUserDisliked] = useState(post.user_disliked || false);

  const handleReaction = async (type) => {
    try {
      await postsAPI.reactToPost(post.id, type);
      
      // Toggle logic
      if (type === 'like') {
        if (userLiked) {
          // Remove like
          setLikeCount(likeCount - 1);
          setUserLiked(false);
        } else {
          // Add like (and remove dislike if present)
          setLikeCount(likeCount + (userDisliked ? 2 : 1));
          setUserLiked(true);
          setUserDisliked(false);
        }
      } else {
        if (userDisliked) {
          // Remove dislike
          setLikeCount(likeCount + 1);
          setUserDisliked(false);
        } else {
          // Add dislike (and remove like if present)
          setLikeCount(likeCount - (userLiked ? 2 : 1));
          setUserDisliked(true);
          setUserLiked(false);
        }
      }
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to react:', error);
    }
  };

  const handlePlaceClick = () => {
    if (post.place_id) {
      navigate(`/?place=${post.place_id}`);
    }
  };

  const parseMediaUrls = (urls) => {
    if (!urls) return [];
    if (Array.isArray(urls)) return urls;
    try {
      const parsed = JSON.parse(urls);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const mediaUrls = parseMediaUrls(post.media_urls);
  const firstImage = mediaUrls[0];

  return (
    <Card
      sx={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(32px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.15)',
          borderColor: 'rgba(124, 58, 237, 0.2)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
          }}
        >
          {post.username?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              color: '#fafafa',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            {post.username || 'Anonymous'}
          </Typography>
          <Typography
            sx={{
              color: '#71717a',
              fontSize: '0.75rem',
            }}
          >
            {new Date(post.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        </Box>
      </Box>

      {/* Image */}
      {firstImage && (
        <CardMedia
          component="img"
          image={firstImage}
          alt="Post"
          sx={{
            height: 400,
            objectFit: 'cover',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        />
      )}

      {/* Content */}
      <CardContent sx={{ p: 2 }}>
        {/* Content Text */}
        {post.content && (
          <Typography
            sx={{
              color: '#fafafa',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              mb: 1.5,
            }}
          >
            {post.content}
          </Typography>
        )}

        {/* Place Chip */}
        {(post.place_name || post.place_id) && (
          <Chip
            icon={<PlaceIcon sx={{ fontSize: '1rem', color: '#ec4899 !important' }} />}
            label={post.place_name || `Place #${post.place_id}`}
            onClick={handlePlaceClick}
            sx={{
              mb: 2,
              background: 'rgba(236, 72, 153, 0.1)',
              color: '#ec4899',
              border: '1px solid rgba(236, 72, 153, 0.2)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'rgba(236, 72, 153, 0.15)',
                borderColor: 'rgba(236, 72, 153, 0.3)',
                transform: 'translateY(-1px)',
              },
            }}
          />
        )}

        {/* Actions */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => handleReaction('like')}
              sx={{
                color: userLiked ? '#7c3aed' : '#71717a',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  color: '#7c3aed',
                  transform: 'scale(1.1)',
                },
              }}
            >
              {userLiked ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}
            </IconButton>
            <Typography
              sx={{
                color: '#fafafa',
                fontSize: '0.9rem',
                fontWeight: 600,
                minWidth: '24px',
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
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                color: '#ef4444',
                transform: 'scale(1.1)',
              },
            }}
          >
            {userDisliked ? <ThumbDown fontSize="small" /> : <ThumbDownOutlined fontSize="small" />}
          </IconButton>

          <Box sx={{ flex: 1 }} />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                color: '#7c3aed',
              },
            }}
            onClick={onCommentClick}
          >
            <IconButton
              size="small"
              sx={{
                color: '#71717a',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  color: '#7c3aed',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <ChatBubbleOutline fontSize="small" />
            </IconButton>
            <Typography
              sx={{
                color: '#71717a',
                fontSize: '0.9rem',
              }}
            >
              {post.comment_count || 0}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PostCard;
