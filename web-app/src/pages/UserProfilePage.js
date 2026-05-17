import React, { useState, useEffect } from 'react';
import {
  Box, Typography, IconButton, Avatar, Button, Chip, CircularProgress, Stack, Tabs, Tab,
} from '@mui/material';
import { ArrowBack, Favorite, FavoriteBorder, Share } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authAPI, postsAPI, placesAPI } from '../services/api';
import PostCard from '../components/post/PostCard';
import MainLayout from '../components/layout/MainLayout';
import { useNotify } from '../components/ui/NotificationProvider';

const MotionBox = motion(Box);

const ROLE_CONFIG = {
  admin: { label: 'Admin', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  moderator: { label: 'Moderator', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  user: { label: 'Member', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
};

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const notify = useNotify();
  const { user: currentUser } = useAuthStore();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [statLoading, setStatLoading] = useState(false);
  const [contentTab, setContentTab] = useState(0); // 0: Posts, 1: Places
  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const { data } = await authAPI.getUserProfile(userId);
      setUserProfile(data);
      checkFollowing();
      loadUserPosts();
      loadUserPlaces();
      loadStats();
    } catch (error) {
      notify.error('Failed to load user profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowing = async () => {
    if (!currentUser?.id || parseInt(userId) === currentUser.id) return;
    try {
      const { data } = await authAPI.getFollowing(currentUser.id);
      // Handle different API response formats
      let followList = [];
      if (Array.isArray(data)) {
        followList = data;
      } else if (data?.following && Array.isArray(data.following)) {
        followList = data.following;
      }
      setIsFollowing(followList?.some((u) => u.id === parseInt(userId)) || false);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUserPosts = async () => {
    setPostsLoading(true);
    try {
      const { data } = await postsAPI.getUserPosts(userId);
      // Handle different API response formats
      let postList = [];
      if (Array.isArray(data)) {
        postList = data;
      } else if (data?.posts && Array.isArray(data.posts)) {
        postList = data.posts;
      } else if (data && typeof data === 'object') {
        postList = [data];
      }
      setPosts(postList);
    } catch (error) {
      console.error(error);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const loadUserPlaces = async () => {
    setPlacesLoading(true);
    try {
      const { data } = await placesAPI.getByUser(userId);
      // Handle different API response formats
      let placeList = [];
      if (Array.isArray(data)) {
        placeList = data;
      } else if (data?.places && Array.isArray(data.places)) {
        placeList = data.places;
      } else if (data && typeof data === 'object') {
        placeList = [data];
      }
      setPlaces(placeList);
    } catch (error) {
      console.error(error);
      setPlaces([]);
    } finally {
      setPlacesLoading(false);
    }
  };

  const loadStats = async () => {
    setStatLoading(true);
    try {
      const [followersRes, followingRes] = await Promise.all([
        authAPI.getFollowers(userId),
        authAPI.getFollowing(userId),
      ]);
      // Handle different API response formats for followers
      let followersList = [];
      if (Array.isArray(followersRes.data)) {
        followersList = followersRes.data;
      } else if (followersRes.data?.followers && Array.isArray(followersRes.data.followers)) {
        followersList = followersRes.data.followers;
      }
      // Handle different API response formats for following
      let followingList = [];
      if (Array.isArray(followingRes.data)) {
        followingList = followingRes.data;
      } else if (followingRes.data?.following && Array.isArray(followingRes.data.following)) {
        followingList = followingRes.data.following;
      }
      setFollowers(followersList);
      setFollowing(followingList);
    } catch (err) {
      console.error(err);
    } finally {
      setStatLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser?.id) {
      notify.error('Please log in first');
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await authAPI.unfollowUser(userId);
        setIsFollowing(false);
        notify.success('Unfollowed');
      } else {
        await authAPI.followUser(userId);
        setIsFollowing(true);
        notify.success('Followed');
      }
      loadStats();
    } catch (error) {
      notify.error('Failed to update follow status');
      console.error(error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  const roleConf = ROLE_CONFIG[userProfile?.role] || ROLE_CONFIG.user;

  return (
    <MainLayout>
      <Box sx={{ minHeight: 'calc(100vh - 64px)', background: '#030712', py: 4 }}>
        <Box sx={{ maxWidth: 700, mx: 'auto', px: { xs: 2, md: 0 } }}>
          {/* Back Button */}
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            sx={{ mb: 3 }}
          >
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
                borderRadius: 2,
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                  borderColor: '#a78bfa',
                  color: '#a78bfa',
                },
              }}
            >
              <ArrowBack />
            </IconButton>
          </MotionBox>

          {/* Profile Header Card */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(236,72,153,0.1) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              overflow: 'hidden',
              mb: 3,
            }}
          >
            {/* Banner */}
            <Box
              sx={{
                height: 120,
                background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(236,72,153,0.3))',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            />

            {/* Profile Info */}
            <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: '-50px', mb: 2.5 }}>
                <MotionBox whileHover={{ scale: 1.05 }}>
                  <Avatar
                    src={userProfile?.avatar}
                    sx={{
                      width: 100,
                      height: 100,
                      border: '4px solid #030712',
                      background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                      boxShadow: '0 12px 40px rgba(124,58,237,0.3)',
                      fontSize: '2.5rem',
                    }}
                  >
                    {userProfile?.username?.[0]?.toUpperCase()}
                  </Avatar>
                </MotionBox>

                {currentUser?.id !== parseInt(userId) && (
                  <Button
                    onClick={handleFollow}
                    disabled={followLoading}
                    startIcon={isFollowing ? <Favorite /> : <FavoriteBorder />}
                    sx={{
                      textTransform: 'none',
                      background: isFollowing
                        ? 'linear-gradient(135deg, #ec4899, #f43f5e)'
                        : 'rgba(124,58,237,0.15)',
                      border: isFollowing ? 'none' : '1px solid rgba(124,58,237,0.3)',
                      color: isFollowing ? 'white' : '#a78bfa',
                      fontWeight: 600,
                      borderRadius: 2,
                      mt: 1,
                      px: 3,
                      '&:hover': {
                        background: isFollowing
                          ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
                          : 'rgba(124,58,237,0.25)',
                      },
                    }}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </Box>

              {/* Username and Role */}
              <Typography
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  mb: 1,
                }}
              >
                {userProfile?.username}
              </Typography>

              {/* Role Badge */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={roleConf.label}
                  sx={{
                    background: roleConf.bg,
                    color: roleConf.color,
                    fontWeight: 600,
                    borderRadius: 1.5,
                    border: `1px solid ${roleConf.color}80`,
                  }}
                />
              </Box>

              {/* Bio */}
              <Typography
                sx={{
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                  mb: 2.5,
                }}
              >
                {userProfile?.bio || 'No bio yet'}
              </Typography>

              {/* Stats */}
              <Box sx={{ display: 'flex', gap: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <MotionBox whileHover={{ y: -4 }} sx={{ textAlign: 'center', cursor: 'default' }}>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#a78bfa' }}>
                    {statLoading ? '-' : posts.length}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                    Posts
                  </Typography>
                </MotionBox>
                <MotionBox whileHover={{ y: -4 }} sx={{ textAlign: 'center', cursor: 'default' }}>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#f472b6' }}>
                    {statLoading ? '-' : followers.length}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                    Followers
                  </Typography>
                </MotionBox>
                <MotionBox whileHover={{ y: -4 }} sx={{ textAlign: 'center', cursor: 'default' }}>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa' }}>
                    {statLoading ? '-' : following.length}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                    Following
                  </Typography>
                </MotionBox>
              </Box>
            </Box>
          </MotionBox>

          {/* Content Tabs */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box sx={{
              mb: 3,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              gap: 1,
            }}>
              <Button
                onClick={() => setContentTab(0)}
                sx={{
                  color: contentTab === 0 ? '#a78bfa' : '#64748b',
                  borderBottom: contentTab === 0 ? '2px solid #a78bfa' : 'none',
                  borderRadius: 0,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: contentTab === 0 ? 700 : 500,
                  pb: 1.5,
                  '&:hover': {
                    color: '#a78bfa',
                  }
                }}
              >
                Posts ({posts.length})
              </Button>
              <Button
                onClick={() => {
                  setContentTab(1);
                  if (places.length === 0 && !placesLoading) {
                    loadUserPlaces();
                  }
                }}
                sx={{
                  color: contentTab === 1 ? '#a78bfa' : '#64748b',
                  borderBottom: contentTab === 1 ? '2px solid #a78bfa' : 'none',
                  borderRadius: 0,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: contentTab === 1 ? 700 : 500,
                  pb: 1.5,
                  '&:hover': {
                    color: '#a78bfa',
                  }
                }}
              >
                Places ({places.length})
              </Button>
            </Box>

            {/* Posts Tab */}
            {contentTab === 0 && (
              <MotionBox
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {postsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : posts.length === 0 ? (
                  <Box
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 3,
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <Typography sx={{ color: '#64748b' }}>No posts yet</Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    <AnimatePresence>
                      {posts.map((post, idx) => (
                        <MotionBox
                          key={post.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <PostCard post={post} onUpdate={loadUserPosts} />
                        </MotionBox>
                      ))}
                    </AnimatePresence>
                  </Stack>
                )}
              </MotionBox>
            )}

            {/* Places Tab */}
            {contentTab === 1 && (
              <MotionBox
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {placesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : places.length === 0 ? (
                  <Box
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 3,
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <Typography sx={{ color: '#64748b' }}>No places yet</Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    <AnimatePresence>
                      {places.map((place, idx) => (
                        <MotionBox
                          key={place.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => navigate(`/places/${place.id}`)}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(236,72,153,0.1) 100%)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(20px)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(236,72,153,0.15) 100%)',
                              borderColor: 'rgba(255,255,255,0.2)',
                              transform: 'translateY(-2px)',
                            }
                          }}
                        >
                          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', mb: 0.5 }}>
                            {place.name}
                          </Typography>
                          <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mb: 1 }}>
                            {place.description || 'No description'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {place.category && (
                              <Chip
                                label={place.category}
                                size="small"
                                sx={{
                                  background: 'rgba(124,58,237,0.2)',
                                  color: '#a78bfa',
                                  fontSize: '0.75rem',
                                }}
                              />
                            )}
                            {place.rating && (
                              <Chip
                                label={`⭐ ${place.rating.toFixed(1)}`}
                                size="small"
                                sx={{
                                  background: 'rgba(251,146,60,0.2)',
                                  color: '#fb923c',
                                  fontSize: '0.75rem',
                                }}
                              />
                            )}
                          </Box>
                        </MotionBox>
                      ))}
                    </AnimatePresence>
                  </Stack>
                )}
              </MotionBox>
            )}
          </MotionBox>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default UserProfilePage;
