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
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, LocationOn, People, RocketLaunch, CheckCircle } from '@mui/icons-material';
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

// Floating particles component
const FloatingParticles = () => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((p) => (
        <Box
          key={p.id}
          sx={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: 'rgba(236, 72, 153, 0.4)',
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `floatParticle${p.id % 3} ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            boxShadow: '0 0 10px rgba(236, 72, 153, 0.3)',
            '@keyframes floatParticle0': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: 0.6 },
              '50%': { transform: 'translate(30px, -40px) scale(1.2)', opacity: 1 },
            },
            '@keyframes floatParticle1': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: 0.5 },
              '50%': { transform: 'translate(-25px, 35px) scale(0.8)', opacity: 0.9 },
            },
            '@keyframes floatParticle2': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1.1)', opacity: 0.7 },
              '50%': { transform: 'translate(20px, 25px) scale(0.9)', opacity: 1 },
            },
          }}
        />
      ))}
    </Box>
  );
};

// Animated background orbs
const GlowOrbs = () => (
  <>
    <Box
      sx={{
        position: 'absolute',
        width: { xs: 300, md: 500 },
        height: { xs: 300, md: 500 },
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, rgba(236,72,153,0.05) 40%, transparent 70%)',
        top: '-10%',
        right: '-10%',
        filter: 'blur(40px)',
        animation: 'orbFloat1 15s ease-in-out infinite',
        '@keyframes orbFloat1': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-50px, 30px) scale(1.1)' },
          '66%': { transform: 'translate(20px, 50px) scale(0.95)' },
        },
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        width: { xs: 350, md: 600 },
        height: { xs: 350, md: 600 },
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, rgba(124,58,237,0.05) 40%, transparent 70%)',
        bottom: '-15%',
        left: '-15%',
        filter: 'blur(50px)',
        animation: 'orbFloat2 18s ease-in-out infinite',
        '@keyframes orbFloat2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(40px, -30px) scale(1.05)' },
          '66%': { transform: 'translate(-30px, -50px) scale(1.1)' },
        },
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        width: { xs: 200, md: 400 },
        height: { xs: 200, md: 400 },
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 60%)',
        top: '40%',
        left: '20%',
        filter: 'blur(60px)',
        animation: 'orbFloat3 20s ease-in-out infinite',
        '@keyframes orbFloat3': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(60px, -40px)' },
        },
      }}
    />
  </>
);

// Animated grid
const AnimatedGrid = () => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      opacity: 0.03,
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
      `,
      backgroundSize: '80px 80px',
      maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
    }}
  />
);

// Feature card
const FeatureCard = ({ icon, title, description, delay }) => (
  <MotionBox
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    sx={{
      display: 'flex',
      gap: 2,
      p: 2,
      borderRadius: 3,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(236,72,153,0.3)',
        transform: 'translateX(8px)',
      },
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: 2.5,
        background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(124,58,237,0.2))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography sx={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.95rem', mb: 0.3 }}>
        {title}
      </Typography>
      <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5 }}>
        {description}
      </Typography>
    </Box>
  </MotionBox>
);

