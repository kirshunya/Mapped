import React, { useMemo, useState } from 'react';
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
  LocationOn,
  Settings,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';

const MotionBox = motion(Box);

// Animated indicator for active tab
const ActiveIndicator = ({ layoutId }) => (
  <MotionBox
    layoutId="activeTab"
    initial={false}
    transition={{
      type: 'spring',
      stiffness: 500,
      damping: 35,
    }}
    sx={{
      position: 'absolute',
      inset: 0,
      borderRadius: 2.5,
      background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(236,72,153,0.15) 100%)',
      border: '1px solid rgba(124,58,237,0.3)',
      zIndex: 0,
    }}
  />
);

// Nav item component
const NavItem = ({ item, isActive, onClick, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <MotionBox
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        px: { xs: 1.5, md: 2.5 },
        py: 1.25,
        borderRadius: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        color: isActive ? '#f8fafc' : '#94a3b8',
        transition: 'color 0.2s ease',
        zIndex: 1,
      }}
    >
      {isActive && <ActiveIndicator />}
      
      {/* Icon */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
                minWidth: 18,
                height: 18,
                boxShadow: '0 2px 8px rgba(236,72,153,0.4)',
              },
            }}
          >
            {React.cloneElement(item.icon, {
              sx: {
                fontSize: 22,
                transition: 'transform 0.2s ease',
                transform: isActive || isHovered ? 'scale(1.1)' : 'scale(1)',
              },
            })}
          </Badge>
        ) : (
          React.cloneElement(item.icon, {
            sx: {
              fontSize: 22,
              transition: 'transform 0.2s ease',
              transform: isActive || isHovered ? 'scale(1.1)' : 'scale(1)',
            },
          })
        )}
      </Box>

      {/* Label */}
      {!isMobile && (
        <Typography
          sx={{
            position: 'relative',
            zIndex: 1,
            fontWeight: isActive ? 700 : 600,
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
          }}
        >
          {item.title}
        </Typography>
      )}

      {/* Hover glow effect */}
      <AnimatePresence>
        {isHovered && !isActive && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: 2.5,
              background: 'rgba(255,255,255,0.05)',
              zIndex: 0,
            }}
          />
        )}
      </AnimatePresence>
    </MotionBox>
  );
};

