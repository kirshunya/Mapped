import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Container, Typography, Fab, Dialog, Skeleton, Stack, Button } from '@mui/material';
import { Add, Refresh, Star } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '../components/post/PostCard';
import CreatePostDialog from '../components/post/CreatePostDialog';
import CommentsSection from '../components/post/CommentsSection';
import { postsAPI } from '../services/api';
import MainLayout from '../components/layout/MainLayout';
import { useNotify } from '../components/ui/NotificationProvider';

const MotionBox = motion(Box);

const FeedPage = () => {
  const notify = useNotify();
  const [posts, setPosts] = useState([]);
  const [recommendedPostIds, setRecommendedPostIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const firstLoadRef = useRef(true);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const [feedResponse, recommendedResponse] = await Promise.all([
        postsAPI.getAll({ limit: 50 }),
        postsAPI.getRecommended({ limit: 20 }),
      ]);
      
      setPosts(feedResponse.data?.posts || []);
      
      // Mark ONLY recommended post IDs - not all posts
      const recommendedIds = new Set((recommendedResponse.data?.posts || []).map(p => p.id));
      setRecommendedPostIds(recommendedIds);
      
      if (!firstLoadRef.current) {
        notify.info('Feed refreshed');
      }
    } catch (error) {
      console.error('Failed to load feed:', error);
      notify.error('Failed to load feed');
    } finally {
      setLoading(false);
      firstLoadRef.current = false;
    }
  }, [notify]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const PostSkeleton = () => (
    <Box sx={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', gap: 1.2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="35%" />
          <Skeleton width="20%" />
        </Box>
      </Box>
      <Skeleton variant="rectangular" height={340} />
      <Box sx={{ p: 2 }}>
        <Skeleton width="82%" />
        <Skeleton width="65%" />
      </Box>
    </Box>
  );

  return (
    <MainLayout>
      <Box sx={{ minHeight: 'calc(100vh - 64px)', py: 3 }}>
        <Container maxWidth="md">
          {/* Header */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
              p: { xs: 2.2, md: 2.8 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(236,72,153,0.08) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography sx={{ color: '#f8fafc', fontWeight: 900, fontSize: { xs: '1.55rem', md: '1.95rem' }, letterSpacing: '-0.03em' }}>
                Community Feed
              </Typography>
              <Typography sx={{ color: '#cbd5e1', fontSize: '0.93rem', mt: 0.5 }}>
                Discover places, stories and reviews from our community
              </Typography>
            </Box>
            <Button 
              startIcon={<Refresh />} 
              variant="outlined" 
              onClick={loadPosts}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderColor: 'rgba(124,58,237,0.5)',
                color: '#a78bfa',
                '&:hover': {
                  borderColor: '#7c3aed',
                  background: 'rgba(124,58,237,0.1)',
                }
              }}
            >
              Refresh
            </Button>
          </MotionBox>

          {/* Posts */}
          <Stack spacing={2}>
            {loading ? (
              <>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </>
            ) : posts.length === 0 ? (
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                sx={{ 
                  textAlign: 'center', 
                  py: 8, 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: 4 
                }}
              >
                <Typography sx={{ color: '#cbd5e1', fontWeight: 800, mb: 0.6 }}>
                  No posts yet
                </Typography>
                <Typography sx={{ color: '#64748b' }}>
                  Be the first to share a place
                </Typography>
              </MotionBox>
            ) : (
              posts.map((post, idx) => {
                const isRecommended = recommendedPostIds.has(post.id);
                return (
                  <MotionBox
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                    sx={{
                      position: 'relative',
                      ...(isRecommended && {
                        boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          pointerEvents: 'none',
                          borderRadius: '16px',
                          border: '2px solid rgba(124, 58, 237, 0.5)',
                          boxShadow: 'inset 0 0 20px rgba(124, 58, 237, 0.1)',
                        },
                      }),
                    }}
                  >
                    {isRecommended && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          zIndex: 10,
                          background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                          color: '#fafafa',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        <Star sx={{ fontSize: '0.9rem' }} />
                        Recommended
                      </Box>
                    )}
                    <PostCard
                      post={post}
                      onCommentClick={() => {
                        setSelectedPost(post);
                        setCommentsDialogOpen(true);
                      }}
                      onUpdate={loadPosts}
                    />
                  </MotionBox>
                );
              })
            )}
          </Stack>
        </Container>

        {/* Floating Action Button */}
        <MotionBox
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Fab
            sx={{
              position: 'fixed',
              bottom: { xs: 100, md: 28 },
              right: 28,
              background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
              color: '#fff',
              boxShadow: '0 10px 30px rgba(124,58,237,0.35)',
              '&:hover': { 
                boxShadow: '0 14px 40px rgba(124,58,237,0.45)',
              },
            }}
            onClick={() => setCreateDialogOpen(true)}
          >
            <Add />
          </Fab>
        </MotionBox>

        {/* Dialogs */}
        <CreatePostDialog 
          open={createDialogOpen} 
          onClose={() => setCreateDialogOpen(false)} 
          onPostCreated={loadPosts} 
        />

        <Dialog 
          open={commentsDialogOpen} 
          onClose={() => setCommentsDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(15,23,42,0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }
          }}
        >
          {selectedPost && (
            <Box sx={{ p: 2.2 }}>
              <PostCard post={selectedPost} onUpdate={loadPosts} />
              <CommentsSection postId={selectedPost.id} onUpdate={loadPosts} />
            </Box>
          )}
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default FeedPage;
