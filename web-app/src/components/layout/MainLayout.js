import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useMediaQuery,
  useTheme,
  Divider,
  Select,
  FormControl,
  Tooltip,
} from '@mui/material';
import {
  Map as MapIcon,
  DynamicFeed as FeedIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  Recommend as RecommendIcon,
  Logout,
  AdminPanelSettings,
  Settings,
  Language,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';

const MotionBox = motion(Box);

const NavItem = ({ item, isActive, onClick }) => (
  <MotionBox
    onClick={onClick}
    whileHover={{ x: 4 }}
    whileTap={{ x: 2 }}
    sx={{
      cursor: 'pointer',
      px: 2,
      py: 1.5,
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      color: isActive ? '#f8fafc' : '#94a3b8',
      transition: 'all 0.2s ease',
      background: isActive ? 'rgba(124,58,237,0.1)' : 'transparent',
      border: isActive ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
      userSelect: 'none',
      position: 'relative',
    }}
  >
    {item.badge ? (
      <Badge
        badgeContent={item.badge}
        sx={{
          '& .MuiBadge-badge': {
            background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.65rem',
          },
        }}
      >
        {React.cloneElement(item.icon, { sx: { fontSize: 20 } })}
      </Badge>
    ) : (
      React.cloneElement(item.icon, { sx: { fontSize: 20 } })
    )}
    <Typography sx={{ fontWeight: isActive ? 600 : 500, fontSize: '0.9rem' }}>
      {item.title}
    </Typography>

    {isActive && (
      <MotionBox
        layoutId="activeNav"
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        sx={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 3,
          height: '70%',
          background: 'linear-gradient(180deg, #7c3aed, #ec4899)',
          borderRadius: '0 2px 2px 0',
        }}
      />
    )}
  </MotionBox>
);

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { language, setLanguage, t } = useLanguage();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [langAnchor, setLangAnchor] = useState(null);

  const navItems = [
    { path: '/', title: t('feed'), icon: <FeedIcon /> },
    { path: '/map', title: t('map'), icon: <MapIcon /> },
    { path: '/places', title: t('places'), icon: <RecommendIcon /> },
    { path: '/chats', title: t('chats'), icon: <ChatIcon /> },
    { path: '/groups', title: t('groups'), icon: <GroupsIcon /> },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/moderation', title: t('moderate'), icon: <AdminPanelSettings /> });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileAnchor(null);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#030712' }}>
      {/* Sidebar - Desktop only */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          width: 280,
          background: 'rgba(15,23,42,0.4)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          p: 3,
          gap: 3,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto',
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <MotionBox
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            fontSize: '1.3rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          Mapped
        </MotionBox>

        {/* Navigation */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
          {navItems.map((item, idx) => (
            <MotionBox
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <NavItem
                item={item}
                isActive={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              />
            </MotionBox>
          ))}
        </Box>

        {/* Divider */}
        <Box sx={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

        {/* User section */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {/* Profile card */}
          <Box
            onClick={(e) => setProfileAnchor(e.currentTarget)}
            sx={{
              p: 2,
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(124,58,237,0.12)',
                borderColor: 'rgba(124,58,237,0.4)',
              },
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar
              src={user?.avatar}
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                {user?.username}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.25 }}>
                {user?.role}
              </Typography>
            </Box>
          </Box>

          {/* Settings & Logout */}
           <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
             <Box sx={{ display: 'flex', gap: 1 }}>
               <Tooltip title={t('language')}>
                 <IconButton
                   onClick={(e) => setLangAnchor(e.currentTarget)}
                   sx={{
                     flex: 1,
                     color: '#94a3b8',
                     borderRadius: 2,
                     border: '1px solid rgba(255,255,255,0.1)',
                     '&:hover': {
                       color: '#a78bfa',
                       borderColor: 'rgba(124,58,237,0.3)',
                       background: 'rgba(124,58,237,0.05)',
                     },
                   }}
                 >
                   <Language sx={{ fontSize: 18 }} />
                 </IconButton>
               </Tooltip>
               <Tooltip title={t('settings')}>
                 <IconButton
                   onClick={() => navigate('/settings')}
                   sx={{
                     flex: 1,
                     color: '#94a3b8',
                     borderRadius: 2,
                     border: '1px solid rgba(255,255,255,0.1)',
                     '&:hover': {
                       color: '#a78bfa',
                       borderColor: 'rgba(124,58,237,0.3)',
                       background: 'rgba(124,58,237,0.05)',
                     },
                   }}
                 >
                   <Settings sx={{ fontSize: 18 }} />
                 </IconButton>
               </Tooltip>
             </Box>
              <Tooltip title={t('logout')}>
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    width: '100%',
                    color: '#94a3b8',
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.1)',
                    '&:hover': {
                      color: '#f87171',
                      borderColor: 'rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.05)',
                    },
                  }}
                >
                  <Logout sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
        </MotionBox>
      </Box>

      {/* Top navbar - Mobile only */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          height: 64,
          background: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
        }}
      >
        <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Mapped
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title={t('language')}>
            <IconButton 
              onClick={(e) => setLangAnchor(e.currentTarget)}
              size="small"
              sx={{ color: '#94a3b8' }}
            >
              <Language sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('profile')}>
            <IconButton 
              onClick={(e) => setProfileAnchor(e.currentTarget)}
              size="small"
              sx={{ color: '#94a3b8' }}
            >
              <Avatar src={user?.avatar} sx={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                {user?.username?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, overflow: 'auto', paddingBottom: { xs: isMobile ? '70px' : 0, md: 0 } }}>
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </MotionBox>
      </Box>

      {/* Profile menu */}
      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        PaperProps={{
          sx: {
            background: 'rgba(15,23,42,0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            mt: 1,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            navigate('/profile');
            setProfileAnchor(null);
          }}
          sx={{
            color: '#f8fafc',
            '&:hover': { background: 'rgba(124,58,237,0.1)' },
          }}
        >
          <PersonIcon sx={{ mr: 1, fontSize: 18 }} />
          {t('profile')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate('/settings');
            setProfileAnchor(null);
          }}
          sx={{
            color: '#f8fafc',
            '&:hover': { background: 'rgba(124,58,237,0.1)' },
          }}
        >
          <Settings sx={{ mr: 1, fontSize: 18 }} />
          {t('settings')}
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem
          onClick={handleLogout}
          sx={{
            color: '#f87171',
            '&:hover': { background: 'rgba(239,68,68,0.1)' },
          }}
        >
          <Logout sx={{ mr: 1, fontSize: 18 }} />
          {t('logout')}
        </MenuItem>
      </Menu>

      {/* Language menu */}
      <Menu
        anchorEl={langAnchor}
        open={Boolean(langAnchor)}
        onClose={() => setLangAnchor(null)}
        PaperProps={{
          sx: {
            background: 'rgba(15,23,42,0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            mt: 1,
          },
        }}
      >
        <MenuItem
          selected={language === 'en'}
          onClick={() => {
            setLanguage('en');
            setLangAnchor(null);
          }}
          sx={{
            color: language === 'en' ? '#a78bfa' : '#f8fafc',
            '&:hover': { background: 'rgba(124,58,237,0.1)' },
          }}
        >
          🇬🇧 English
        </MenuItem>
        <MenuItem
          selected={language === 'ru'}
          onClick={() => {
            setLanguage('ru');
            setLangAnchor(null);
          }}
          sx={{
            color: language === 'ru' ? '#a78bfa' : '#f8fafc',
            '&:hover': { background: 'rgba(124,58,237,0.1)' },
          }}
        >
          🇷🇺 Русский
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MainLayout;
