import React from 'react';
import { Box, Button, Typography } from '@mui/material';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('AppErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            p: 3,
            textAlign: 'center',
            bgcolor: '#09090b',
          }}
        >
          <Typography sx={{ color: '#f8fafc', fontWeight: 900, fontSize: '1.6rem', mb: 1 }}>
            Something went wrong
          </Typography>
          <Typography sx={{ color: '#94a3b8', mb: 2 }}>Try refreshing the page.</Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