// Password requirement indicator
const PasswordRequirement = ({ met, text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <CheckCircle
      sx={{
        fontSize: 14,
        color: met ? '#10b981' : '#475569',
        transition: 'color 0.3s ease',
      }}
    />
    <Typography
      sx={{
        fontSize: '0.75rem',
        color: met ? '#94a3b8' : '#475569',
        transition: 'color 0.3s ease',
      }}
    >
      {text}
    </Typography>
  </Box>
);

const Signup = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const strength = getStrength(form.password);
  const mismatch = form.confirm.length > 0 && form.password !== form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.register({ username: form.username, email: form.email, password: form.password });
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={styles.root}>
      {/* Background elements */}
      <Box sx={styles.bgContainer}>
        <GlowOrbs />
        <AnimatedGrid />
        <FloatingParticles />
      </Box>

      {/* Main content */}
      <Box sx={styles.container}>
        {/* Left side - Hero section */}
        <MotionBox
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          sx={styles.heroSection}
        >
          {/* Logo */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={styles.logoContainer}
          >
            <Box sx={styles.logoIcon}>
              <LocationOn sx={{ fontSize: 28, color: '#fff' }} />
            </Box>
            <Typography sx={styles.logoText}>Mapped</Typography>
          </MotionBox>

          {/* Hero content */}
          <Box sx={{ mt: 6 }}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Typography sx={styles.badge}>
                <RocketLaunch sx={{ fontSize: 14 }} />
                Start Your Journey
              </Typography>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Typography sx={styles.heroTitle}>
                Join the
                <br />
                <Box component="span" sx={styles.gradientText}>explorer community.</Box>
                <br />
                Share your world.
              </Typography>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Typography sx={styles.heroSubtitle}>
                Create your profile and start mapping your adventures.
                Connect with travelers, discover hidden gems, and build your story.
              </Typography>
            </MotionBox>
          </Box>

          {/* Feature cards */}
          <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FeatureCard
              icon={<People sx={{ color: '#f472b6' }} />}
              title="Join the Community"
              description="Connect with 12K+ explorers sharing their unique perspectives"
              delay={0.6}
            />
            <FeatureCard
              icon={<RocketLaunch sx={{ color: '#a78bfa' }} />}
              title="Start Your Map"
              description="Create your personal collection of places and memories"
              delay={0.7}
            />
          </Box>

          {/* Testimonial */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            sx={styles.testimonial}
          >
            <Typography sx={styles.testimonialText}>
              "Mapped changed how I explore cities. Now every trip becomes a shared adventure."
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ec4899, #7c3aed)',
                }}
              />
              <Box>
                <Typography sx={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.85rem' }}>
                  Sarah Chen
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                  Travel Blogger
                </Typography>
              </Box>
            </Box>
          </MotionBox>
        </MotionBox>

        {/* Right side - Signup form */}
        <MotionBox
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          sx={styles.formSection}
        >
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            sx={styles.card}
          >
            {/* Card glow effect */}
            <Box sx={styles.cardGlow} />

            {/* Form header */}
            <Box sx={{ mb: 3.5, textAlign: 'center' }}>
              <Typography sx={styles.formTitle}>Create account</Typography>
              <Typography sx={styles.formSubtitle}>
                Join thousands of explorers worldwide
              </Typography>
            </Box>

            {/* Error alert */}
            <AnimatePresence>
              {error && (
                <MotionBox
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2.5,
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      '& .MuiAlert-icon': { color: '#f87171' },
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
              <Box sx={styles.inputWrapper(focused === 'username')}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused(null)}
                  required
                  autoComplete="username"
                  inputProps={{ minLength: 3 }}
                  sx={styles.textField}
                />
              </Box>

              <Box sx={styles.inputWrapper(focused === 'email')}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  required
                  autoComplete="email"
                  sx={styles.textField}
                />
              </Box>

              <Box>
                <Box sx={styles.inputWrapper(focused === 'password')}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
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
                            sx={{
                              color: '#64748b',
                              transition: 'all 0.2s',
                              '&:hover': { color: '#f472b6', background: 'rgba(244,114,182,0.1)' },
                            }}
                          >
                            {showPwd ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                
                {/* Password strength indicator */}
                <AnimatePresence>
                  {form.password.length > 0 && (
                    <MotionBox
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      sx={{ mt: 1.5 }}
                    >
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                        {[1, 2, 3, 4].map((level) => (
                          <Box
                            key={level}
                            sx={{
                              flex: 1,
                              height: 3,
                              borderRadius: 99,
                              background: strength >= level ? strengthColors[strength] : 'rgba(255,255,255,0.1)',
                              transition: 'all 0.3s ease',
                            }}
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: strengthColors[strength] || '#475569',
                            transition: 'color 0.3s ease',
                          }}
                        >
                          {strengthLabels[strength] || 'Enter password'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <PasswordRequirement met={form.password.length >= 8} text="8+ chars" />
                          <PasswordRequirement met={/[A-Z]/.test(form.password)} text="Uppercase" />
                        </Box>
                      </Box>
                    </MotionBox>
                  )}
                </AnimatePresence>
              </Box>

              <Box sx={styles.inputWrapper(focused === 'confirm')}>
                <TextField
                  fullWidth
                  label="Confirm password"
                  name="confirm"
                  type={showPwd ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={handleChange}
                  onFocus={() => setFocused('confirm')}
                  onBlur={() => setFocused(null)}
                  required
                  autoComplete="new-password"
                  error={mismatch}
                  helperText={mismatch ? 'Passwords do not match' : ''}
                  sx={styles.textField}
                />
              </Box>

              {/* Submit button */}
              <MotionBox
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={styles.submitButton}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Create account'
                  )}
                </Button>
              </MotionBox>

              {/* Terms */}
              <Typography sx={styles.terms}>
                By creating an account, you agree to our{' '}
                <Link href="#" sx={styles.termsLink}>Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" sx={styles.termsLink}>Privacy Policy</Link>
              </Typography>
            </Box>

            {/* Footer */}
            <Typography sx={styles.footer}>
              Already have an account?{' '}
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/login')}
                sx={styles.footerLink}
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
    background: '#030712',
    position: 'relative',
    overflow: 'hidden',
  },
  bgContainer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  container: {
    position: 'relative',
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
    maxWidth: 1400,
    mx: 'auto',
    px: { xs: 2, md: 4, lg: 6 },
  },
  heroSection: {
    display: { xs: 'none', lg: 'flex' },
    flexDirection: 'column',
    justifyContent: 'center',
    py: 6,
    pr: 6,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 3,
    background: 'linear-gradient(135deg, #ec4899 0%, #7c3aed 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(236,72,153,0.4)',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #f472b6 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    px: 2,
    py: 0.75,
    borderRadius: 99,
    background: 'rgba(236,72,153,0.15)',
    border: '1px solid rgba(236,72,153,0.3)',
    color: '#f472b6',
    fontSize: '0.8rem',
    fontWeight: 600,
    mb: 3,
  },
  heroTitle: {
    fontSize: { md: '2.5rem', lg: '3rem' },
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    color: '#f8fafc',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #f472b6 0%, #a78bfa 50%, #38bdf8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    mt: 3,
    fontSize: '1.1rem',
    lineHeight: 1.7,
    color: '#94a3b8',
    maxWidth: 450,
  },
  testimonial: {
    mt: 6,
    pt: 4,
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  testimonialText: {
    fontSize: '1rem',
    fontStyle: 'italic',
    color: '#cbd5e1',
    lineHeight: 1.6,
  },
  formSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    py: { xs: 4, lg: 6 },
    px: { xs: 0, lg: 4 },
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: 440,
    background: 'rgba(15,23,42,0.6)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.08)',
    p: { xs: 3, sm: 4 },
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80%',
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(236,72,153,0.5), rgba(124,58,237,0.5), transparent)',
  },
  formTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#f8fafc',
    letterSpacing: '-0.02em',
  },
  formSubtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    mt: 1,
  },
  inputWrapper: (isFocused) => ({
    position: 'relative',
    borderRadius: 2,
    transition: 'all 0.3s ease',
    ...(isFocused && {
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: -1,
        borderRadius: 3,
        padding: 1,
        background: 'linear-gradient(135deg, #ec4899, #7c3aed)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        opacity: 0.5,
      },
    }),
  }),
  textField: {
    '& .MuiOutlinedInput-root': {
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 2,
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'rgba(255,255,255,0.05)',
      },
      '&.Mui-focused': {
        background: 'rgba(236,72,153,0.05)',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255,255,255,0.1)',
        transition: 'border-color 0.3s ease',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(236,72,153,0.3)',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#ec4899',
        borderWidth: 1,
      },
    },
    '& .MuiInputBase-input': {
      color: '#f8fafc',
      '&::placeholder': {
        color: '#64748b',
        opacity: 1,
      },
    },
    '& .MuiInputLabel-root': {
      color: '#64748b',
      '&.Mui-focused': {
        color: '#f472b6',
      },
    },
  },
  submitButton: {
    mt: 1,
    py: 1.75,
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: 2,
    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 50%, #7c3aed 100%)',
    backgroundSize: '200% 200%',
    animation: 'gradientShift 3s ease infinite',
    boxShadow: '0 8px 32px rgba(236,72,153,0.3)',
    transition: 'all 0.3s ease',
    '@keyframes gradientShift': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
    '&:hover': {
      boxShadow: '0 12px 40px rgba(236,72,153,0.4)',
    },
    '&:disabled': {
      background: 'rgba(236,72,153,0.3)',
    },
  },
  terms: {
    fontSize: '0.75rem',
    color: '#64748b',
    textAlign: 'center',
    mt: 1,
  },
  termsLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    '&:hover': {
      color: '#f472b6',
      textDecoration: 'underline',
    },
  },
  footer: {
    mt: 3,
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#64748b',
  },
  footerLink: {
    color: '#f472b6',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'all 0.2s',
    '&:hover': {
      color: '#f9a8d4',
      textDecoration: 'underline',
    },
  },
};

export default Signup;
