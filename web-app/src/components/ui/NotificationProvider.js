import React, { createContext, useContext, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [state, setState] = useState({ open: false, message: '', severity: 'info' });

  const notify = (message, severity = 'info') => {
    setState({ open: true, message, severity });
  };

  const value = useMemo(
    () => ({
      success: (msg) => notify(msg, 'success'),
      error: (msg) => notify(msg, 'error'),
      info: (msg) => notify(msg, 'info'),
      warning: (msg) => notify(msg, 'warning'),
    }),
    []
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={2600}
        onClose={() => setState((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setState((prev) => ({ ...prev, open: false }))}
          severity={state.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotify = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      success: () => {},
      error: () => {},
      info: () => {},
      warning: () => {},
    };
  }
  return ctx;
};