// Notification dropdown
const NotificationDropdown = ({ anchorEl, open, onClose }) => (
  <Menu
    anchorEl={anchorEl}
    open={open}
    onClose={onClose}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    PaperProps={{
      sx: {
        mt: 1.5,
        minWidth: 320,
        maxHeight: 400,
        background: 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 3,
        overflow: 'hidden',
      },
    }}
  >
    <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <Typography sx={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
        Notifications
      </Typography>
    </Box>
    
    {[
      { title: 'New follower', desc: 'Alex started following you', time: '2m ago', unread: true },
      { title: 'Post liked', desc: 'Sarah liked your photo', time: '15m ago', unread: true },
      { title: 'New comment', desc: 'Mike commented on your post', time: '1h ago', unread: false },
    ].map((notif, i) => (
      <MenuItem
        key={i}
        onClick={onClose}
        sx={{
          py: 1.5,
          px: 2,
          gap: 1.5,
          background: notif.unread ? 'rgba(124,58,237,0.08)' : 'transparent',
          '&:hover': { background: 'rgba(124,58,237,0.12)' },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <NotificationsIcon sx={{ fontSize: 20, color: '#fff' }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc' }}>
            {notif.title}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {notif.desc}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
          {notif.time}
        </Typography>
      </MenuItem>
    ))}
    
    <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <Typography
        sx={{
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#a78bfa',
          cursor: 'pointer',
          fontWeight: 600,
          '&:hover': { color: '#c4b5fd' },
        }}
      >
        View all notifications
      </Typography>
    </Box>
  </Menu>
);

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const navItems = useMemo(
    () => [
      { title: 'Map', icon: <MapIcon />, path: '/' },
      { title: 'Feed', icon: <FeedIcon />, path: '/feed' },
      { title: 'Groups', icon: <GroupsIcon />, path: '/groups' },
      { title: 'Explore', icon: <RecommendIcon />, path: '/recommendations' },
      { title: 'Messages', icon: <ChatIcon />, path: '/chats', badge: 3 },
    ],
    []
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={styles.root}>
      {/* Ambient background */}
      <Box sx={styles.ambientBg}>
        <Box sx={styles.gradientOrb1} />
        <Box sx={styles.gradientOrb2} />
      </Box>

      {/* Main navigation bar */}
      <MotionBox
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        sx={styles.navbar}
      >
        <Box sx={styles.navbarInner}>
          {/* Logo */}
          <MotionBox
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            sx={styles.logoContainer}
          >
            <Box sx={styles.logoIcon}>
              <LocationOn sx={{ fontSize: 22, color: '#fff' }} />
            </Box>
            {!isMobile && (
              <Typography sx={styles.logoText}>Mapped</Typography>
            )}
          </MotionBox>

          {/* Navigation items */}
          <Box sx={styles.navItems}>
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                isMobile={isMobile}
              />
            ))}
          </Box>

          {/* Right section */}
          <Box sx={styles.rightSection}>
            {/* Notifications */}
            <MotionBox whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton
                onClick={(e) => setNotifAnchor(e.currentTarget)}
                sx={styles.iconButton}
              >
                <Badge
                  badgeContent={4}
                  sx={{
                    '& .MuiBadge-badge': {
                      background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      minWidth: 18,
                      height: 18,
                    },
                  }}
                >
                  <NotificationsIcon sx={{ fontSize: 22 }} />
                </Badge>
              </IconButton>
            </MotionBox>

            {/* User menu */}
            <MotionBox
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => setUserMenuAnchor(e.currentTarget)}
              sx={styles.userButton}
            >
              <Avatar
                src={user?.avatar}
                sx={styles.avatar}
              >
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              {!isMobile && (
                <>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography sx={styles.userName}>
                      {user?.username || 'User'}
                    </Typography>
                    <Typography sx={styles.userRole}>
                      {user?.role || 'Explorer'}
                    </Typography>
                  </Box>
                  <KeyboardArrowDown
                    sx={{
                      fontSize: 18,
                      color: '#64748b',
                      transition: 'transform 0.2s',
                      transform: userMenuAnchor ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </>
              )}
            </MotionBox>
          </Box>
        </Box>
      </MotionBox>

      {/* Notification dropdown */}
      <NotificationDropdown
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)}
      />

      {/* User menu dropdown */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 220,
            background: 'rgba(15,23,42,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3,
            overflow: 'hidden',
          },
        }}
      >
        {/* User info header */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={user?.avatar}
              sx={{
                width: 44,
                height: 44,
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                fontWeight: 700,
              }}
            >
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem' }}>
                {user?.username || 'User'}
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                {user?.email || ''}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ py: 1 }}>
          <MenuItem
            onClick={() => { navigate('/profile'); setUserMenuAnchor(null); }}
            sx={styles.menuItem}
          >
            <PersonIcon sx={{ fontSize: 20, color: '#94a3b8' }} />
            <Typography>Profile</Typography>
          </MenuItem>

          <MenuItem sx={styles.menuItem}>
            <Settings sx={{ fontSize: 20, color: '#94a3b8' }} />
            <Typography>Settings</Typography>
          </MenuItem>

          {(user?.role === 'moderator' || user?.role === 'admin') && (
            <MenuItem
              onClick={() => { navigate('/moderation'); setUserMenuAnchor(null); }}
              sx={styles.menuItem}
            >
              <AdminPanelSettings sx={{ fontSize: 20, color: '#94a3b8' }} />
              <Typography>Moderation</Typography>
            </MenuItem>
          )}
        </Box>

        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.06)', py: 1 }}>
          <MenuItem
            onClick={handleLogout}
            sx={{
              ...styles.menuItem,
              color: '#f87171',
              '&:hover': { background: 'rgba(248,113,113,0.1)' },
            }}
          >
            <Logout sx={{ fontSize: 20 }} />
            <Typography>Sign out</Typography>
          </MenuItem>
        </Box>
      </Menu>

      {/* Main content */}
      <Box component="main" sx={styles.main}>
        {children}
      </Box>
    </Box>
  );
};

