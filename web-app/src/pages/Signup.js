import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Check } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const MotionBox = motion(Box);

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', '#ef4444', '#f59e0b', '#a78bfa', '#10b981'];

const getStrength = (pwd) => {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
};

// Ultra-smooth animated gradient background
const AnimatedBackground = () => (
  <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    {/* Main gradient orbs */}
    <Box
      sx={{
        position: 'absolute',
        width: '800px',
        height: '800px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
        top: '-20%',
        right: '-15%',
        filter: 'blur(60px)',
        animation: 'float1 20s ease-in-out infinite',
        '@keyframes float1': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-50px, 80px)' },
        },
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
        bottom: '-30%',
        left: '-10%',
        filter: 'blur(60px)',
        animation: 'float2 25s ease-in-out infinite',
        '@keyframes float2': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(40px, -60px)' },
        },
      }}
    />
  </Box>
);

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const pwdStrength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (pwdStrength < 2) {
      setError('Password is too weak');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authAPI.signup(username, email, password);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={styles.root}>
      {/* Animated background */}
      <AnimatedBackground />

      {/* Main content - Centered card only */}
      <Box sx={styles.mainContainer}>
        <MotionBox
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          sx={styles.card}
        >
          {/* Subtle top accent */}
          <Box sx={styles.topAccent} />

          {/* Logo - Minimal */}
          <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            sx={{ mb: 4, textAlign: 'center' }}
          >
            <Box sx={styles.logo}>Mapped</Box>
          </MotionBox>

          {/* Heading */}
          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            sx={{ mb: 1 }}
          >
            <Typography sx={styles.title}>Join Mapped</Typography>
          </MotionBox>

          {/* Subtitle */}
          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{ mb: 4 }}
          >
            <Typography sx={styles.subtitle}>
              Create account and start exploring
            </Typography>
          </MotionBox>

          {/* Error alert */}
          <AnimatePresence>
            {error && (
              <MotionBox
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                sx={{ mb: 3 }}
              >
                <Alert
                  severity="error"
                  sx={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 2,
                    '& .MuiAlert-icon': { color: '#f87171' },
                    '& .MuiAlert-message': { color: '#fca5a5', fontSize: '0.9rem' },
                  }}
                >
                  {error}
                </Alert>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {/* Username field */}
            <MotionBox
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <TextField
                fullWidth
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                sx={styles.textField}
              />
            </MotionBox>

            {/* Email field */}
            <MotionBox
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <TextField
                fullWidth
                placeholder="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                sx={styles.textField}
              />
            </MotionBox>

            {/* Password field */}
            <MotionBox
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <TextField
                fullWidth
                placeholder="Password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                sx={styles.textField}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPwd(!showPwd)}
                        edge="end"
                        size="small"
                        sx={styles.eyeIcon}
                      >
                        {showPwd ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </MotionBox>

            {/* Password strength indicator */}
            <AnimatePresence>
              {password && (
                <MotionBox
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Box sx={{ mt: -1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(pwdStrength / 4) * 100}
                        sx={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          background: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: strengthColors[pwdStrength],
                            borderRadius: 2,
                          },
                        }}
                      />
                      <Typography sx={{ fontSize: '0.8rem', color: strengthColors[pwdStrength], fontWeight: 600 }}>
                        {strengthLabels[pwdStrength]}
                      </Typography>
                    </Box>
                  </Box>
                </MotionBox>
              )}
            </AnimatePresence>

            {/* Confirm password field */}
            <MotionBox
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <TextField
                fullWidth
                placeholder="Confirm password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                sx={styles.textField}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirm(!showConfirm)}
                        edge="end"
                        size="small"
                        sx={styles.eyeIcon}
                      >
                        {showConfirm ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </MotionBox>

            {/* Submit button */}
            <MotionBox
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <Button
                type="submit"
                fullWidth
                disabled={loading}
                sx={styles.submitButton}
              >
                {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Create account'}
              </Button>
            </MotionBox>

            {/* Or divider */}
            <Box sx={styles.divider}>
              <Box sx={styles.dividerLine} />
              <Typography sx={styles.dividerText}>or</Typography>
              <Box sx={styles.dividerLine} />
            </Box>

            {/* Social buttons */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {['Google', 'GitHub'].map((provider) => (
                <MotionBox
                  key={provider}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  <Button
                    fullWidth
                    sx={styles.socialButton}
                  >
                    {provider}
                  </Button>
                </MotionBox>
              ))}
            </Box>
          </Box>

          {/* Footer link */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            sx={{ mt: 4, textAlign: 'center' }}
          >
            <Typography sx={styles.footerText}>
              Already have an account?{' '}
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/login')}
                sx={styles.loginLink}
              >
                Sign in
              </Link>
            </Typography>
          </MotionBox>
        </MotionBox>
      </Box>
    </Box>
  );
};

const styles = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #030712 0%, #0f1419 50%, #1a0f2e 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    position: 'relative',
    width: '100%',
    px: { xs: 2, sm: 3 },
    py: 4,
    zIndex: 10,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    mx: 'auto',
    background: 'rgba(15,23,42,0.5)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: 3,
    border: '1px solid rgba(255,255,255,0.08)',
    p: { xs: 3, sm: 4 },
    overflow: 'hidden',
    position: 'relative',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60%',
    height: 2,
    background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.6), rgba(236,72,153,0.6), transparent)',
    filter: 'blur(1px)',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#f8fafc',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#94a3b8',
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 2,
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'rgba(255,255,255,0.05)',
      },
      '&.Mui-focused': {
        background: 'rgba(124,58,237,0.08)',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255,255,255,0.1)',
        transition: 'border-color 0.3s ease',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(124,58,237,0.3)',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#7c3aed',
      },
    },
    '& .MuiInputBase-input': {
      color: '#f8fafc',
      fontSize: '0.95rem',
      '&::placeholder': {
        color: '#64748b',
        opacity: 1,
      },
    },
  },
  eyeIcon: {
    color: '#64748b',
    transition: 'all 0.2s',
    '&:hover': {
      color: '#a78bfa',
      background: 'rgba(167,139,250,0.1)',
    },
  },
  submitButton: {
    py: 1.5,
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: 2,
    background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
    boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
    transition: 'all 0.3s ease',
    color: 'white',
    '&:hover': {
      boxShadow: '0 12px 48px rgba(124,58,237,0.4)',
    },
    '&:disabled': {
      background: 'rgba(124,58,237,0.3)',
      color: '#94a3b8',
    },
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    my: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    color: '#475569',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  socialButton: {
    py: 1.25,
    borderColor: 'rgba(255,255,255,0.15)',
    color: '#94a3b8',
    fontWeight: 600,
    borderRadius: 2,
    transition: 'all 0.3s ease',
    fontSize: '0.9rem',
    border: '1px solid rgba(255,255,255,0.15)',
    '&:hover': {
      borderColor: 'rgba(124,58,237,0.5)',
      background: 'rgba(124,58,237,0.08)',
      color: '#f8fafc',
    },
  },
  footerText: {
    fontSize: '0.9rem',
    color: '#64748b',
  },
  loginLink: {
    color: '#a78bfa',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'all 0.2s',
    '&:hover': {
      color: '#c4b5fd',
      textDecoration: 'underline',
    },
  },
};

export default Signup;
