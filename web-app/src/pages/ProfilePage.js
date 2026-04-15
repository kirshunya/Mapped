import React, { useState, useEffect } from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Avatar, Button,
  TextField, Chip, CircularProgress, Alert, Tabs, Tab,
} from '@mui/material';
import {
  ArrowBack, Edit, Save, Cancel, Person, Shield, AdminPanelSettings,
  LocationOn, Star, PhotoCamera,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authAPI, placesAPI } from '../services/api';
import { getCat } from '../components/ui/categories';

const ROLE_CONFIG = {
  admin:     { label: 'Admin',     color: '#f59e0b', icon: <AdminPanelSettings sx={{ fontSize: 13 }} /> },
  moderator: { label: 'Moderator', color: '#7c3aed', icon: <Shield sx={{ fontSize: 13 }} /> },
  user:     { label: 'Member',    color: '#10b981', icon: <Person sx={{ fontSize: 13 }} /> },
};
const getRole = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.user;

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const [tab, setTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: user?.username || '', bio: user?.bio || '', avatar: user?.avatar || '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (tab === 1 && user?.id) loadPlaces(); }, [tab, user?.id]);

  const loadPlaces = async () => {
    setPlacesLoading(true);
    try {
      const { data } = await placesAPI.getAll({ user_id: user.id });
      setPlaces(Array.isArray(data) ? data.filter((p) => p.user_id === user.id) : []);
    } catch { setPlaces([]); }
    finally { setPlacesLoading(false); }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const { data } = await authAPI.updateProfile({ username: form.username, bio: form.bio, avatar: form.avatar });
      updateUser(data);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) { setSaveError(e.response?.data?.error || 'Failed to update'); }
    finally { setSaveLoading(false); }
  };

  const handleCancel = () => {
    setForm({ username: user?.username || '', bio: user?.bio || '', avatar: user?.avatar || '' });
    setEditing(false);
    setSaveError('');
  };

  const roleConf = getRole(user?.role);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#09090b' }}>
      <AppBar position="sticky" sx={{ bgcolor: 'rgba(9,9,11,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton onClick={() => navigate('/')} sx={{ color: '#71717a' }}>
            <ArrowBack sx={{ fontSize: 20 }} />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 26, height: 26, borderRadius: 1.5, background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>📍</Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
              Mapped
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.875rem', color: '#52525b', ml: 0.5 }}>/ Profile</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 620, mx: 'auto', px: 2, py: 4 }}>
        {/* Profile card */}
        <Box sx={{ borderRadius: 3, bgcolor: 'rgba(24,24,27,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', mb: 2 }}>
          {/* Banner */}
          <Box sx={{ height: 80, background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(236,72,153,0.3))', borderBottom: '1px solid rgba(255,255,255,0.04)' }} />

          {/* Avatar + info */}
          <Box sx={{ px: 3, pb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: '-40px', mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar src={editing ? form.avatar : user?.avatar} sx={{
                  width: 72, height: 72, fontSize: '1.5rem',
                  border: '3px solid #09090b',
                  background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
              </Box>
              {!editing ? (
                <Button size="small" variant="outlined" startIcon={<Edit sx={{ fontSize: 14 }} />} onClick={() => setEditing(true)} sx={{ mb: 0.5 }}>
                  Edit
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                  <Button size="small" variant="outlined" startIcon={<Cancel sx={{ fontSize: 14 }} />} onClick={handleCancel}>Cancel</Button>
                  <Button size="small" variant="contained" startIcon={saveLoading ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <Save sx={{ fontSize: 14 }} />} onClick={handleSave} disabled={saveLoading}>
                    Save
                  </Button>
                </Box>
              )}
            </Box>

            {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
            {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>Profile updated</Alert>}

            {editing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                <TextField label="Username" size="small" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                <TextField label="Bio" size="small" multiline rows={2} placeholder="Tell something about yourself…"
                  value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                <TextField label="Avatar URL" size="small" placeholder="https://…"
                  value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  InputProps={{ startAdornment: <PhotoCamera sx={{ fontSize: 15, color: '#52525b', mr: 1 }} /> }} />
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#fafafa' }}>{user?.username}</Typography>
                  <Chip size="small" icon={roleConf.icon} label={roleConf.label}
                    sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 700, background: `${roleConf.color}18`, color: roleConf.color, border: '1px solid', borderColor: `${roleConf.color}30` }} />
                </Box>
                <Typography sx={{ fontSize: '0.8125rem', color: '#52525b', mb: 0.75 }}>{user?.email}</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: user?.bio ? '#71717a' : '#3f3f46', lineHeight: 1.6, fontStyle: user?.bio ? 'normal' : 'italic' }}>
                  {user?.bio || 'No bio yet'}
                </Typography>
              </>
            )}
          </Box>
        </Box>

        {/* Places tab */}
        <Box sx={{ borderRadius: 3, bgcolor: 'rgba(24,24,27,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', minHeight: 44 }}>
            <Tab label="My Places" sx={{ fontSize: '0.875rem', minHeight: 44 }} />
          </Tabs>

          <Box sx={{ p: 2 }}>
            {placesLoading ? (
              <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress size={22} /></Box>
            ) : places.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <LocationOn sx={{ fontSize: 32, color: '#27272a', mb: 1 }} />
                <Typography sx={{ fontSize: '0.875rem', color: '#3f3f46', mb: 2 }}>No places yet</Typography>
                <Button size="small" variant="outlined" onClick={() => navigate('/')}>Explore map</Button>
              </Box>
            ) : places.map((p) => {
              const cat = getCat(p.category);
              return (
                <Box key={p.id} onClick={() => navigate('/')} sx={{
                  p: 1.75, mb: 1, borderRadius: 2,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', gap: 1.5, alignItems: 'center',
                  cursor: 'pointer', transition: 'all 0.15s',
                  '&:hover': { background: 'rgba(124,58,237,0.07)', borderColor: 'rgba(124,58,237,0.2)' },
                }}>
                  <Box sx={{ fontSize: 18, flexShrink: 0 }}>{cat.emoji}</Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#fafafa', mb: 0.2 }}>{p.name}</Typography>
                    {p.description && (
                      <Typography sx={{ fontSize: '0.75rem', color: '#52525b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.description}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                      <Star sx={{ fontSize: 12, color: '#f59e0b' }} />
                      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#f59e0b' }}>{(p.rating || 0).toFixed(1)}</Typography>
                    </Box>
                    <Chip label={p.approval} size="small"
                      sx={{ height: 18, fontSize: '0.5625rem', fontWeight: 700, textTransform: 'capitalize',
                        color: p.approval === 'approved' ? '#10b981' : p.approval === 'rejected' ? '#ef4444' : '#f59e0b',
                        background: p.approval === 'approved' ? 'rgba(16,185,129,0.12)' : p.approval === 'rejected' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                      }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;