const styles = {
  root: {
    minHeight: '100vh',
    background: '#030712',
    position: 'relative',
    overflow: 'hidden',
  },
  ambientBg: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  gradientOrb1: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 60%)',
    top: '-10%',
    left: '-10%',
    filter: 'blur(80px)',
    animation: 'ambientFloat1 30s ease-in-out infinite',
    '@keyframes ambientFloat1': {
      '0%, 100%': { transform: 'translate(0, 0)' },
      '50%': { transform: 'translate(100px, 50px)' },
    },
  },
  gradientOrb2: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 60%)',
    bottom: '-10%',
    right: '-10%',
    filter: 'blur(80px)',
    animation: 'ambientFloat2 25s ease-in-out infinite',
    '@keyframes ambientFloat2': {
      '0%, 100%': { transform: 'translate(0, 0)' },
      '50%': { transform: 'translate(-80px, -60px)' },
    },
  },
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1200,
    px: { xs: 1.5, md: 3 },
    py: 1.5,
  },
  navbarInner: {
    maxWidth: 1400,
    mx: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: { xs: 1, md: 2 },
    px: { xs: 1.5, md: 2.5 },
    py: 1,
    borderRadius: 4,
    background: 'rgba(15,23,42,0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    cursor: 'pointer',
    pr: { xs: 0, md: 2 },
    mr: { xs: 0, md: 1 },
    borderRight: { xs: 'none', md: '1px solid rgba(255,255,255,0.06)' },
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 2.5,
    background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
  },
  logoText: {
    fontSize: '1.2rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  },
  navItems: {
    display: 'flex',
    alignItems: 'center',
    gap: { xs: 0.25, md: 0.5 },
    flex: 1,
    justifyContent: 'center',
    overflowX: 'auto',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: { xs: 0.5, md: 1 },
    pl: { xs: 0, md: 1 },
    ml: { xs: 0, md: 1 },
    borderLeft: { xs: 'none', md: '1px solid rgba(255,255,255,0.06)' },
  },
  iconButton: {
    color: '#94a3b8',
    p: 1,
    borderRadius: 2,
    transition: 'all 0.2s ease',
    '&:hover': {
      color: '#f8fafc',
      background: 'rgba(124,58,237,0.1)',
    },
  },
  userButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    cursor: 'pointer',
    p: 0.75,
    pr: { xs: 0.75, md: 1.5 },
    borderRadius: 2.5,
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(255,255,255,0.05)',
    },
  },
  avatar: {
    width: 36,
    height: 36,
    fontWeight: 700,
    fontSize: '0.9rem',
    background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
    border: '2px solid rgba(255,255,255,0.1)',
  },
  userName: {
    color: '#f8fafc',
    fontWeight: 600,
    fontSize: '0.85rem',
    lineHeight: 1.2,
  },
  userRole: {
    color: '#64748b',
    fontSize: '0.7rem',
    textTransform: 'capitalize',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    py: 1.25,
    px: 2,
    mx: 1,
    borderRadius: 2,
    color: '#e2e8f0',
    fontSize: '0.9rem',
    transition: 'all 0.15s ease',
    '&:hover': {
      background: 'rgba(124,58,237,0.1)',
    },
  },
  main: {
    pt: '88px',
    minHeight: '100vh',
    position: 'relative',
    zIndex: 1,
  },
};

export default MainLayout;
