import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Stack,
  Avatar,
  IconButton,
  Skeleton,
  Rating,
  TextField,
  Paper,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Star,
  Favorite,
  FavoriteBorder,
  Share,
  Map as MapIcon,
  Send,
  ChevronLeft,
  ChevronRight,
  Close,
  AccessTime,
  Person,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../components/layout/MainLayout';
import { placesAPI, reviewsAPI } from '../services/api';
import { CATEGORIES } from '../components/ui/categories';
import { useNotify } from '../components/ui/NotificationProvider';
import useAuthStore from '../store/authStore';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const PlaceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const { user } = useAuthStore();
  
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  
  // Review form
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const parseMedia = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return [value];
      }
    }
    return [];
  };

  const loadPlace = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await placesAPI.getById(id);
      setPlace(data);
    } catch (err) {
      console.error(err);
      notify.error('Failed to load place');
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  const loadReviews = useCallback(async () => {
    try {
      const { data } = await reviewsAPI.getByPlace(id);
      setReviews(data?.reviews || data || []);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    loadPlace();
    loadReviews();
  }, [loadPlace, loadReviews]);

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      notify.error('Please write a review');
      return;
    }
    setSubmitting(true);
    try {
      await reviewsAPI.create({
        place_id: Number(id),
        rating: reviewRating,
        text: reviewText.trim(),
      });
      setReviewText('');
      setReviewRating(5);
      notify.success('Review submitted!');
      loadReviews();
      loadPlace(); // Reload to get updated rating
    } catch (err) {
      console.error(err);
      notify.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const media = parseMedia(place?.media_urls);
  const category = CATEGORIES.find(c => c.value === place?.category) || CATEGORIES.find(c => c.value === 'other');

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % media.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4, mb: 3 }} />
          <Skeleton variant="text" width="60%" height={60} />
          <Skeleton variant="text" width="40%" height={30} />
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mt: 3 }} />
        </Container>
      </MainLayout>
    );
  }

  if (!place) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: '#71717a' }}>Place not found</Typography>
          <Button onClick={() => navigate('/recommendations')} sx={{ mt: 2 }}>
            Back to Explore
          </Button>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
        {/* Hero Image Section */}
        <Box sx={{ position: 'relative', height: { xs: 300, md: 450 }, overflow: 'hidden' }}>
          {media.length > 0 ? (
            <>
              <Box
                component="img"
                src={media[currentImageIndex]}
                alt={place.name}
                onClick={() => setLightboxOpen(true)}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'scale(1.02)' },
                }}
              />
              {/* Gradient overlay */}
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(to top, rgba(9,9,11,0.95) 0%, transparent 100%)',
              }} />
              
              {/* Navigation arrows */}
              {media.length > 1 && (
                <>
                  <IconButton
                    onClick={prevImage}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      '&:hover': { background: 'rgba(124,58,237,0.8)' },
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    onClick={nextImage}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      '&:hover': { background: 'rgba(124,58,237,0.8)' },
                    }}
                  >
                    <ChevronRight />
                  </IconButton>
                  
                  {/* Image indicators */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 100,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 1,
                  }}>
                    {media.map((_, idx) => (
                      <Box
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        sx={{
                          width: idx === currentImageIndex ? 24 : 8,
                          height: 8,
                          borderRadius: 4,
                          background: idx === currentImageIndex ? '#7c3aed' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </>
          ) : (
            <Box sx={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(236,72,153,0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LocationOn sx={{ fontSize: 80, color: '#3f3f46' }} />
            </Box>
          )}

          {/* Back button */}
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              '&:hover': { background: 'rgba(0,0,0,0.8)' },
            }}
          >
            <ArrowBack />
          </IconButton>

          {/* Action buttons */}
          <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => setLiked(!liked)}
              sx={{
                background: 'rgba(0,0,0,0.6)',
                color: liked ? '#ef4444' : 'white',
                '&:hover': { background: 'rgba(0,0,0,0.8)' },
              }}
            >
              {liked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <IconButton
              sx={{
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                '&:hover': { background: 'rgba(0,0,0,0.8)' },
              }}
            >
              <Share />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 1, pb: 6 }}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              background: 'linear-gradient(180deg, rgba(15,15,20,0.98) 0%, rgba(9,9,11,0.99) 100%)',
              border: '1px solid rgba(124,58,237,0.2)',
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <Chip
                    icon={<Box sx={{ fontSize: 14 }}>{category?.emoji}</Box>}
                    label={category?.label || 'Other'}
                    sx={{
                      background: `${category?.color}20`,
                      color: category?.color,
                      border: `1px solid ${category?.color}40`,
                      fontWeight: 600,
                    }}
                  />
                  {place.privacy === 'private' && (
                    <Chip label="Private" size="small" sx={{ background: 'rgba(113,113,122,0.2)', color: '#71717a' }} />
                  )}
                  {place.privacy === 'group' && (
                    <Chip label="Group" size="small" sx={{ background: 'rgba(167,139,250,0.2)', color: '#a78bfa' }} />
                  )}
                </Stack>

                <Typography variant="h3" sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  color: '#fafafa',
                  letterSpacing: '-0.02em',
                  mb: 1.5,
                }}>
                  {place.name}
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  {place.rating > 0 && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Star sx={{ color: '#f59e0b', fontSize: 22 }} />
                      <Typography sx={{ color: '#fafafa', fontWeight: 700, fontSize: '1.1rem' }}>
                        {Number(place.rating).toFixed(1)}
                      </Typography>
                      <Typography sx={{ color: '#71717a', fontSize: '0.9rem' }}>
                        ({reviews.length} reviews)
                      </Typography>
                    </Stack>
                  )}
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <LocationOn sx={{ color: '#7c3aed', fontSize: 18 }} />
                    <Typography sx={{ color: '#71717a', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                      {place.latitude?.toFixed(4)}, {place.longitude?.toFixed(4)}
                    </Typography>
                  </Stack>
                </Stack>

                <Typography sx={{ color: '#a1a1aa', fontSize: '1rem', lineHeight: 1.7 }}>
                  {place.description || 'No description available for this place.'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: { md: 200 } }}>
                <Button
                  variant="contained"
                  startIcon={<MapIcon />}
                  onClick={() => navigate(`/?place=${place.id}`)}
                  sx={{
                    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                    fontWeight: 700,
                    py: 1.5,
                    '&:hover': { background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
                  }}
                >
                  View on Map
                </Button>
              </Box>
            </Box>

            {/* Photo Gallery Thumbnails */}
            {media.length > 1 && (
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ color: '#fafafa', fontWeight: 700, mb: 2, fontSize: '1.1rem' }}>
                  Photos ({media.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                  {media.map((url, idx) => (
                    <Box
                      key={idx}
                      onClick={() => {
                        setCurrentImageIndex(idx);
                        setLightboxOpen(true);
                      }}
                      sx={{
                        width: 120,
                        height: 80,
                        borderRadius: 2,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: idx === currentImageIndex ? '2px solid #7c3aed' : '2px solid transparent',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                        '&:hover': { transform: 'scale(1.05)' },
                      }}
                    >
                      <Box
                        component="img"
                        src={url}
                        alt=""
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 4 }} />

            {/* Reviews Section */}
            <Box>
              <Typography sx={{ color: '#fafafa', fontWeight: 800, mb: 3, fontSize: '1.3rem' }}>
                Reviews ({reviews.length})
              </Typography>

              {/* Write Review */}
              <Paper
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: 3,
                  background: 'rgba(124,58,237,0.05)',
                  border: '1px solid rgba(124,58,237,0.15)',
                }}
              >
                <Typography sx={{ color: '#fafafa', fontWeight: 600, mb: 2 }}>
                  Write a Review
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography sx={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Your rating:</Typography>
                  <Rating
                    value={reviewRating}
                    onChange={(_, value) => setReviewRating(value || 5)}
                    sx={{
                      '& .MuiRating-iconFilled': { color: '#f59e0b' },
                      '& .MuiRating-iconEmpty': { color: '#3f3f46' },
                    }}
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Share your experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleSubmitReview}
                  disabled={submitting || !reviewText.trim()}
                  startIcon={<Send sx={{ fontSize: 16 }} />}
                  sx={{
                    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                    fontWeight: 600,
                    '&:hover': { background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </Paper>

               {/* Reviews List */}
               <Stack spacing={2}>
                 {reviews.length === 0 ? (
                   <MotionBox
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     sx={{ textAlign: 'center', py: 4 }}
                   >
                     <Typography sx={{ color: '#71717a' }}>
                       No reviews yet. Be the first to review!
                     </Typography>
                   </MotionBox>
                 ) : (
                   <AnimatePresence>
                     {reviews.map((review, idx) => (
                       <MotionBox
                         key={review.id}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: idx * 0.05 }}
                       >
                         <Paper
                           sx={{
                             p: 3,
                             borderRadius: 3,
                             background: 'rgba(255,255,255,0.03)',
                             border: '1px solid rgba(255,255,255,0.06)',
                             transition: 'all 0.2s ease',
                             '&:hover': {
                               background: 'rgba(124,58,237,0.06)',
                               borderColor: 'rgba(124,58,237,0.2)',
                             }
                           }}
                         >
                           <Box sx={{ display: 'flex', gap: 2 }}>
                             <Avatar
                               src={review.user_avatar}
                               sx={{
                                 width: 44,
                                 height: 44,
                                 background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                               }}
                             >
                               {review.username?.[0]?.toUpperCase() || <Person />}
                             </Avatar>
                             <Box sx={{ flex: 1 }}>
                               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                 <Typography sx={{ color: '#fafafa', fontWeight: 600 }}>
                                   {review.username || `User ${review.user_id}`}
                                 </Typography>
                                 <Rating
                                   value={review.rating}
                                   readOnly
                                   size="small"
                                   sx={{
                                     '& .MuiRating-iconFilled': { color: '#f59e0b' },
                                     '& .MuiRating-iconEmpty': { color: '#3f3f46' },
                                   }}
                                 />
                               </Box>
                               <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                                 <AccessTime sx={{ fontSize: 14, color: '#52525b' }} />
                                 <Typography sx={{ color: '#52525b', fontSize: '0.8rem' }}>
                                   {formatDate(review.created_at)}
                                 </Typography>
                               </Box>
                               <Typography sx={{ color: '#d4d4d8', lineHeight: 1.6 }}>
                                 {review.text}
                               </Typography>
                             </Box>
                           </Box>
                         </Paper>
                       </MotionBox>
                     ))}
                   </AnimatePresence>
                 )}
               </Stack>
            </Box>
          </MotionPaper>
        </Container>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxOpen && media.length > 0 && (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxOpen(false)}
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.95)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'zoom-out',
              }}
            >
              <IconButton
                onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  '&:hover': { background: 'rgba(255,255,255,0.2)' },
                }}
              >
                <Close />
              </IconButton>
              
              <Box
                component="img"
                src={media[currentImageIndex]}
                alt=""
                onClick={(e) => e.stopPropagation()}
                sx={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  cursor: 'default',
                }}
              />

              {media.length > 1 && (
                <>
                  <IconButton
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    sx={{
                      position: 'absolute',
                      left: 20,
                      color: 'white',
                      background: 'rgba(255,255,255,0.1)',
                      '&:hover': { background: 'rgba(124,58,237,0.8)' },
                    }}
                  >
                    <ChevronLeft sx={{ fontSize: 32 }} />
                  </IconButton>
                  <IconButton
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    sx={{
                      position: 'absolute',
                      right: 20,
                      color: 'white',
                      background: 'rgba(255,255,255,0.1)',
                      '&:hover': { background: 'rgba(124,58,237,0.8)' },
                    }}
                  >
                    <ChevronRight sx={{ fontSize: 32 }} />
                  </IconButton>
                </>
              )}
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>
    </MainLayout>
  );
};

export default PlaceDetailPage;
