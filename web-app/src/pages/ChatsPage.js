import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  TextField,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Send,
  Search,
  Close,
  Chat as ChatIcon,
  LocationOn,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../components/layout/MainLayout';
import { authAPI, chatsAPI, placesAPI, WS_API_URL } from '../services/api';
import useAuthStore from '../store/authStore';
import { useNotify } from '../components/ui/NotificationProvider';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const ChatsPage = () => {
  const { token, user } = useAuthStore();
  const notify = useNotify();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [chatType, setChatType] = useState('direct');
  const [newChatName, setNewChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [chatSearch, setChatSearch] = useState('');
  const [userPlaces, setUserPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [showPlacePicker, setShowPlacePicker] = useState(false);
  const [messageMenuAnchor, setMessageMenuAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const wsRef = useRef(null);
  const listRef = useRef(null);
  const searchTimeout = useRef(null);

  const wsUrl = useMemo(() => {
    if (!selectedChat?.id || !token) return '';
    return `${WS_API_URL}/api/v1/ws/chats/${selectedChat.id}?token=${encodeURIComponent(token)}`;
  }, [selectedChat, token]);

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  const loadChats = useCallback(async () => {
    try {
      const { data } = await chatsAPI.getChats();
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data?.chats && Array.isArray(data.chats)) {
        list = data.chats;
      }
      setChats(list);
      // Use updater function to avoid depending on selectedChat
      setSelectedChat((prev) => prev || (list.length > 0 ? list[0] : null));
    } catch (err) {
      console.error('Failed to load chats:', err);
      notify.error('Failed to load chats');
      setChats([]);
    }
  }, [notify]);

  const loadMessages = useCallback(async (chatId) => {
    if (!chatId) return;
    try {
      const { data } = await chatsAPI.getMessages(chatId, { limit: 200 });
      let list = [];
      if (Array.isArray(data)) {
        list = data.slice().reverse();
      } else if (data?.messages && Array.isArray(data.messages)) {
        list = data.messages.slice().reverse();
      }
      setMessages(list);
      setTimeout(scrollToBottom, 0);
    } catch (err) {
      console.error('Failed to load messages:', err);
      notify.error('Failed to load messages');
      setMessages([]);
    }
  }, [notify]);

  const loadUserPlaces = useCallback(async () => {
    if (!user?.id) return;
    setPlacesLoading(true);
    try {
      const { data } = await placesAPI.getByUser(user.id);
      let places = [];
      if (Array.isArray(data)) {
        places = data;
      } else if (data?.places && Array.isArray(data.places)) {
        places = data.places;
      }
      setUserPlaces(places);
    } catch (err) {
      console.error('Failed to load user places:', err);
      setUserPlaces([]);
    } finally {
      setPlacesLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (selectedChat?.id) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat, loadMessages]);

  useEffect(() => {
    if (!wsUrl) return undefined;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
        setTimeout(scrollToBottom, 0);
      } catch {
        // ignore invalid payload
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setWsConnected(false);
    };
  }, [wsUrl]);

  const handleSend = async () => {
    if (!selectedChat || (!messageText.trim() && !selectedPlace)) return;

    try {
      const payload = { text: messageText.trim() };
      if (selectedPlace) {
        payload.location_name = selectedPlace.name;
        payload.location_lat = selectedPlace.lat;
        payload.location_lng = selectedPlace.lng;
      }
      await chatsAPI.sendMessage(selectedChat.id, payload);
      setMessageText('');
      setSelectedPlace(null);
    } catch (err) {
      console.error(err);
      notify.error('Failed to send message');
    }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;
    try {
      const payload = {
        user_ids: selectedUsers.map((u) => u.id),
        name: chatType === 'group' ? newChatName : null,
      };
      const { data } = await chatsAPI.createChat(payload);
      setChats((prev) => [...prev, data]);
      setSelectedChat(data);
      resetCreateDialog();
      notify.success('Chat created');
    } catch (err) {
      console.error(err);
      notify.error('Failed to create chat');
    }
  };

  const resetCreateDialog = () => {
    setCreateOpen(false);
    setChatType('direct');
    setNewChatName('');
    setSelectedUsers([]);
    setUserQuery('');
    setUserSuggestions([]);
  };

  const handleUserSearch = async (query) => {
    setUserQuery(query);
    if (!query.trim()) {
      setUserSuggestions([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await authAPI.searchUsers(query.trim());
        const users = (data?.users || []).filter(
          (u) => u.id !== user?.id && !selectedUsers.find((su) => su.id === u.id)
        );
        setUserSuggestions(users);
      } catch {
        setUserSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const formatMessageTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredChats = chats.filter((chat) =>
    (chat.name || chat.username || '').toLowerCase().includes(chatSearch.toLowerCase())
  );

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', background: '#030712' }}>
        {/* Sidebar - Chat List */}
        <MotionBox
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          sx={{
            width: { xs: '100%', md: 360 },
            borderRight: { md: '1px solid rgba(255,255,255,0.08)' },
            display: 'flex',
            flexDirection: 'column',
            background: '#030712',
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#fafafa' }}>
                Chats
              </Typography>
              <Tooltip title="New Chat">
                <IconButton
                  onClick={() => setCreateOpen(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Search */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search chats..."
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18, color: '#52525b' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 3,
                },
              }}
            />
          </Box>

          {/* Chat List */}
          <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
            <AnimatePresence>
              {filteredChats.length === 0 ? (
                <MotionBox
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  sx={{ textAlign: 'center', py: 6, px: 2 }}
                >
                  <ChatIcon sx={{ fontSize: 48, color: '#27272a', mb: 2 }} />
                  <Typography sx={{ color: '#52525b', fontSize: '0.9rem', fontWeight: 600 }}>
                    No chats yet
                  </Typography>
                </MotionBox>
              ) : (
                filteredChats.map((chat, idx) => (
                  <MotionBox
                    key={chat.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <ListItemButton
                      onClick={() => setSelectedChat(chat)}
                      selected={selectedChat?.id === chat.id}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 0,
                        borderLeft: selectedChat?.id === chat.id ? '3px solid #7c3aed' : 'none',
                        background:
                          selectedChat?.id === chat.id
                            ? 'rgba(124,58,237,0.1)'
                            : 'transparent',
                        '&:hover': {
                          background: 'rgba(124,58,237,0.08)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Avatar
                        src={chat.avatar}
                        sx={{
                          width: 48,
                          height: 48,
                          mr: 1.5,
                          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                          fontSize: '0.9rem',
                        }}
                      >
                        {(chat.name || chat.username)?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: '#fafafa',
                            fontSize: '0.95rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {chat.name || chat.username}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.8rem',
                            color: '#71717a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {chat.last_message || 'No messages yet'}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  </MotionBox>
                ))
              )}
            </AnimatePresence>
          </List>
        </MotionBox>

        {/* Main Chat Area */}
        {selectedChat ? (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: '#030712',
              position: 'relative',
            }}
          >
            {/* Chat Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(15,15,20,0.5)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  src={selectedChat.avatar}
                  sx={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                  }}
                >
                  {selectedChat.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: '#fafafa', fontSize: '0.95rem' }}>
                    {selectedChat.name || selectedChat.username}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#71717a' }}>
                    {wsConnected ? 'Online' : 'Offline'}
                  </Typography>
                </Box>
               </Box>
             </Box>

            {/* Messages Area */}
            <Box
              ref={listRef}
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                  },
                },
              }}
            >
              {messages.length === 0 ? (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                  }}
                >
                  <ChatIcon sx={{ fontSize: 48, color: '#27272a' }} />
                  <Typography sx={{ color: '#52525b', fontSize: '0.9rem', fontWeight: 600 }}>
                    No messages yet. Start the conversation!
                  </Typography>
                </Box>
              ) : (
                <AnimatePresence>
                  {messages.map((m, idx) => {
                    const isOwn = m.user_id === user?.id;
                    return (
                      <MotionBox
                        key={`${m.id}-${m.created_at}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        sx={{
                          display: 'flex',
                          justifyContent: isOwn ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '60%',
                            display: 'flex',
                            flexDirection: isOwn ? 'row-reverse' : 'row',
                            gap: 1,
                            alignItems: 'flex-end',
                          }}
                        >
                          {!isOwn && (
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                fontSize: '0.75rem',
                              }}
                            >
                              {m.username?.[0]?.toUpperCase()}
                            </Avatar>
                          )}
                          <Box>
                            {!isOwn && (
                              <Typography
                                sx={{
                                  fontSize: '0.7rem',
                                  color: '#a78bfa',
                                  mb: 0.5,
                                  fontWeight: 700,
                                  ml: isOwn ? 'auto' : 0,
                                }}
                              >
                                {m.username}
                              </Typography>
                            )}
                            <Box
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setSelectedMessage(m);
                                setMessageMenuAnchor(e.currentTarget);
                              }}
                              sx={{
                                p: 1.25,
                                borderRadius: 2,
                                background: isOwn
                                  ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
                                  : 'rgba(255,255,255,0.08)',
                                border: isOwn ? 'none' : '1px solid rgba(255,255,255,0.12)',
                                cursor: 'context-menu',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  background: isOwn
                                    ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                                    : 'rgba(255,255,255,0.15)',
                                },
                              }}
                            >
                              {m.text && (
                                <Typography
                                  sx={{
                                    color: '#fafafa',
                                    fontSize: '0.95rem',
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {m.text}
                                </Typography>
                              )}
                              {m.location_name && (
                                <Box
                                  sx={{
                                    mt: m.text ? 1 : 0,
                                    p: 1,
                                    borderRadius: 1.5,
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.75,
                                  }}
                                >
                                  <LocationOn sx={{ fontSize: 16, color: '#10b981' }} />
                                  <Box>
                                    <Typography sx={{ fontSize: '0.8rem', color: '#fafafa', fontWeight: 600 }}>
                                      {m.location_name}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.65rem', color: '#71717a' }}>
                                      {m.location_lat?.toFixed(4)}, {m.location_lng?.toFixed(4)}
                                    </Typography>
                                  </Box>
                                </Box>
                              )}
                              <Typography
                                sx={{
                                  fontSize: '0.65rem',
                                  color: isOwn ? 'rgba(255,255,255,0.6)' : '#71717a',
                                  mt: 0.75,
                                }}
                              >
                                {formatMessageTime(m.created_at)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </MotionBox>
                    );
                  })}
                </AnimatePresence>
              )}
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15,15,20,0.5)' }}>
              {selectedPlace && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <LocationOn sx={{ fontSize: 18, color: '#10b981' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: '#fafafa', fontSize: '0.9rem', fontWeight: 600 }}>
                      {selectedPlace.name}
                    </Typography>
                    <Typography sx={{ color: '#71717a', fontSize: '0.8rem' }}>
                      {selectedPlace.lat?.toFixed(4)}, {selectedPlace.lng?.toFixed(4)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => setSelectedPlace(null)}
                    sx={{ color: '#71717a', '&:hover': { color: '#ef4444' } }}
                  >
                    <Close sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: 'rgba(255,255,255,0.05)',
                    },
                  }}
                />
                <Tooltip title="Select Place">
                  <IconButton
                    onClick={() => {
                      setShowPlacePicker(true);
                      loadUserPlaces();
                    }}
                    sx={{
                      color: selectedPlace ? '#10b981' : '#71717a',
                      '&:hover': { color: '#10b981' },
                    }}
                  >
                    <LocationOn />
                   </IconButton>
                 </Tooltip>
                 <IconButton
                   onClick={handleSend}
                   disabled={!selectedChat || (!messageText.trim() && !selectedPlace)}
                  sx={{
                    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    },
                    '&:disabled': {
                      background: 'rgba(255,255,255,0.1)',
                      color: '#52525b',
                    },
                  }}
                >
                  <Send sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>
          </MotionBox>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <ChatIcon sx={{ fontSize: 64, color: '#27272a' }} />
            <Typography sx={{ color: '#52525b', fontSize: '1rem', fontWeight: 600 }}>
              Select a chat to start messaging
            </Typography>
          </Box>
        )}
      </Box>

      {/* Place Picker Dialog */}
      <Dialog
        open={showPlacePicker}
        onClose={() => setShowPlacePicker(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(3, 7, 18, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#fafafa', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          Select a Place to Share
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {placesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : userPlaces.length === 0 ? (
            <Typography sx={{ color: '#71717a', textAlign: 'center', py: 3 }}>
              No places created yet
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {userPlaces.map((place) => (
                <Box
                  key={place.id}
                  onClick={() => {
                    setSelectedPlace({
                      name: place.name,
                      lat: place.lat,
                      lng: place.lng,
                    });
                    setShowPlacePicker(false);
                  }}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: 'rgba(124,58,237,0.1)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(124,58,237,0.2)',
                      borderColor: 'rgba(124,58,237,0.4)',
                    },
                  }}
                >
                  <Typography sx={{ color: '#fafafa', fontWeight: 600, fontSize: '0.95rem' }}>
                    {place.name}
                  </Typography>
                  <Typography sx={{ color: '#71717a', fontSize: '0.8rem' }}>
                    {place.description || 'No description'}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Button onClick={() => setShowPlacePicker(false)} sx={{ color: '#71717a' }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Chat Dialog */}
      <Dialog
        open={createOpen}
        onClose={resetCreateDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(3, 7, 18, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#fafafa', fontWeight: 700 }}>
          New {chatType === 'direct' ? 'Chat' : 'Group'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {['direct', 'group'].map((type) => (
              <Button
                key={type}
                variant={chatType === type ? 'contained' : 'outlined'}
                onClick={() => setChatType(type)}
                sx={{
                  flex: 1,
                  textTransform: 'capitalize',
                }}
              >
                {type === 'direct' ? 'Direct' : 'Group'}
              </Button>
            ))}
          </Box>

          {chatType === 'group' && (
            <TextField
              fullWidth
              label="Group Name"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}

          <TextField
            fullWidth
            placeholder="Search users..."
            value={userQuery}
            onChange={(e) => handleUserSearch(e.target.value)}
            sx={{ mb: 2 }}
          />

          {selectedUsers.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {selectedUsers.map((u) => (
                <Chip
                  key={u.id}
                  label={u.username}
                  onDelete={() => setSelectedUsers((prev) => prev.filter((su) => su.id !== u.id))}
                />
              ))}
            </Box>
          )}

          {userSuggestions.map((u) => (
            <Box
              key={u.id}
              onClick={() => {
                setSelectedUsers((prev) => [...prev, u]);
                setUserQuery('');
                setUserSuggestions([]);
              }}
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.05)',
                cursor: 'pointer',
                mb: 1,
                '&:hover': { background: 'rgba(124,58,237,0.15)' },
              }}
            >
              <Typography sx={{ color: '#fafafa', fontWeight: 600 }}>{u.username}</Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Button onClick={resetCreateDialog} sx={{ color: '#71717a' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateChat}
            variant="contained"
            disabled={selectedUsers.length === 0}
            sx={{
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default ChatsPage;
