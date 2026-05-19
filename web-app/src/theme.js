import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c3aed',
      light: '#a78bfa',
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec4899',
      light: '#f472b6',
      dark: '#db2777',
      contrastText: '#ffffff',
    },
    background: {
      default: '#030712',
      paper: '#0f172a',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      disabled: '#475569',
    },
    divider: 'rgba(255,255,255,0.06)',
    success: { main: '#10b981', light: '#34d399', dark: '#059669' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    error:   { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
    info:    { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
  },

  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 },
    h2: { fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15 },
    h3: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
    h4: { fontSize: '1.375rem', fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.25 },
    h5: { fontSize: '1.125rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontSize: '1rem', fontWeight: 600 },
    subtitle1: { fontSize: '1rem', fontWeight: 500, letterSpacing: '-0.005em' },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
    body1:     { fontSize: '0.9375rem', lineHeight: 1.65, letterSpacing: '-0.01em' },
    body2:     { fontSize: '0.8125rem', lineHeight: 1.6 },
    caption:   { fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.01em' },
    overline:  { fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' },
    button:    { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },

  shape: { borderRadius: 12 },

  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.5)',
    '0 2px 6px rgba(0,0,0,0.5)',
    '0 4px 12px rgba(0,0,0,0.5)',
    '0 6px 16px rgba(0,0,0,0.5)',
    '0 8px 24px rgba(0,0,0,0.5)',
    '0 12px 32px rgba(0,0,0,0.5)',
    '0 16px 40px rgba(0,0,0,0.55)',
    '0 20px 48px rgba(0,0,0,0.6)',
    '0 24px 56px rgba(0,0,0,0.6)',
    '0 28px 64px rgba(0,0,0,0.65)',
    '0 32px 72px rgba(0,0,0,0.65)',
    '0 36px 80px rgba(0,0,0,0.7)',
    '0 40px 88px rgba(0,0,0,0.7)',
    '0 44px 96px rgba(0,0,0,0.75)',
    '0 48px 104px rgba(0,0,0,0.75)',
    '0 52px 112px rgba(0,0,0,0.8)',
    '0 56px 120px rgba(0,0,0,0.8)',
    '0 60px 128px rgba(0,0,0,0.85)',
    '0 64px 136px rgba(0,0,0,0.85)',
    '0 68px 144px rgba(0,0,0,0.9)',
    '0 72px 152px rgba(0,0,0,0.9)',
    '0 76px 160px rgba(0,0,0,0.95)',
    '0 80px 168px rgba(0,0,0,0.95)',
    '0 84px 176px rgba(0,0,0,1)',
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        html: { 
          scrollBehavior: 'smooth',
          fontSize: '16px',
        },
        body: {
          background: '#030712',
          color: '#f8fafc',
          scrollbarWidth: 'thin',
          scrollbarColor: '#1e293b transparent',
          '::-webkit-scrollbar': { width: 8, height: 8 },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': {
            background: '#1e293b',
            borderRadius: 99,
            '&:hover': { background: '#334155' },
          },
          '::selection': { 
            background: 'rgba(124,58,237,0.4)',
            color: '#f8fafc',
          },
        },
        ':focus-visible': { 
          outline: '2px solid #7c3aed', 
          outlineOffset: 2,
        },
        'input:-webkit-autofill': {
          '-webkit-box-shadow': '0 0 0 100px #0f172a inset !important',
          '-webkit-text-fill-color': '#f8fafc !important',
        },
        // Leaflet dark theme popup styling
        '.leaflet-popup-content-wrapper': {
          background: 'rgba(15,15,20,0.98) !important',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(124,58,237,0.25) !important',
          borderRadius: '16px !important',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(124,58,237,0.1) !important',
          color: '#f8fafc !important',
          padding: '0 !important',
        },
        '.leaflet-popup-content': {
          margin: '0 !important',
          color: '#f8fafc !important',
          fontSize: '0.9rem',
          lineHeight: 1.5,
          '& p': {
            margin: '0 !important',
            color: '#f8fafc !important',
          },
        },
        '.leaflet-popup-tip-container': {
          marginTop: '-1px',
        },
        '.leaflet-popup-tip': {
          background: 'rgba(15,15,20,0.98) !important',
          border: '1px solid rgba(124,58,237,0.25) !important',
          borderTop: 'none !important',
          borderLeft: 'none !important',
          boxShadow: '0 8px 16px rgba(0,0,0,0.4) !important',
        },
        '.leaflet-popup-close-button': {
          color: '#71717a !important',
          fontSize: '20px !important',
          fontWeight: '400 !important',
          width: '28px !important',
          height: '28px !important',
          padding: '0 !important',
          top: '8px !important',
          right: '8px !important',
          display: 'flex !important',
          alignItems: 'center !important',
          justifyContent: 'center !important',
          borderRadius: '8px !important',
          transition: 'all 0.2s ease !important',
          '&:hover': {
            color: '#fafafa !important',
            background: 'rgba(255,255,255,0.1) !important',
          },
        },
        // Leaflet container styling
        '.leaflet-container': {
          background: '#09090b !important',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important',
        },
        // Leaflet control styling
        '.leaflet-control-zoom': {
          border: 'none !important',
          borderRadius: '12px !important',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4) !important',
        },
        '.leaflet-control-zoom a': {
          background: 'rgba(15,15,20,0.95) !important',
          color: '#a78bfa !important',
          border: 'none !important',
          borderBottom: '1px solid rgba(255,255,255,0.08) !important',
          width: '36px !important',
          height: '36px !important',
          lineHeight: '36px !important',
          fontSize: '18px !important',
          transition: 'all 0.2s ease !important',
          '&:hover': {
            background: 'rgba(124,58,237,0.2) !important',
            color: '#c4b5fd !important',
          },
          '&:last-child': {
            borderBottom: 'none !important',
          },
        },
        '.leaflet-control-attribution': {
          background: 'rgba(9,9,11,0.85) !important',
          backdropFilter: 'blur(8px)',
          color: '#52525b !important',
          fontSize: '10px !important',
          padding: '4px 8px !important',
          borderRadius: '8px 0 0 0 !important',
          '& a': {
            color: '#7c3aed !important',
          },
        },
        // Leaflet marker cluster styling (if used)
        '.marker-cluster': {
          background: 'rgba(124,58,237,0.3) !important',
          '& div': {
            background: 'linear-gradient(135deg, #7c3aed, #ec4899) !important',
            color: '#fff !important',
            fontWeight: '700 !important',
          },
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '0.9rem',
          fontWeight: 600,
          transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
          '&:hover': { transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
          boxShadow: '0 4px 16px rgba(124,58,237,0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
            boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
          boxShadow: '0 4px 16px rgba(236,72,153,0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
            boxShadow: '0 8px 24px rgba(236,72,153,0.35)',
          },
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.12)',
          '&:hover': {
            borderColor: 'rgba(124,58,237,0.5)',
            background: 'rgba(124,58,237,0.08)',
          },
        },
        text: {
          padding: '8px 16px',
          '&:hover': {
            background: 'rgba(255,255,255,0.05)',
          },
        },
        sizeSmall: { padding: '8px 16px', fontSize: '0.8125rem', borderRadius: 10 },
        sizeLarge: { padding: '14px 32px', fontSize: '1rem', borderRadius: 14 },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          borderRadius: 12,
          '&:hover': { 
            background: 'rgba(255,255,255,0.06)', 
            transform: 'scale(1.05)',
          },
        },
      },
    },

    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: 'rgba(15,23,42,0.8)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'rgba(124,58,237,0.2)',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 12,
            transition: 'all 0.2s ease',
            '&:hover': { 
              background: 'rgba(255,255,255,0.05)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': { 
              borderColor: 'rgba(124,58,237,0.3)',
            },
            '&.Mui-focused': {
              background: 'rgba(124,58,237,0.05)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#7c3aed',
              borderWidth: 1,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#64748b',
            fontSize: '0.95rem',
            transform: 'translate(14px, 14px) scale(1)',
            '&.MuiInputLabel-shrink': {
              transform: 'translate(14px, -9px) scale(0.75)',
              color: '#94a3b8',
            },
            '&.Mui-focused': { 
              color: '#a78bfa',
            },
          },
          '& .MuiInputBase-input': {
            color: '#f8fafc',
            fontSize: '0.95rem',
            '&::placeholder': { 
              color: '#475569', 
              opacity: 1,
            },
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        input: { padding: '14px 16px' },
        multiline: { padding: '14px 16px' },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          background: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          minWidth: 200,
          marginTop: 8,
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '4px 8px',
          padding: '10px 14px',
          fontSize: '0.9rem',
          fontWeight: 500,
          transition: 'all 0.15s ease',
          '&:hover': { background: 'rgba(124,58,237,0.1)' },
          '&.Mui-selected': { 
            background: 'rgba(124,58,237,0.15)', 
            '&:hover': { background: 'rgba(124,58,237,0.2)' },
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.8rem',
          borderRadius: 10,
          height: 28,
          transition: 'all 0.2s ease',
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.1)',
          '&:hover': { 
            borderColor: 'rgba(124,58,237,0.5)', 
            background: 'rgba(124,58,237,0.08)',
          },
        },
        filled: { 
          background: 'rgba(124,58,237,0.15)',
          '&:hover': { background: 'rgba(124,58,237,0.25)' },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 44 },
        indicator: {
          height: 2,
          borderRadius: 99,
          background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9rem',
          minHeight: 44,
          padding: '12px 20px',
          color: '#64748b',
          transition: 'color 0.2s ease',
          '&.Mui-selected': { color: '#f8fafc', fontWeight: 600 },
          '&:hover': { color: '#94a3b8' },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgba(15,23,42,0.98)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          boxShadow: '0 48px 100px rgba(0,0,0,0.8)',
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.125rem',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          padding: '24px 28px 16px',
        },
      },
    },

    MuiDialogContent: { 
      styleOverrides: { 
        root: { padding: '16px 28px 20px' },
      },
    },
    
    MuiDialogActions: { 
      styleOverrides: { 
        root: { padding: '16px 28px 24px', gap: 12 },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(15,23,42,0.98)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          fontWeight: 700,
          fontSize: '0.9rem',
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: 'rgba(15,23,42,0.98)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          fontSize: '0.8125rem',
          fontWeight: 500,
          padding: '8px 14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        },
        arrow: { color: 'rgba(15,23,42,0.98)' },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid',
          fontWeight: 500,
          fontSize: '0.875rem',
          alignItems: 'center',
        },
        standardError:   { background: 'rgba(239,68,68,0.1)',  borderColor: 'rgba(239,68,68,0.25)',  color: '#fca5a5' },
        standardSuccess: { background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)', color: '#6ee7b7' },
        standardWarning: { background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.25)', color: '#fcd34d' },
        standardInfo:    { background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.25)', color: '#a5b4fc' },
      },
    },

    MuiSlider: {
      styleOverrides: {
        rail: { background: 'rgba(255,255,255,0.1)', height: 4 },
        track: { 
          background: 'linear-gradient(90deg, #7c3aed, #ec4899)', 
          border: 'none', 
          borderRadius: 99,
          height: 4,
        },
        thumb: {
          width: 18,
          height: 18,
          background: '#f8fafc',
          border: '3px solid #7c3aed',
          '&:hover, &.Mui-active': { 
            boxShadow: '0 0 0 8px rgba(124,58,237,0.16)',
          },
        },
      },
    },

    MuiSnackbar: { 
      defaultProps: { 
        anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
      },
    },

    MuiDivider: { 
      styleOverrides: { 
        root: { borderColor: 'rgba(255,255,255,0.06)' },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 0',
          transition: 'all 0.15s ease',
          '&:hover': { background: 'rgba(255,255,255,0.05)' },
          '&.Mui-selected': { 
            background: 'rgba(124,58,237,0.12)', 
            '&:hover': { background: 'rgba(124,58,237,0.18)' },
          },
        },
      },
    },

    MuiCircularProgress: {
      defaultProps: { size: 24 },
      styleOverrides: { 
        colorPrimary: { color: '#a78bfa' },
      },
    },

    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          transition: 'all 0.2s ease',
          '&:hover': { 
            transform: 'scale(1.05)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          },
          '&:active': { transform: 'scale(0.97)' },
        },
        primary: {
          background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
          '&:hover': { background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' },
        },
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge: { 
          fontWeight: 700, 
          fontSize: '0.7rem', 
          height: 20, 
          minWidth: 20,
          borderRadius: 10,
        },
        colorPrimary: { 
          background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
        },
        colorSecondary: { 
          background: 'linear-gradient(135deg, #ec4899, #db2777)',
        },
        colorError: {
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { 
          borderRadius: 99, 
          background: 'rgba(255,255,255,0.08)',
          height: 4,
        },
        bar: {
          borderRadius: 99,
          background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
        },
      },
    },

    MuiSkeleton: {
      styleOverrides: {
        root: { 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: 10,
        },
      },
    },

    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 48,
          height: 28,
          padding: 0,
        },
        switchBase: {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            '& + .MuiSwitch-track': {
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              opacity: 1,
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
          background: '#f8fafc',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        },
        track: {
          borderRadius: 14,
          background: 'rgba(255,255,255,0.1)',
          opacity: 1,
        },
      },
    },
  },
});

export default theme;
