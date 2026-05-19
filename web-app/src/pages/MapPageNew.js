import React from 'react';
import { Box } from '@mui/material';
import MainLayout from '../components/layout/MainLayout';

const MapPage = () => {
  return (
    <MainLayout>
      <Box
        sx={{
          height: 'calc(100vh - 64px)',
          width: '100%',
          background: '#09090b',
          position: 'relative',
        }}
      >
        {/* Map Content - TODO: Import actual map components */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#18181b',
          }}
        >
          <div style={{ color: '#71717a', fontSize: '1.2rem' }}>
            Map view will be rendered here
          </div>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default MapPage;
