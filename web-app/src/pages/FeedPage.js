import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Container, Typography, Fab, Dialog, Skeleton, Stack, Button } from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import PostCard from '../components/post/PostCard';
import CreatePostDialog from '../components/post/CreatePostDialog';
import CommentsSection from '../components/post/CommentsSection';
import { postsAPI } from '../services/api';
import MainLayout from '../components/layout/MainLayout';
import { useNotify } from '../components/ui/NotificationProvider';

const FeedPage = () => {
  const notify = useNotify();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const firstLoadRef = useRef(true);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await postsAPI.getAll({ limit: 50 });
      setPosts(response.data?.posts || []);
      if (!firstLoadRef.current) {
        notify.info('Feed refreshed');
      }
    } catch {
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
          <Box
            sx={{
              p: { xs: 2.2, md: 2.8 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(245,158,11,0.08) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              mb: 2.2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box>
              <Typography sx={{ color: '#f8fafc', fontWeight: 900, fontSize: { xs: '1.55rem', md: '1.95rem' }, letterSpacing: '-0.03em' }}>
                Community Feed
              </Typography>
              <Typography sx={{ color: '#cbd5e1', fontSize: '0.93rem' }}>Threads-style posts with places, photos and discussions.</Typography>
            </Box>
            <Button startIcon={<Refresh />} variant="outlined" onClick={loadPosts} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Refresh
            </Button>
          </Box>

          <Stack spacing={2}>
            {loading ? (
              <>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </>
            ) : posts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4 }}>
                <Typography sx={{ color: '#cbd5e1', fontWeight: 800, mb: 0.6 }}>No posts yet</Typography>
                <Typography sx={{ color: '#64748b' }}>Be the first to share a place</Typography>
              </Box>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onCommentClick={() => {
                    setSelectedPost(post);
                    setCommentsDialogOpen(true);
                  }}
                  onUpdate={loadPosts}
                />
              ))
            )}
          </Stack>
        </Container>

        <Fab
          sx={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
            color: '#082018',
            boxShadow: '0 10px 30px rgba(16,185,129,0.35)',
            '&:hover': { transform: 'scale(1.06)', background: 'linear-gradient(135deg, #34d399 0%, #fbbf24 100%)' },
          }}
          onClick={() => setCreateDialogOpen(true)}
        >
          <Add />
        </Fab>

        <CreatePostDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} onPostCreated={loadPosts} />

        <Dialog open={commentsDialogOpen} onClose={() => setCommentsDialogOpen(false)} maxWidth="sm" fullWidth>
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
