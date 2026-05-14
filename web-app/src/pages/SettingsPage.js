import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  TextField,
  CircularProgress,
} from '@mui/material';
import { Settings as SettingsIcon, Logout } from '@mui/icons-material';
import { motion } from 'framer-motion';
import MainLayout from '../components/layout/MainLayout';
import useAuthStore from '../store/authStore';
import { useNotify } from '../components/ui/NotificationProvider';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const notify = useNotify();
  const { mode, toggleTheme } = useThemeContext();
  const { language, changeLanguage, t } = useLanguage();

  const [showStatus, setShowStatus] = useState(localStorage.getItem('showOnlineStatus') !== 'false');
  const [notifications, setNotifications] = useState(true);
  const [customStatus, setCustomStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.custom_status) {
      setCustomStatus(user.custom_status);
    }
  }, [user]);

  const handleLanguageChange = (e) => {
    changeLanguage(e.target.value);
    notify.success(t('languageChanged'));
  };

  const handleThemeChange = (e) => {
    toggleTheme(e.target.value);
    notify.success(t('themeChanged'));
  };

  const handleStatusChange = (e) => {
    setShowStatus(e.target.checked);
    localStorage.setItem('showOnlineStatus', e.target.checked);
  };

  const handleSaveStatus = async () => {
    setSaving(true);
    try {
      // In real app, would save custom status to backend
      localStorage.setItem('customStatus', customStatus);
      notify.success(t('statusUpdated'));
    } catch (err) {
      notify.error(t('error'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    notify.success('Logged out');
  };

  return (
    <MainLayout>
      <Box sx={{ minHeight: 'calc(100vh - 64px)', background: '#030712', py: 4, px: 2 }}>
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          {/* Header */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            sx={{ mb: 4 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SettingsIcon sx={{ fontSize: 24, color: 'white' }} />
              </Box>
               <Box>
                 <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#fafafa' }}>
                   {t('settings')}
                 </Typography>
                 <Typography sx={{ fontSize: '0.85rem', color: '#71717a' }}>
                   {t('customizeExperience')}
                 </Typography>
               </Box>
            </Box>
          </MotionBox>

          {/* Appearance Settings */}
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            sx={{
              p: 3,
              mb: 2,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(236,72,153,0.1) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3,
            }}
          >
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#fafafa', mb: 2 }}>
              {t('appearance')}
            </Typography>

            <FormControl fullWidth sx={{ mb: 2.5 }}>
              <InputLabel sx={{ color: '#71717a' }}>{t('theme')}</InputLabel>
              <Select
                value={mode}
                label={t('theme')}
                onChange={handleThemeChange}
                sx={{
                  color: '#fafafa',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                }}
              >
                <MenuItem value="dark">{t('dark')}</MenuItem>
                <MenuItem value="light">{t('light')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ color: '#71717a' }}>{t('language')}</InputLabel>
              <Select
                value={language}
                label={t('language')}
                onChange={handleLanguageChange}
                sx={{
                  color: '#fafafa',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="ru">Русский</MenuItem>
              </Select>
            </FormControl>
          </MotionPaper>

          {/* Privacy & Status */}
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            sx={{
              p: 3,
              mb: 2,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(236,72,153,0.1) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3,
            }}
          >
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#fafafa', mb: 2 }}>
              {t('privacyStatus')}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={showStatus}
                  onChange={handleStatusChange}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#7c3aed',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#7c3aed',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography sx={{ color: '#fafafa', fontWeight: 600 }}>
                    {t('showOnlineStatus')}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#71717a' }}>
                    {t('letOthersSeeWhenOnline')}
                  </Typography>
                </Box>
              }
              sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}
            />

            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#fafafa', mb: 1.5 }}>
              {t('customStatus')}
            </Typography>
            <TextField
              fullWidth
              placeholder={t('whatsOnYourMind')}
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              maxRows={3}
              multiline
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: '#fafafa',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                },
              }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleSaveStatus}
              disabled={saving}
              sx={{
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                py: 1.25,
              }}
            >
              {saving ? <CircularProgress size={20} /> : t('saveStatus')}
            </Button>
          </MotionPaper>

          {/* Notifications */}
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            sx={{
              p: 3,
              mb: 2,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(236,72,153,0.1) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3,
            }}
          >
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#fafafa', mb: 2 }}>
              {t('notifications')}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#7c3aed',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#7c3aed',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography sx={{ color: '#fafafa', fontWeight: 600 }}>
                    {t('enableNotifications')}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#71717a' }}>
                    {t('getNotifiedAboutMessages')}
                  </Typography>
                </Box>
              }
              sx={{ display: 'flex', alignItems: 'flex-start' }}
            />
          </MotionPaper>

          {/* Account */}
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(236,72,153,0.1) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3,
            }}
          >
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#fafafa', mb: 2 }}>
              {t('account')}
            </Typography>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(239,68,68,0.2)',
                mb: 2,
              }}
            >
              <Typography sx={{ color: '#fafafa', fontWeight: 600, mb: 1 }}>
                {user?.username}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#71717a' }}>
                {user?.email}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{
                color: '#ef4444',
                borderColor: '#ef4444',
                py: 1.25,
                '&:hover': {
                  background: 'rgba(239,68,68,0.1)',
                  borderColor: '#ef4444',
                },
              }}
            >
              {t('logout')}
            </Button>
          </MotionPaper>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default SettingsPage;
