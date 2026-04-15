import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Button, Chip,
  Avatar, CircularProgress, Alert, Snackbar,
} from '@mui/material';
import {
  ArrowBack, CheckCircle, Cancel, Public, Lock,
  LocationOn, Schedule, HourglassEmpty, Shield,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { placesAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { getCat } from '../components/ui/categories';

const TABS = [
  { key: 'pending',  label: 'Pending',  color: '#f59e0b', Icon: HourglassEmpty },
  { key: 'approved', label: 'Approved', color: '#10b981', Icon: CheckCircle },
  { key: 'rejected', label: 'Rejected', color: '#ef4444', Icon: Cancel },
];

const PlaceRow = ({ place, onApprove, onReject, loadingId, tabKey }) => {
  const cat = getCat(place.category);
  const isBusy = loadingId === place.id;

  return (
    <Box sx={{
      borderRadius: 2.5, bgcolor: 'rgba(24,24,27,0.8)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.05)', mb: 1.5, overflow: 'hidden',
      transition: 'border-color 0.15s',
      '&:hover': { borderColor: 'rgba(124,58,237,0.3)' },
    }}>
      <Box sx={{ height: 3, background: `linear-gradient(90deg, ${cat.color}60, transparent)` }} />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2, flexShrink: 0,
            background: `${cat.color}18`, border: `1px solid ${cat.color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
          }}>
            {cat.emoji}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#fafafa', mb: 0.5 }}>
              {place.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              <Chip label={place.privacy} size="small"
                icon={place.privacy === 'public' ? <Public sx={{ fontSize: 11 }} /> : <Lock sx={{ fontSize: 11 }} />}
                sx={{ height: 20, fontSize: '0.6875rem', textTransform: 'capitalize',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <Chip label={place.category} size="small"
                sx={{ height: 20, fontSize: '0.6875rem', background: `${cat.color}15`, color: cat.color }} />
            </Box>
          </Box>
        </Box>

        {place.description && (
          <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', lineHeight: 1.6, mb: 1.5 }}>
            {place.description.length > 100 ? place.description.slice(0, 100) + '…' : place.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: tabKey === 'pending' ? 1.5 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 20, height: 20, fontSize: '0.5625rem', background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}>
              {(place.username || '?')[0].toUpperCase()}
            </Avatar>
            <Typography sx={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 500 }}>@{place.username || 'unknown'}</Typography>
            <Typography sx={{ color: '#27272a', fontSize: '0.75rem' }}>·</Typography>
            <Schedule sx={{ fontSize: 11, color: '#52525b' }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#52525b' }}>
              {new Date(place.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOn sx={{ fontSize: 11, color: '#3f3f46' }} />
            <Typography sx={{ fontSize: '0.6875rem', color: '#3f3f46', fontFamily: 'monospace' }}>
              {place.latitude?.toFixed(4)}, {place.longitude?.toFixed(4)}
            </Typography>
          </Box>
        </Box>

        {tabKey === 'pending' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button fullWidth variant="contained" color="success" onClick={() => onApprove(place.id)} disabled={!!loadingId}
              startIcon={isBusy ? <CircularProgress size={14} sx={{ color: 'inherit' }} /> : <CheckCircle sx={{ fontSize: 15 }} />}
              sx={{ borderRadius: 2, fontSize: '0.8125rem' }}>
              Approve
            </Button>
            <Button fullWidth variant="outlined" color="error" onClick={() => onReject(place.id)} disabled={!!loadingId}
              startIcon={<Cancel sx={{ fontSize: 15 }} />}
              sx={{ borderRadius: 2, fontSize: '0.8125rem', borderColor: 'rgba(239,68,68,0.3)', '&:hover': { borderColor: '#ef4444' } }}>
              Reject
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const ModerationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [tab, setTab] = useState(0);
  const [places, setPlaces] = useState({ pending: [], approved: [], rejected: [] });
  const [fetching, setFetching] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const fetchAll = useCallback(async () => {
    setFetching(true);
    try {
      const { data } = await placesAPI.getAll({ limit: 200 });
      const list = Array.isArray(data) ? data : (data.places || []);
      setPlaces({
        pending:  list.filter((p) => p.approval === 'pending' && p.privacy === 'public'),
        approved: list.filter((p) => p.approval === 'approved'),
        rejected: list.filter((p) => p.approval === 'rejected'),
      });
    } catch { setSnack({ open: true, message: 'Failed to load places', severity: 'error' }); }
    finally { setFetching(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleApprove = async (id) => {
    setLoadingAction(id);
    try { await placesAPI.approve(id, 'approved'); setSnack({ open: true, message: 'Place approved', severity: 'success' }); fetchAll(); }
    catch { setSnack({ open: true, message: 'Failed to approve', severity: 'error' }); }
    finally { setLoadingAction(null); }
  };

  const handleReject = async (id) => {
    setLoadingAction(id);
    try { await placesAPI.approve(id, 'rejected'); setSnack({ open: true, message: 'Place rejected', severity: 'warning' }); fetchAll(); }
    catch { setSnack({ open: true, message: 'Failed to reject', severity: 'error' }); }
    finally { setLoadingAction(null); }
  };

  const currentTab = TABS[tab];
  const currentList = places[currentTab.key];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#09090b' }}>
      <AppBar position="sticky" sx={{ bgcolor: 'rgba(9,9,11,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Toolbar sx={{ gap: 1.5 }}>
          <IconButton onClick={() => navigate('/')} sx={{ color: '#71717a' }}>
            <ArrowBack sx={{ fontSize: 20 }} />
          </IconButton>
          <Box sx={{ width: 28, height: 28, borderRadius: 1.5, background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>📍</Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#fafafa', lineHeight: 1.2 }}>Mapped</Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: '#52525b', lineHeight: 1 }}>Moderation</Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {places.pending.length > 0 && (
              <Chip size="small" icon={<HourglassEmpty sx={{ fontSize: 12 }} />}
                label={`${places.pending.length} pending`}
                sx={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', fontWeight: 700, fontSize: '0.75rem' }} />
            )}
            <Avatar sx={{ width: 28, height: 28, fontSize: '0.6875rem', background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 760, mx: 'auto', px: 2, py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Shield sx={{ color: '#7c3aed', fontSize: 22 }} />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#fafafa', letterSpacing: '-0.01em' }}>Moderation</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#52525b' }}>Review community places before they go live</Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
          {TABS.map((t, i) => (
            <Box key={t.key} onClick={() => setTab(i)} sx={{
              flex: 1, p: 1.75, borderRadius: 2.5, textAlign: 'center', cursor: 'pointer',
              background: tab === i ? `${t.color}12` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${tab === i ? `${t.color}40` : 'rgba(255,255,255,0.05)'}`,
              transition: 'all 0.15s',
              '&:hover': { borderColor: `${t.color}40` },
            }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: t.color, lineHeight: 1 }}>{places[t.key].length}</Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mt: 0.5 }}>{t.label}</Typography>
            </Box>
          ))}
        </Box>

        {/* List */}
        {fetching ? (
          <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress size={24} /></Box>
        ) : currentList.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <currentTab.Icon sx={{ fontSize: 40, color: '#27272a', mb: 1 }} />
            <Typography sx={{ fontSize: '0.875rem', color: '#3f3f46', fontWeight: 600 }}>
              {tab === 0 ? 'All caught up — no pending places' : `No ${currentTab.key} places`}
            </Typography>
          </Box>
        ) : currentList.map((place) => (
          <PlaceRow key={place.id} place={place} tabKey={currentTab.key}
            onApprove={handleApprove} onReject={handleReject} loadingId={loadingAction} />
        ))}
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ borderRadius: 2 }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModerationPage;
