import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, IconButton, Avatar, Button, TextField, CircularProgress, Alert,
  Tabs, Tab, Stack, Card, Chip,
  InputAdornment, Grid,
} from '@mui/material';
import {
  Edit, Save, Cancel,
  PhotoCamera, ContentCopy, Check, Twitter, Code, Link as LinkIcon, BusinessCenter,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authAPI, placesAPI, postsAPI } from '../services/api';
import MainLayout from '../components/layout/MainLayout';

const MotionBox = motion(Box);

const ROLE_CONFIG = {
  admin: { label: 'Admin', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  moderator: { label: 'Moderator', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  user: { label: 'Member', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    custom_status: user?.custom_status || '',
    twitter: user?.twitter || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    website: user?.website || '',
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userPlaces, setUserPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const { data } = await postsAPI.getUserPosts(user.id);
      // Handle different API response formats
      let posts = [];
      if (Array.isArray(data)) {
        posts = data;
      } else if (data?.posts && Array.isArray(data.posts)) {
        posts = data.posts;
      } else if (data && typeof data === 'object') {
        posts = [data];
      }
      setUserPosts(posts);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setUserPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [user?.id]);

  const loadPlaces = useCallback(async () => {
    setPlacesLoading(true);
    try {
      const { data } = await placesAPI.getByUser(user.id);
      // Handle different API response formats
      let places = [];
      if (Array.isArray(data)) {
        places = data;
      } else if (data?.places && Array.isArray(data.places)) {
        places = data.places;
      } else if (data && typeof data === 'object') {
        places = [data];
      }
      setUserPlaces(places);
    } catch (err) {
      console.error('Failed to load places:', err);
      setUserPlaces([]);
    } finally {
      setPlacesLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (tab === 1 && user?.id) loadPosts();
    if (tab === 2 && user?.id) loadPlaces();
  }, [tab, user?.id, loadPosts, loadPlaces]);

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const { data } = await authAPI.updateProfile({
        username: form.username,
        bio: form.bio,
        avatar: form.avatar,
        custom_status: form.custom_status,
        twitter: form.twitter,
        linkedin: form.linkedin,
        github: form.github,
        website: form.website,
      });
      updateUser(data);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setSaveError(e.response?.data?.error || 'Failed to update');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      username: user?.username || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
      custom_status: user?.custom_status || '',
      twitter: user?.twitter || '',
      linkedin: user?.linkedin || '',
      github: user?.github || '',
      website: user?.website || '',
    });
    setEditing(false);
    setSaveError('');
  };

  const roleConf = ROLE_CONFIG[user?.role] || ROLE_CONFIG.user;

  return (
    <MainLayout>
      <Box sx={{ minHeight: 'calc(100vh - 64px)', background: '#030712', py: 4 }}>
        <Box sx={{ maxWidth: 700, mx: 'auto', px: { xs: 2, md: 0 } }}>
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
                <MotionBox
                  whileHover={{ scale: 1.05 }}
                  sx={{
                    position: 'relative',
                    cursor: editing ? 'pointer' : 'default',
                  }}
                >
                  <Avatar
                    src={editing ? form.avatar : user?.avatar}
                    sx={{
                      width: 100,
                      height: 100,
                      border: '4px solid #030712',
                      background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                      boxShadow: '0 12px 40px rgba(124,58,237,0.3)',
                      fontSize: '2.5rem',
                    }}
                  >
                    {user?.username?.[0]?.toUpperCase()}
                  </Avatar>
                  {editing && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                        width: 36,
                        height: 36,
                        '&:hover': { transform: 'scale(1.1)' },
                      }}
                    >
                      <PhotoCamera sx={{ fontSize: 18, color: 'white' }} />
                    </IconButton>
                  )}
                </MotionBox>

                {!editing && (
                  <Button
                    startIcon={<Edit />}
                    onClick={() => setEditing(true)}
                    sx={{
                      textTransform: 'none',
                      background: 'rgba(124,58,237,0.15)',
                      border: '1px solid rgba(124,58,237,0.3)',
                      color: '#a78bfa',
                      fontWeight: 600,
                      borderRadius: 2,
                      mt: 1,
                      '&:hover': {
                        background: 'rgba(124,58,237,0.25)',
                        borderColor: '#a78bfa',
                      },
                    }}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>

              {/* Username and Role */}
              {editing ? (
                <TextField
                  fullWidth
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Username"
                  size="small"
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 2,
                      '&:hover': { background: 'rgba(255,255,255,0.08)' },
                      '&.Mui-focused': {
                        background: 'rgba(124,58,237,0.1)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#7c3aed',
                        },
                      },
                    },
                  }}
                />
              ) : (
                <Typography
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: '#f8fafc',
                    mb: 0.5,
                  }}
                >
                  {user?.username}
                </Typography>
              )}

              {/* Role Badge */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
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
                <Chip
                  label={`${userPosts.length} Posts`}
                  sx={{
                    background: 'rgba(16,185,129,0.1)',
                    color: '#10b981',
                    fontWeight: 600,
                    borderRadius: 1.5,
                    border: '1px solid rgba(16,185,129,0.5)',
                  }}
                />
              </Box>

               {/* Bio */}
               {editing ? (
                 <TextField
                   fullWidth
                   multiline
                   rows={2}
                   value={form.bio}
                   onChange={(e) => setForm({ ...form, bio: e.target.value })}
                   placeholder="Tell us about yourself"
                   sx={{
                     mb: 2,
                     '& .MuiOutlinedInput-root': {
                       background: 'rgba(255,255,255,0.05)',
                       borderRadius: 2,
                       '&:hover': { background: 'rgba(255,255,255,0.08)' },
                       '&.Mui-focused': {
                         background: 'rgba(124,58,237,0.1)',
                         '& .MuiOutlinedInput-notchedOutline': {
                           borderColor: '#7c3aed',
                         },
                       },
                     },
                   }}
                 />
               ) : (
                 <Typography
                   sx={{
                     color: '#cbd5e1',
                     lineHeight: 1.6,
                     mb: 2,
                     minHeight: 40,
                   }}
                 >
                   {user?.bio || 'No bio yet'}
                 </Typography>
               )}

               {/* Custom Status */}
               {editing ? (
                 <TextField
                   fullWidth
                   value={form.custom_status}
                   onChange={(e) => setForm({ ...form, custom_status: e.target.value })}
                   placeholder="What's your status? (e.g., 'In a meeting', 'Exploring new places')"
                   size="small"
                   sx={{
                     mb: 2,
                     '& .MuiOutlinedInput-root': {
                       background: 'rgba(255,255,255,0.05)',
                       borderRadius: 2,
                       '&:hover': { background: 'rgba(255,255,255,0.08)' },
                       '&.Mui-focused': {
                         background: 'rgba(124,58,237,0.1)',
                         '& .MuiOutlinedInput-notchedOutline': {
                           borderColor: '#7c3aed',
                         },
                       },
                     },
                   }}
                 />
               ) : (
                 <Box sx={{ mb: 2 }}>
                   {user?.custom_status && (
                     <Typography
                       sx={{
                         color: '#a78bfa',
                         fontSize: '0.9rem',
                         fontStyle: 'italic',
                         padding: '0.5rem 1rem',
                         background: 'rgba(167,139,250,0.1)',
                         borderRadius: 2,
                         border: '1px solid rgba(167,139,250,0.2)',
                       }}
                     >
                       💭 {user?.custom_status}
                     </Typography>
                   )}
                 </Box>
               )}

              {/* Edit Actions */}
              <AnimatePresence>
                {editing && (
                  <MotionBox
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {saveError && (
                      <Alert severity="error" sx={{ mb: 2, background: 'rgba(239,68,68,0.1)' }}>
                        {saveError}
                      </Alert>
                    )}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={saveLoading}
                        sx={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                          color: 'white',
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                        }}
                      >
                        {saveLoading ? <CircularProgress size={20} /> : 'Save'}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        sx={{
                          flex: 1,
                          borderColor: 'rgba(255,255,255,0.2)',
                          color: '#94a3b8',
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: 'rgba(255,255,255,0.3)',
                            background: 'rgba(255,255,255,0.03)',
                          },
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </MotionBox>
                )}
              </AnimatePresence>

              {saveSuccess && (
                <MotionBox
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  sx={{
                    p: 2,
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: 2,
                    color: '#10b981',
                    fontWeight: 600,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    justifyContent: 'center',
                    mt: 2,
                  }}
                >
                  <Check sx={{ fontSize: 20 }} />
                  Profile updated successfully
                </MotionBox>
              )}
            </Box>
          </MotionBox>

          {/* Tabs */}
          <Card
            sx={{
              background: 'rgba(15,23,42,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3,
              overflow: 'hidden',
              mb: 3,
            }}
          >
            <Tabs
              value={tab}
              onChange={(e, v) => setTab(v)}
              sx={{
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#64748b',
                  '&.Mui-selected': {
                    color: '#a78bfa',
                  },
                },
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
                  height: 3,
                },
              }}
            >
              <Tab label="About" />
               <Tab label={`Posts (${userPosts.length})`} />
               <Tab label={`Places (${userPlaces.length})`} />
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ p: 3 }}>
              {tab === 0 && (
                <MotionBox
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Stack spacing={2}>
                    <Box>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mb: 1, fontWeight: 600 }}>
                        Email
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: 2,
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <Typography sx={{ color: '#f8fafc', flex: 1, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                          {user?.email}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(user?.email);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          sx={{ color: '#a78bfa' }}
                        >
                           {copied ? <Check sx={{ fontSize: 18 }} /> : <ContentCopy sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </Box>
                    </Box>

                    <Box>
                       <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mb: 1, fontWeight: 600 }}>
                         Member Since
                       </Typography>
                       <Typography sx={{ color: '#cbd5e1' }}>
                         {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                       </Typography>
                     </Box>

                     {/* Social Links */}
                     {editing ? (
                       <>
                         <Box>
                           <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mb: 1, fontWeight: 600 }}>
                             Social Links
                           </Typography>
                           <Stack spacing={1.5}>
                             <TextField
                               fullWidth
                               size="small"
                               value={form.twitter}
                               onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                               placeholder="Twitter handle (without @)"
                               InputProps={{
                                 startAdornment: <InputAdornment position="start"><Twitter sx={{ fontSize: 18 }} /></InputAdornment>,
                               }}
                               sx={{
                                 '& .MuiOutlinedInput-root': {
                                   background: 'rgba(255,255,255,0.03)',
                                   borderRadius: 2,
                                   '&:hover': { background: 'rgba(255,255,255,0.05)' },
                                   '&.Mui-focused': {
                                     background: 'rgba(124,58,237,0.1)',
                                     '& .MuiOutlinedInput-notchedOutline': { borderColor: '#7c3aed' },
                                   },
                                 },
                               }}
                             />
                              <TextField
                                fullWidth
                                size="small"
                                value={form.linkedin}
                                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                                placeholder="LinkedIn profile URL"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start"><BusinessCenter sx={{ fontSize: 18 }} /></InputAdornment>,
                                }}
                               sx={{
                                 '& .MuiOutlinedInput-root': {
                                   background: 'rgba(255,255,255,0.03)',
                                   borderRadius: 2,
                                   '&:hover': { background: 'rgba(255,255,255,0.05)' },
                                   '&.Mui-focused': {
                                     background: 'rgba(124,58,237,0.1)',
                                     '& .MuiOutlinedInput-notchedOutline': { borderColor: '#7c3aed' },
                                   },
                                 },
                               }}
                             />
                             <TextField
                               fullWidth
                               size="small"
                               value={form.github}
                               onChange={(e) => setForm({ ...form, github: e.target.value })}
                               placeholder="GitHub username"
                               InputProps={{
                                 startAdornment: <InputAdornment position="start"><Code sx={{ fontSize: 18 }} /></InputAdornment>,
                               }}
                               sx={{
                                 '& .MuiOutlinedInput-root': {
                                   background: 'rgba(255,255,255,0.03)',
                                   borderRadius: 2,
                                   '&:hover': { background: 'rgba(255,255,255,0.05)' },
                                   '&.Mui-focused': {
                                     background: 'rgba(124,58,237,0.1)',
                                     '& .MuiOutlinedInput-notchedOutline': { borderColor: '#7c3aed' },
                                   },
                                 },
                               }}
                             />
                             <TextField
                               fullWidth
                               size="small"
                               value={form.website}
                               onChange={(e) => setForm({ ...form, website: e.target.value })}
                               placeholder="Website or portfolio URL"
                               InputProps={{
                                 startAdornment: <InputAdornment position="start"><LinkIcon sx={{ fontSize: 18 }} /></InputAdornment>,
                               }}
                               sx={{
                                 '& .MuiOutlinedInput-root': {
                                   background: 'rgba(255,255,255,0.03)',
                                   borderRadius: 2,
                                   '&:hover': { background: 'rgba(255,255,255,0.05)' },
                                   '&.Mui-focused': {
                                     background: 'rgba(124,58,237,0.1)',
                                     '& .MuiOutlinedInput-notchedOutline': { borderColor: '#7c3aed' },
                                   },
                                 },
                               }}
                             />
                           </Stack>
                         </Box>
                       </>
                     ) : (
                       <Box>
                         {(user?.twitter || user?.linkedin || user?.github || user?.website) && (
                           <>
                             <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mb: 1, fontWeight: 600 }}>
                               Social Links
                             </Typography>
                             <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                               {user?.twitter && (
                                 <Chip
                                   icon={<Twitter />}
                                   label={`@${user.twitter}`}
                                   component="a"
                                   href={`https://twitter.com/${user.twitter}`}
                                   target="_blank"
                                   clickable
                                   sx={{
                                     background: 'rgba(29,155,240,0.1)',
                                     color: '#1da1f2',
                                     borderColor: 'rgba(29,155,240,0.3)',
                                     border: '1px solid',
                                   }}
                                 />
                               )}
                                {user?.linkedin && (
                                  <Chip
                                    icon={<BusinessCenter />}
                                    label="LinkedIn"
                                    component="a"
                                    href={user.linkedin}
                                    target="_blank"
                                    clickable
                                    sx={{
                                      background: 'rgba(0,119,181,0.1)',
                                      color: '#0077b5',
                                      borderColor: 'rgba(0,119,181,0.3)',
                                      border: '1px solid',
                                    }}
                                  />
                                )}
                               {user?.github && (
                                 <Chip
                                   icon={<Code />}
                                   label={`github/${user.github}`}
                                   component="a"
                                   href={`https://github.com/${user.github}`}
                                   target="_blank"
                                   clickable
                                   sx={{
                                     background: 'rgba(255,255,255,0.05)',
                                     color: '#f8fafc',
                                     borderColor: 'rgba(255,255,255,0.1)',
                                     border: '1px solid',
                                   }}
                                 />
                               )}
                               {user?.website && (
                                 <Chip
                                   icon={<LinkIcon />}
                                   label="Website"
                                   component="a"
                                   href={user.website}
                                   target="_blank"
                                   clickable
                                   sx={{
                                     background: 'rgba(167,139,250,0.1)',
                                     color: '#a78bfa',
                                     borderColor: 'rgba(167,139,250,0.3)',
                                     border: '1px solid',
                                   }}
                                 />
                               )}
                             </Stack>
                           </>
                         )}
                       </Box>
                     )}
                   </Stack>
                </MotionBox>
              )}

               {tab === 1 && (
                 <MotionBox
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ duration: 0.3 }}
                 >
                   {postsLoading ? (
                     <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                       <CircularProgress />
                     </Box>
                   ) : userPosts.length === 0 ? (
                     <Box sx={{ textAlign: 'center', py: 4 }}>
                       <Typography sx={{ color: '#64748b' }}>No posts yet</Typography>
                     </Box>
                   ) : (
                     <Stack spacing={2}>
                       {userPosts.map((post, idx) => (
                         <MotionBox
                           key={post.id}
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.05 }}
                           sx={{
                             p: 2,
                             background: 'rgba(255,255,255,0.03)',
                             borderRadius: 2,
                             border: '1px solid rgba(255,255,255,0.05)',
                             '&:hover': {
                               background: 'rgba(255,255,255,0.05)',
                               borderColor: 'rgba(124,58,237,0.3)',
                             },
                             transition: 'all 0.2s',
                           }}
                         >
                           <Typography sx={{ color: '#f8fafc', fontWeight: 600, mb: 1 }}>
                             {post.content?.substring(0, 100)}...
                           </Typography>
                           <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                             {new Date(post.created_at).toLocaleDateString()}
                           </Typography>
                         </MotionBox>
                       ))}
                     </Stack>
                   )}
                 </MotionBox>
               )}

               {tab === 2 && (
                 <MotionBox
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ duration: 0.3 }}
                 >
                   {placesLoading ? (
                     <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                       <CircularProgress />
                     </Box>
                   ) : userPlaces.length === 0 ? (
                     <Box sx={{ textAlign: 'center', py: 4 }}>
                       <Typography sx={{ color: '#64748b' }}>No places yet</Typography>
                     </Box>
                   ) : (
                     <Grid container spacing={2}>
                       {userPlaces.map((place, idx) => (
                         <Grid item xs={12} sm={6} md={4} key={place.id}>
                           <MotionBox
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: idx * 0.05 }}
                             onClick={() => navigate(`/places/${place.id}`)}
                             sx={{
                               p: 2,
                               background: 'rgba(255,255,255,0.03)',
                               borderRadius: 2,
                               border: '1px solid rgba(255,255,255,0.05)',
                               cursor: 'pointer',
                               '&:hover': {
                                 background: 'rgba(255,255,255,0.05)',
                                 borderColor: 'rgba(124,58,237,0.3)',
                               },
                               transition: 'all 0.2s',
                             }}
                           >
                             <Typography sx={{ color: '#f8fafc', fontWeight: 600, mb: 1 }}>
                               {place.name}
                             </Typography>
                             <Typography sx={{ color: '#64748b', fontSize: '0.875rem', mb: 1 }}>
                               {place.category}
                             </Typography>
                             {place.description && (
                               <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                 {place.description?.substring(0, 80)}...
                               </Typography>
                             )}
                           </MotionBox>
                         </Grid>
                       ))}
                     </Grid>
                   )}
                  </MotionBox>
                )}
             </Box>
           </Card>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default ProfilePage;
