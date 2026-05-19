import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, IconButton, Button, Chip,
  Avatar, CircularProgress, Alert, Divider,
} from '@mui/material';
import {
  CheckCircle, Cancel, Public, Lock,
  LocationOn, Schedule, HourglassEmpty, Shield,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { placesAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { getCat } from '../components/ui/categories';
import MainLayout from '../components/layout/MainLayout';

const MotionBox = motion(Box);

const TABS = [
  { key: 'pending',  label: 'Pending',  color: '#f59e0b', Icon: HourglassEmpty },
  { key: 'approved', label: 'Approved', color: '#10b981', Icon: CheckCircle },
  { key: 'rejected', label: 'Rejected', color: '#ef4444', Icon: Cancel },
];

const PlaceRow = ({ place, onApprove, onReject, loadingId, tabKey }) => {
  const cat = getCat(place.category);
  const isBusy = loadingId === place.id;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        borderRadius: 3,
        background: 'linear-gradient(180deg, rgba(15,15,20,0.95) 0%, rgba(9,9,11,0.98) 100%)',
        border: '1px solid rgba(124,58,237,0.15)',
        mb: 2,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': { 
          borderColor: 'rgba(124,58,237,0.3)',
          boxShadow: '0 8px 24px rgba(124,58,237,0.1)',
        },
      }}
    >
      {/* Category color bar */}
      <Box sx={{ height: 3, background: `linear-gradient(90deg, ${cat.color}80, ${cat.color}20)` }} />

      <Box sx={{ p: 2.5 }}>
        {/* Title and meta */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2.5, flexShrink: 0,
            background: `${cat.color}18`, border: `1px solid ${cat.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: 18,
          }}>
            {cat.emoji}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#fafafa', mb: 0.75 }}>
              {place.name}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.25 }}>
              <Chip 
                label={place.privacy} 
                size="small"
                icon={place.privacy === 'public' ? <Public sx={{ fontSize: 12 }} /> : <Lock sx={{ fontSize: 12 }} />}
                sx={{ 
                  height: 22, 
                  fontSize: '0.68rem', 
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  background: place.privacy === 'public' 
                    ? 'rgba(59,130,246,0.15)' 
                    : 'rgba(168,85,247,0.15)',
                  color: place.privacy === 'public' 
                    ? '#3b82f6'
                    : '#a855f7',
                  border: place.privacy === 'public'
                    ? '1px solid rgba(59,130,246,0.3)'
                    : '1px solid rgba(168,85,247,0.3)',
                }}
              />
              <Chip 
                label={place.category} 
                size="small"
                sx={{ 
                  height: 22,
                  fontSize: '0.68rem', 
                  fontWeight: 600,
                  background: `${cat.color}20`, 
                  color: cat.color,
                  border: `1px solid ${cat.color}40`,
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Description */}
        {place.description && (
          <Typography sx={{ fontSize: '0.825rem', color: '#94a3b8', lineHeight: 1.6, mb: 2 }}>
            {place.description.length > 120 ? place.description.slice(0, 120) + '…' : place.description}
          </Typography>
        )}

        {/* Metadata row */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: tabKey === 'pending' ? 2 : 0,
          pb: tabKey === 'pending' ? 2 : 0,
          borderBottom: tabKey === 'pending' ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Avatar 
              sx={{ 
                width: 24, 
                height: 24, 
                fontSize: '0.6rem', 
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              }}
            >
              {(place.username || '?')[0].toUpperCase()}
            </Avatar>
            <Typography sx={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>
              @{place.username || 'unknown'}
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', background: '#27272a' }} />
            <Schedule sx={{ fontSize: 13, color: '#52525b' }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#71717a' }}>
              {new Date(place.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <LocationOn sx={{ fontSize: 12, color: '#52525b' }} />
            <Typography sx={{ fontSize: '0.7rem', color: '#52525b', fontFamily: 'monospace' }}>
              {place.latitude?.toFixed(4)}, {place.longitude?.toFixed(4)}
            </Typography>
          </Box>
        </Box>

        {/* Action buttons for pending */}
        {tabKey === 'pending' && (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={() => onApprove(place.id)} 
              disabled={!!loadingId}
              startIcon={isBusy ? <CircularProgress size={14} sx={{ color: 'inherit' }} /> : <CheckCircle sx={{ fontSize: 15 }} />}
              sx={{
                borderRadius: 2.5,
                fontSize: '0.8rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                '&:hover': { background: 'linear-gradient(135deg, #34d399, #10b981)' },
                '&:disabled': { background: 'rgba(255,255,255,0.1)' },
                textTransform: 'none',
              }}
            >
              Approve
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={() => onReject(place.id)} 
              disabled={!!loadingId}
              startIcon={<Cancel sx={{ fontSize: 15 }} />}
              sx={{
                borderRadius: 2.5,
                fontSize: '0.8rem',
                fontWeight: 700,
                borderColor: 'rgba(239,68,68,0.4)',
                color: '#ef4444',
                textTransform: 'none',
                '&:hover': { 
                  borderColor: '#ef4444',
                  background: 'rgba(239,68,68,0.08)',
                },
                '&:disabled': { background: 'rgba(255,255,255,0.05)' },
              }}
            >
              Reject
            </Button>
          </Box>
        )}
      </Box>
    </MotionBox>
  );
};

const ModerationPage = () => {
  const { user } = useAuthStore();

  const [tab, setTab] = useState(0);
  const [places, setPlaces] = useState({ pending: [], approved: [], rejected: [] });
  const [fetching, setFetching] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

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
    } catch { 
      setSnackbar({ open: true, message: 'Failed to load places', type: 'error' }); 
    }
    finally { setFetching(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleApprove = async (id) => {
    setLoadingAction(id);
    try { 
      await placesAPI.approve(id, 'approved'); 
      setSnackbar({ open: true, message: 'Place approved ✓', type: 'success' }); 
      fetchAll(); 
    }
    catch { setSnackbar({ open: true, message: 'Failed to approve', type: 'error' }); }
    finally { setLoadingAction(null); }
  };

  const handleReject = async (id) => {
    setLoadingAction(id);
    try { 
      await placesAPI.approve(id, 'rejected'); 
      setSnackbar({ open: true, message: 'Place rejected', type: 'warning' }); 
      fetchAll(); 
    }
    catch { setSnackbar({ open: true, message: 'Failed to reject', type: 'error' }); }
    finally { setLoadingAction(null); }
  };

  const currentTab = TABS[tab];
  const currentList = places[currentTab.key];

  return (
    <MainLayout>
      <Box sx={{ minHeight: 'calc(100vh - 64px)', px: { xs: 2, md: 3 }, py: 3.2 }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* Header */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3.5 }}
          >
            <Box sx={{
              width: 48, height: 48, borderRadius: 2.5,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.2))',
              border: '1px solid rgba(124,58,237,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield sx={{ fontSize: 24, color: '#a78bfa' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.8rem', color: '#fafafa', letterSpacing: '-0.02em' }}>
                Moderation
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#71717a', mt: 0.5 }}>
                Review community places before they go live
              </Typography>
            </Box>
          </MotionBox>

          {/* Stats */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 4 }}
          >
            {TABS.map((t, i) => (
              <MotionBox
                key={t.key}
                whileHover={{ y: -2 }}
                onClick={() => setTab(i)}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: tab === i 
                    ? `linear-gradient(135deg, ${t.color}20, ${t.color}10)`
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tab === i ? `${t.color}40` : 'rgba(255,255,255,0.06)'}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    borderColor: `${t.color}60`,
                    background: `linear-gradient(135deg, ${t.color}25, ${t.color}15)`,
                  },
                }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: t.color, lineHeight: 1 }}>
                  {places[t.key].length}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mt: 1 }}>
                  <t.Icon sx={{ fontSize: 16, color: t.color }} />
                  <Typography sx={{ fontSize: '0.75rem', color: t.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t.label}
                  </Typography>
                </Box>
              </MotionBox>
            ))}
          </MotionBox>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1 }} />

          {/* List */}
          <Box sx={{ mt: 3.5 }}>
            {fetching ? (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <CircularProgress size={32} />
              </Box>
            ) : currentList.length === 0 ? (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                sx={{ 
                  textAlign: 'center', 
                  py: 10,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.08))',
                  border: '1px solid rgba(124,58,237,0.2)',
                }}
              >
                <currentTab.Icon sx={{ fontSize: 48, color: '#27272a', mb: 2 }} />
                <Typography sx={{ fontSize: '0.95rem', color: '#52525b', fontWeight: 600 }}>
                  {tab === 0 ? 'All caught up — no pending places' : `No ${currentTab.key} places`}
                </Typography>
              </MotionBox>
            ) : (
              <AnimatePresence>
                <Box>
                  {currentList.map((place) => (
                    <PlaceRow 
                      key={place.id} 
                      place={place} 
                      tabKey={currentTab.key}
                      onApprove={handleApprove} 
                      onReject={handleReject} 
                      loadingId={loadingAction} 
                    />
                  ))}
                </Box>
              </AnimatePresence>
            )}
          </Box>

          {/* Snackbar */}
          {snackbar.open && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              sx={{
                position: 'fixed',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                px: 3,
                py: 1.5,
                borderRadius: 2.5,
                background: snackbar.type === 'success'
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.08))'
                  : snackbar.type === 'error'
                  ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08))'
                  : 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.08))',
                border: snackbar.type === 'success'
                  ? '1px solid rgba(16,185,129,0.3)'
                  : snackbar.type === 'error'
                  ? '1px solid rgba(239,68,68,0.3)'
                  : '1px solid rgba(245,158,11,0.3)',
                color: snackbar.type === 'success'
                  ? '#34d399'
                  : snackbar.type === 'error'
                  ? '#ef4444'
                  : '#f59e0b',
                zIndex: 1300,
              }}
            >
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {snackbar.message}
              </Typography>
            </MotionBox>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default ModerationPage;
