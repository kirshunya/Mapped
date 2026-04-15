import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, Button, Chip, Avatar,
  IconButton, Tooltip, Tabs, Tab, Divider, CircularProgress,
  FormControl, Select, MenuItem, InputLabel, Skeleton,
} from '@mui/material';
import {
  Star, StarBorder, Send, Edit, Delete, Close,
  LocationOn, Person, Schedule, CheckCircle, HourglassEmpty,
  Public, Lock, AttachFile,
} from '@mui/icons-material';
import useAuthStore from '../../store/authStore';
import { placesAPI, reviewsAPI, mediaAPI } from '../../services/api';
import { getCat } from '../ui/categories';
import { useNotify } from '../ui/NotificationProvider';

export const PlaceDetail = ({ place, onClose, onPlaceUpdated, onPlaceDeleted }) => {
  const { user } = useAuthStore();
  const notify = useNotify();
  const cat = getCat(place.category);
  const isOwner = user && place.user_id === user.id;

  const [tab, setTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: place.name, description: place.description,
    category: place.category, privacy: place.privacy,
  });
  const [editPhotos, setEditPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef(null);

  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newReview, setNewReview] = useState({ content: '', rating: 5 });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [fullscreenPhoto, setFullscreenPhoto] = useState(null);

  useEffect(() => { 
    if (tab === 1) loadReviews(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, place.id]);

  useEffect(() => {
    if (editing) {
      setEditPhotos(parseMedia(place.media_urls));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const { data } = await reviewsAPI.getByPlace(place.id);
      setReviews(Array.isArray(data) ? data : []);
    } catch { setReviews([]); }
    finally { setReviewsLoading(false); }
  };

  const handleSaveEdit = async () => {
    setEditLoading(true);
    try {
      const payload = { ...editForm };
      if (editPhotos.length > 0) payload.media_urls = editPhotos;
      const { data } = await placesAPI.update(place.id, payload);
      onPlaceUpdated(data);
      setEditing(false);
      notify.success('Place updated');
    } catch (e) { console.error(e); }
    finally { setEditLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this place?')) return;
    setDeleteLoading(true);
    try {
      await placesAPI.delete(place.id);
      onPlaceDeleted(place.id);
      notify.success('Place deleted');
    } catch (e) { console.error(e); }
    finally { setDeleteLoading(false); }
  };

  const handleSubmitReview = async () => {
    if (!newReview.content.trim()) return;
    setReviewLoading(true);
    try {
      await reviewsAPI.create({ place_id: place.id, content: newReview.content, rating: newReview.rating });
      setNewReview({ content: '', rating: 5 });
      await loadReviews();
      notify.success('Review added');
    } catch (e) { console.error(e); }
    finally { setReviewLoading(false); }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingPhotos(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const { data } = await mediaAPI.upload(file);
        uploaded.push(data.url);
      }
      setEditPhotos((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error('Upload failed:', err);
      notify.error('Photo upload failed');
    } finally {
      setUploadingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (idx) => {
    setEditPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const parseMedia = (raw) => {
    if (!raw || raw === 'null') return [];
    if (Array.isArray(raw)) return raw;
    try { 
      const p = JSON.parse(raw); 
      return Array.isArray(p) ? p : []; 
    } catch (e) { 
      console.warn('Failed to parse media_urls:', raw, e);
      return []; 
    }
  };

  const mediaUrls = parseMedia(place.media_urls);
  const privacyIcon = place.privacy === 'public' ? <Public sx={{ fontSize: 12 }} /> : <Lock sx={{ fontSize: 12 }} />;
  const approvalColor = place.approval === 'approved' ? '#10b981' : place.approval === 'rejected' ? '#ef4444' : '#f59e0b';
  const approvalIcon = place.approval === 'approved' ? <CheckCircle sx={{ fontSize: 12 }} /> : <HourglassEmpty sx={{ fontSize: 12 }} />;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        px: 2.5, pt: 2.5, pb: 2, 
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.01)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2.5, flexShrink: 0,
            background: `${cat.color}15`, border: `1.5px solid ${cat.color}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            transition: 'all 0.2s ease',
          }}>
            {cat.emoji}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <TextField size="small" fullWidth value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                sx={{ mb: 1 }} 
                placeholder="Place name" />
            ) : (
              <Typography sx={{ fontWeight: 700, color: '#fafafa', fontSize: '1rem', lineHeight: 1.3, mb: 0.75 }}>
                {place.name}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              <Chip label={cat.label} size="small"
                sx={{ 
                  height: 22, fontSize: '0.6875rem', fontWeight: 600, 
                  background: `${cat.color}15`, color: cat.color,
                  border: `1px solid ${cat.color}25`,
                }} />
              <Chip size="small" icon={privacyIcon} label={place.privacy}
                sx={{ height: 22, fontSize: '0.6875rem', textTransform: 'capitalize' }} />
              <Chip size="small" icon={approvalIcon} label={place.approval}
                sx={{ 
                  height: 22, fontSize: '0.6875rem', textTransform: 'capitalize', 
                  color: approvalColor, border: '1px solid', borderColor: approvalColor,
                  background: `${approvalColor}15`,
                }} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {isOwner && !editing && (
              <>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => setEditing(true)} 
                    sx={{ color: '#52525b', '&:hover': { color: '#7c3aed', background: 'rgba(124,58,237,0.1)' } }}>
                    <Edit sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={handleDelete} disabled={deleteLoading} 
                    sx={{ color: '#52525b', '&:hover': { color: '#ef4444', background: 'rgba(239,68,68,0.1)' } }}>
                    {deleteLoading ? <CircularProgress size={14} /> : <Delete sx={{ fontSize: 16 }} />}
                  </IconButton>
                </Tooltip>
              </>
            )}
            <IconButton size="small" onClick={onClose} 
              sx={{ color: '#52525b', '&:hover': { color: '#fafafa', background: 'rgba(255,255,255,0.08)' } }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)}
        sx={{ 
          px: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', 
          minHeight: 42,
          '& .MuiTab-root': {
            transition: 'all 0.2s ease',
          }
        }}>
        <Tab label="Info" sx={{ fontSize: '0.8125rem', minHeight: 42, fontWeight: 600 }} />
        <Tab label={`Reviews${reviews.length ? ` (${reviews.length})` : ''}`} 
          sx={{ fontSize: '0.8125rem', minHeight: 42, fontWeight: 600 }} />
      </Tabs>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 2.5, py: 2.5 }}>

        {/* INFO TAB */}
        {tab === 0 && (
          editing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField multiline rows={3} fullWidth label="Description" value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} 
                placeholder="What makes this place special?" />
              
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={editForm.category} label="Category" onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                  {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.emoji} {c.label}</MenuItem>)}
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small">
                <InputLabel>Visibility</InputLabel>
                <Select value={editForm.privacy} label="Visibility" onChange={(e) => setEditForm({ ...editForm, privacy: e.target.value })}>
                  <MenuItem value="public"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Public fontSize="small" /> Public</Box></MenuItem>
                  <MenuItem value="private"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Lock fontSize="small" /> Private</Box></MenuItem>
                </Select>
              </FormControl>

              {/* Photo Management */}
              <Box>
                <Typography sx={{ fontSize: '0.75rem', color: '#71717a', mb: 1.5, fontWeight: 600 }}>
                  Photos {editPhotos.length > 0 && `(${editPhotos.length})`}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
                  {editPhotos.map((url, i) => (
                    <Box key={i} sx={{ position: 'relative', width: 80, height: 80, borderRadius: 2, overflow: 'hidden' }}>
                      <Box component="img" src={url} alt=""
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <IconButton size="small" onClick={() => removePhoto(i)}
                        sx={{ 
                          position: 'absolute', top: 4, right: 4, 
                          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                          p: 0.5, 
                          '&:hover': { background: 'rgba(239,68,68,0.9)' } 
                        }}>
                        <Close sx={{ fontSize: 12, color: 'white' }} />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    component="label"
                    disabled={uploadingPhotos}
                    sx={{
                      width: 80, height: 80, borderRadius: 2, border: '1.5px dashed rgba(255,255,255,0.2)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                      p: 0, gap: 0.5,
                      color: '#52525b', 
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: '#7c3aed', color: '#7c3aed', background: 'rgba(124,58,237,0.05)' },
                    }}
                  >
                    {uploadingPhotos ? (
                      <CircularProgress size={20} sx={{ color: '#7c3aed' }} />
                    ) : (
                      <>
                        <AttachFile sx={{ fontSize: 20 }} />
                        <Typography sx={{ fontSize: '0.625rem', fontWeight: 600 }}>Add</Typography>
                      </>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handlePhotoUpload} />
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                <Button fullWidth variant="contained" onClick={handleSaveEdit} disabled={editLoading}
                  sx={{ py: 1.25, fontWeight: 600 }}>
                  {editLoading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Save Changes'}
                </Button>
                <Button fullWidth variant="outlined" onClick={() => setEditing(false)}
                  sx={{ py: 1.25, fontWeight: 600 }}>
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              {place.description && (
                <Typography sx={{ color: '#a1a1aa', fontSize: '0.875rem', lineHeight: 1.7, mb: 2.5 }}>
                  {place.description}
                </Typography>
              )}

              {/* Media Gallery */}
              {mediaUrls.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#52525b', mb: 1.25, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Photos ({mediaUrls.length})
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1.25 }}>
                    {mediaUrls.map((url, i) => (
                      <Box key={i} 
                        onClick={() => setFullscreenPhoto(url)}
                        sx={{ 
                          position: 'relative',
                          paddingBottom: '100%', 
                          borderRadius: 2, overflow: 'hidden', 
                          cursor: 'pointer',
                          border: '1px solid rgba(255,255,255,0.08)',
                          transition: 'all 0.2s ease',
                          '&:hover': { 
                            transform: 'scale(1.05)', 
                            boxShadow: '0 8px 24px rgba(124,58,237,0.25)',
                            borderColor: 'rgba(124,58,237,0.4)',
                          },
                        }}>
                        <Box component="img" src={url} alt={`photo ${i + 1}`}
                          sx={{ 
                            position: 'absolute', top: 0, left: 0,
                            width: '100%', height: '100%', objectFit: 'cover',
                          }} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Rating */}
              <Box sx={{ 
                display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5,
                p: 2, borderRadius: 2.5,
                background: 'rgba(245,158,11,0.05)',
                border: '1px solid rgba(245,158,11,0.15)',
              }}>
                <Box sx={{ display: 'flex', gap: 0.25 }}>
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} sx={{ fontSize: 18, color: i <= Math.round(place.rating || 0) ? '#f59e0b' : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', color: '#fafafa', fontWeight: 700, lineHeight: 1.2 }}>
                    {(place.rating || 0).toFixed(1)} / 5.0
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#71717a' }}>
                    {place.review_count || 0} review{place.review_count !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Meta */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box sx={{ 
                    width: 28, height: 28, borderRadius: 1.5,
                    background: 'rgba(124,58,237,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <LocationOn sx={{ fontSize: 14, color: '#7c3aed' }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#71717a', fontFamily: 'monospace' }}>
                    {place.latitude?.toFixed(5)}, {place.longitude?.toFixed(5)}
                  </Typography>
                </Box>
                {place.username && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ 
                      width: 28, height: 28, borderRadius: 1.5,
                      background: 'rgba(124,58,237,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Person sx={{ fontSize: 14, color: '#7c3aed' }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#71717a' }}>@{place.username}</Typography>
                  </Box>
                )}
                {place.created_at && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ 
                      width: 28, height: 28, borderRadius: 1.5,
                      background: 'rgba(124,58,237,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Schedule sx={{ fontSize: 14, color: '#7c3aed' }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#71717a' }}>
                      {new Date(place.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )
        )}

        {/* REVIEWS TAB */}
        {tab === 1 && (
          <>
            {user && (
              <Box sx={{ 
                mb: 2.5, p: 2, borderRadius: 2.5, 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.05)' 
              }}>
                <Typography sx={{ 
                  fontSize: '0.6875rem', color: '#52525b', fontWeight: 700, 
                  textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5, display: 'block' 
                }}>
                  Leave a review
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
                  {[1,2,3,4,5].map((i) => (
                    <IconButton key={i} size="small" sx={{ p: 0.25 }}
                      onMouseEnter={() => setHoverRating(i)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setNewReview({ ...newReview, rating: i })}>
                      {i <= (hoverRating || newReview.rating)
                        ? <Star sx={{ fontSize: 20, color: '#f59e0b' }} />
                        : <StarBorder sx={{ fontSize: 20, color: '#3f3f46' }} />}
                    </IconButton>
                  ))}
                </Box>
                <TextField fullWidth size="small" multiline rows={2} placeholder="Share your experience…"
                  value={newReview.content} onChange={(e) => setNewReview({ ...newReview, content: e.target.value })} 
                  sx={{ mb: 1.5 }} />
                <Button size="small" variant="contained" fullWidth
                  disabled={!newReview.content.trim() || reviewLoading}
                  onClick={handleSubmitReview}
                  startIcon={reviewLoading ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <Send sx={{ fontSize: 14 }} />}
                  sx={{ py: 1 }}>
                  {reviewLoading ? 'Posting…' : 'Post review'}
                </Button>
              </Box>
            )}

            {reviewsLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[1,2,3].map((i) => (
                  <Box key={i} sx={{ p: 2, borderRadius: 2.5, background: 'rgba(255,255,255,0.03)' }}>
                    <Skeleton width="40%" height={16} sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.05)' }} />
                    <Skeleton width="100%" height={14} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                  </Box>
                ))}
              </Box>
            ) : reviews.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Star sx={{ fontSize: 48, color: '#27272a', mb: 2 }} />
                <Typography sx={{ fontSize: '0.9375rem', color: '#3f3f46', fontWeight: 600 }}>No reviews yet</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#27272a', mt: 0.5 }}>Be the first to share your thoughts</Typography>
              </Box>
            ) : reviews.map((r) => (
              <Box key={r.id} sx={{ 
                mb: 1.5, p: 2, borderRadius: 2.5, 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s ease',
                '&:hover': { background: 'rgba(255,255,255,0.05)' }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
                  <Avatar src={r.user_avatar} sx={{ 
                    width: 28, height: 28, fontSize: '0.6875rem', 
                    background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' 
                  }}>
                    {(r.username || '?')[0].toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color: '#d4d4d8' }}>
                      {r.username || 'Anonymous'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: '#3f3f46' }}>
                      {new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </Typography>
                  </Box>
                  {r.user_role && r.user_role !== 'user' && (
                    <Chip label={r.user_role} size="small"
                      sx={{ 
                        height: 18, fontSize: '0.5625rem', fontWeight: 700, textTransform: 'capitalize',
                        background: r.user_role === 'admin' ? 'rgba(245,158,11,0.15)' : 'rgba(124,58,237,0.15)',
                        color: r.user_role === 'admin' ? '#f59e0b' : '#a78bfa' 
                      }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mb: 1 }}>
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} sx={{ fontSize: 13, color: i <= r.rating ? '#f59e0b' : 'rgba(255,255,255,0.08)' }} />
                  ))}
                </Box>
                {r.content && (
                  <Typography sx={{ fontSize: '0.8125rem', color: '#a1a1aa', lineHeight: 1.6 }}>{r.content}</Typography>
                )}
              </Box>
            ))}
          </>
        )}
      </Box>

      {/* Fullscreen Photo Modal */}
      {fullscreenPhoto && (
        <Box
          onClick={() => setFullscreenPhoto(null)}
          sx={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease',
            '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
          }}
        >
          <IconButton 
            onClick={() => setFullscreenPhoto(null)}
            sx={{ position: 'absolute', top: 20, right: 20, color: 'white', background: 'rgba(0,0,0,0.5)' }}>
            <Close />
          </IconButton>
          <Box component="img" src={fullscreenPhoto} alt="fullscreen"
            sx={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
        </Box>
      )}
    </Box>
  );
};

const CATEGORIES = [
  { value: 'cafe', label: 'Cafe', emoji: '☕' },
  { value: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  { value: 'park', label: 'Park', emoji: '🌿' },
  { value: 'museum', label: 'Museum', emoji: '🏛️' },
  { value: 'monument', label: 'Monument', emoji: '🗿' },
  { value: 'nature', label: 'Nature', emoji: '🏞️' },
  { value: 'other', label: 'Other', emoji: '📍' },
];
