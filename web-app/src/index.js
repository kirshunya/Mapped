import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AppErrorBoundary from './components/ui/AppErrorBoundary';
import { NotificationProvider } from './components/ui/NotificationProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppErrorBoundary>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
