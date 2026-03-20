import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MainMap from './pages/MapPage';
import ModerationPage from './pages/ModerationPage';
import ProfilePage from './pages/ProfilePage';
import GroupsPage from './pages/GroupsPage';
import FeedPage from './pages/FeedPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ChatsPage from './pages/ChatsPage';
import PlaceDetailPage from './pages/PlaceDetailPage';

const Protected = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const ModeratorOnly = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'moderator' && user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/moderation" element={<ModeratorOnly><ModerationPage /></ModeratorOnly>} />
        <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
        <Route path="/groups" element={<Protected><GroupsPage /></Protected>} />
        <Route path="/feed" element={<Protected><FeedPage /></Protected>} />
        <Route path="/recommendations" element={<Protected><RecommendationsPage /></Protected>} />
        <Route path="/places/:id" element={<Protected><PlaceDetailPage /></Protected>} />
        <Route path="/chats" element={<Protected><ChatsPage /></Protected>} />
        <Route path="/*" element={<Protected><MainMap /></Protected>} />
      </Routes>
    </Router>
  </ThemeProvider>
);

export default App;
