import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  AvatarGroup,
  TextField,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tabs,
  Tab,
  InputAdornment,
  Tooltip,
  Badge,
  Divider,
} from '@mui/material';
import {
  Add,
  Send,
  Search,
  Close,
  Group,
  Person,
  Chat as ChatIcon,
  Circle,
  GroupAdd,
  ArrowBack,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../components/layout/MainLayout';
import { authAPI, chatsAPI, WS_API_URL } from '../services/api';
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
  const [createOpen, setCreateOpen] = useState(false);
  const [chatType, setChatType] = useState('direct'); // 'direct' or 'group'
  const [newChatName, setNewChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [chatSearch, setChatSearch] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const wsRef = useRef(null);
  const listRef = useRef(null);
  const searchTimeout = useRef(null);

  const wsUrl = useMemo(() => {
    if (!selectedChat?.id || !token) {
      return '';
    }
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
      const list = data?.chats || [];
      setChats(list);
      if (!selectedChat && list.length > 0) {
        setSelectedChat(list[0]);
      }
    } catch (err) {
      console.error(err);
      notify.error('Failed to load chats');
    }
  }, [selectedChat, notify]);

  const loadMessages = useCallback(async (chatId) => {
    if (!chatId) {
      return;
    }
    try {
      const { data } = await chatsAPI.getMessages(chatId, { limit: 200 });
      const list = (data?.messages || []).slice().reverse();
      setMessages(list);
      setTimeout(scrollToBottom, 0);
    } catch (err) {
      console.error(err);
      notify.error('Failed to load messages');
    }
  }, [notify]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (selectedChat?.id) {
      loadMessages(selectedChat.id);
      setMobileShowChat(true);
    }
  }, [selectedChat, loadMessages]);

  useEffect(() => {
    if (!wsUrl) {
      return undefined;
    }

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
    if (!selectedChat || !messageText.trim()) {
      return;
    }
    try {
      await chatsAPI.sendMessage(selectedChat.id, { text: messageText.trim() });
      setMessageText('');
    } catch (err) {
      console.error(err);
      notify.error('Failed to send message');
    }
  };

  const handleUserSearch = async (query) => {
    setUserQuery(query);
    if (!query.trim()) {
      setUserSuggestions([]);
      return;
    }
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await authAPI.searchUsers(query.trim());
        const users = (data?.users || []).filter(
          u => u.id !== user?.id && !selectedUsers.find(su => su.id === u.id)
        );
        setUserSuggestions(users);
      } catch {
        setUserSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const handleSelectUser = (u) => {
    if (chatType === 'direct') {
      setSelectedUsers([u]);
    } else {
      setSelectedUsers(prev => [...prev, u]);
    }
    setUserQuery('');
    setUserSuggestions([]);
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      notify.error('Please select at least one user');
      return;
    }

    try {
      const payload = {
        name: chatType === 'group' 
          ? (newChatName || `Group with ${selectedUsers.map(u => u.username).join(', ')}`)
          : (newChatName || `Chat with ${selectedUsers[0]?.username}`),
        type: chatType,
        // For direct messages, we send the other user's ID in user2_id
        // The backend will add the current user (from X-User-ID header) automatically
        user2_id: selectedUsers[0]?.id || 0,
        user2_username: selectedUsers[0]?.username || '',
      };
      
      await chatsAPI.createChat(payload);
      resetCreateDialog();
      await loadChats();
      notify.success('Chat created successfully');
    } catch (err) {
      console.error(err);
      notify.error('Failed to create chat');
    }
  };

  const resetCreateDialog = () => {
    setCreateOpen(false);
    setNewChatName('');
    setSelectedUsers([]);
    setUserQuery('');
    setUserSuggestions([]);
    setChatType('direct');
  };

  const filteredChats = chats.filter(chat => 
    !chatSearch || 
    chat.name?.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const getChatAvatar = (chat) => {
    if (chat.type === 'group') {
      return <Group sx={{ fontSize: 20 }} />;
    }
    return chat.name?.[0]?.toUpperCase() || 'C';
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <MainLayout>
      <Box sx={{ height: 'calc(100vh - 64px)', p: { xs: 1, sm: 2, md: 2.5 } }}>
        <Box
          sx={{
            height: '100%',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '340px 1fr' },
            gap: 2,
          }}
        >
          {/* Chat List Panel */}
          <MotionPaper
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            sx={{
              borderRadius: 4,
              border: '1px solid rgba(124,58,237,0.15)',
              background: 'linear-gradient(180deg, rgba(15,15,20,0.95) 0%, rgba(9,9,11,0.98) 100%)',
              backdropFilter: 'blur(24px)',
              overflow: 'hidden',
              display: { xs: mobileShowChat ? 'none' : 'flex', md: 'flex' },
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <Box sx={{ 
              p: 2.5, 
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(124,58,237,0.03)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: 2.5,
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.2))',
                    border: '1px solid rgba(124,58,237,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ChatIcon sx={{ fontSize: 20, color: '#a78bfa' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: '#fafafa', fontSize: '1.1rem' }}>
                      Messages
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#71717a' }}>
                      {chats.length} conversation{chats.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Box>
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
                      transition: 'all 0.2s ease',
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
                placeholder="Search conversations..."
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 18, color: '#52525b' }} />
                    </InputAdornment>
                  ),
                  endAdornment: chatSearch && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setChatSearch('')}>
                        <Close sx={{ fontSize: 16, color: '#52525b' }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 2.5,
                  }
                }}
              />
            </Box>

            {/* Chat List */}
            <List sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1 }}>
              <AnimatePresence>
                {filteredChats.length === 0 ? (
                  <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    sx={{ textAlign: 'center', py: 6 }}
                  >
                    <ChatIcon sx={{ fontSize: 48, color: '#27272a', mb: 2 }} />
                    <Typography sx={{ color: '#52525b', fontSize: '0.9rem', fontWeight: 600 }}>
                      No conversations yet
                    </Typography>
                    <Typography sx={{ color: '#3f3f46', fontSize: '0.8rem', mt: 0.5 }}>
                      Start a new chat to begin messaging
                    </Typography>
                  </MotionBox>
                ) : filteredChats.map((chat, index) => (
                  <MotionBox
                    key={chat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        selected={selectedChat?.id === chat.id}
                        onClick={() => setSelectedChat(chat)}
                        sx={{
                          borderRadius: 2.5,
                          py: 1.5,
                          transition: 'all 0.2s ease',
                          '&.Mui-selected': {
                            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.1))',
                            border: '1px solid rgba(124,58,237,0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.15))',
                            }
                          },
                          '&:hover': {
                            background: 'rgba(255,255,255,0.05)',
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            background: chat.type === 'group' 
                              ? 'linear-gradient(135deg, #ec4899, #db2777)'
                              : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                            width: 44, height: 44,
                          }}>
                            {getChatAvatar(chat)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ 
                                color: '#fafafa', 
                                fontSize: '0.95rem', 
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {chat.name || `Chat #${chat.id}`}
                              </Typography>
                              {chat.type === 'group' && (
                                <Chip 
                                  label="Group" 
                                  size="small"
                                  sx={{ 
                                    height: 18, 
                                    fontSize: '0.625rem', 
                                    fontWeight: 700,
                                    background: 'rgba(236,72,153,0.15)',
                                    color: '#ec4899',
                                    border: '1px solid rgba(236,72,153,0.3)',
                                  }} 
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography sx={{ 
                              color: '#71717a', 
                              fontSize: '0.8rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {chat.type === 'direct' ? 'Direct message' : 'Group chat'}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  </MotionBox>
                ))}
              </AnimatePresence>
            </List>
          </MotionPaper>

          {/* Chat Messages Panel */}
          <MotionPaper
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            sx={{
              borderRadius: 4,
              border: '1px solid rgba(124,58,237,0.15)',
              background: 'linear-gradient(180deg, rgba(15,15,20,0.95) 0%, rgba(9,9,11,0.98) 100%)',
              backdropFilter: 'blur(24px)',
              display: { xs: mobileShowChat ? 'flex' : 'none', md: 'flex' },
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            {/* Chat Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(124,58,237,0.03)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton 
                  onClick={() => setMobileShowChat(false)}
                  sx={{ display: { xs: 'flex', md: 'none' }, color: '#71717a' }}
                >
                  <ArrowBack />
                </IconButton>
                {selectedChat && (
                  <Avatar sx={{ 
                    background: selectedChat.type === 'group' 
                      ? 'linear-gradient(135deg, #ec4899, #db2777)'
                      : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                    width: 40, height: 40,
                  }}>
                    {getChatAvatar(selectedChat)}
                  </Avatar>
                )}
                <Box>
                  <Typography sx={{ color: '#fafafa', fontWeight: 700, fontSize: '1rem' }}>
                    {selectedChat ? (selectedChat.name || `Chat #${selectedChat.id}`) : 'Select a conversation'}
                  </Typography>
                  {selectedChat && (
                    <Typography sx={{ color: '#71717a', fontSize: '0.75rem' }}>
                      {selectedChat.type === 'group' ? 'Group chat' : 'Direct message'}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  size="small"
                  icon={<Circle sx={{ fontSize: '8px !important' }} />}
                  label={wsConnected ? 'Connected' : 'Disconnected'}
                  sx={{
                    background: wsConnected ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.15)',
                    color: wsConnected ? '#34d399' : '#94a3b8',
                    border: wsConnected ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(148,163,184,0.25)',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    '& .MuiChip-icon': {
                      color: wsConnected ? '#34d399' : '#94a3b8',
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Messages */}
            <Box 
              ref={listRef} 
              sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                p: 2.5, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1.5,
              }}
            >
              {!selectedChat ? (
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 2,
                }}>
                  <Box sx={{
                    width: 80, height: 80, borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.1))',
                    border: '1px solid rgba(124,58,237,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ChatIcon sx={{ fontSize: 36, color: '#52525b' }} />
                  </Box>
                  <Typography sx={{ color: '#52525b', fontSize: '1rem', fontWeight: 600 }}>
                    Select a conversation
                  </Typography>
                  <Typography sx={{ color: '#3f3f46', fontSize: '0.875rem', textAlign: 'center' }}>
                    Choose a chat from the list or start a new conversation
                  </Typography>
                </Box>
              ) : messages.length === 0 ? (
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 2,
                }}>
                  <Send sx={{ fontSize: 48, color: '#27272a' }} />
                  <Typography sx={{ color: '#52525b', fontSize: '0.95rem', fontWeight: 600 }}>
                    No messages yet
                  </Typography>
                  <Typography sx={{ color: '#3f3f46', fontSize: '0.85rem' }}>
                    Send a message to start the conversation
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
                          alignSelf: isOwn ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                        }}
                      >
                        <Box
                          sx={{
                            p: 1.75,
                            borderRadius: 3,
                            borderBottomRightRadius: isOwn ? 0.5 : 3,
                            borderBottomLeftRadius: isOwn ? 3 : 0.5,
                            background: isOwn 
                              ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(91,33,182,0.3))'
                              : 'rgba(255,255,255,0.05)',
                            border: isOwn 
                              ? '1px solid rgba(124,58,237,0.3)'
                              : '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          {!isOwn && (
                            <Typography sx={{ 
                              color: '#a78bfa', 
                              fontSize: '0.75rem', 
                              mb: 0.5, 
                              fontWeight: 700 
                            }}>
                              {m.username || `User ${m.user_id}`}
                            </Typography>
                          )}
                          <Typography sx={{ 
                            color: '#fafafa', 
                            fontSize: '0.9rem', 
                            lineHeight: 1.5,
                            wordBreak: 'break-word',
                          }}>
                            {m.text}
                          </Typography>
                          <Typography sx={{ 
                            color: '#52525b', 
                            fontSize: '0.65rem', 
                            mt: 0.75,
                            textAlign: isOwn ? 'right' : 'left',
                          }}>
                            {formatMessageTime(m.created_at)}
                          </Typography>
                        </Box>
                      </MotionBox>
                    );
                  })}
                </AnimatePresence>
              )}
            </Box>

            {/* Message Input */}
            <Box sx={{ 
              p: 2, 
              borderTop: '1px solid rgba(255,255,255,0.06)', 
              display: 'flex', 
              gap: 1.5,
              background: 'rgba(0,0,0,0.2)',
            }}>
              <TextField
                fullWidth
                size="small"
                placeholder={selectedChat ? "Type a message..." : "Select a chat first"}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={!selectedChat}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.03)',
                  }
                }}
              />
              <IconButton 
                onClick={handleSend} 
                disabled={!selectedChat || !messageText.trim()}
                sx={{ 
                  background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                  color: 'white',
                  width: 44, height: 44,
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    transform: 'scale(1.05)',
                  },
                  '&:disabled': {
                    background: 'rgba(255,255,255,0.1)',
                    color: '#52525b',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Send sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </MotionPaper>
        </Box>
      </Box>

      {/* Create Chat Dialog */}
      <Dialog 
        open={createOpen} 
        onClose={resetCreateDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(180deg, rgba(15,15,20,0.98) 0%, rgba(9,9,11,0.99) 100%)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 4,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          pb: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2.5,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.2))',
              border: '1px solid rgba(124,58,237,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GroupAdd sx={{ fontSize: 20, color: '#a78bfa' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#fafafa', fontSize: '1.1rem' }}>
                New Conversation
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#71717a' }}>
                Start a direct or group chat
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {/* Chat Type Tabs */}
          <Tabs 
            value={chatType} 
            onChange={(_, v) => {
              setChatType(v);
              if (v === 'direct' && selectedUsers.length > 1) {
                setSelectedUsers([selectedUsers[0]]);
              }
            }}
            sx={{ 
              mb: 3,
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                height: 3,
                borderRadius: 2,
              }
            }}
          >
            <Tab 
              value="direct" 
              icon={<Person sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Direct Message" 
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600,
                '&.Mui-selected': { color: '#a78bfa' }
              }}
            />
            <Tab 
              value="group" 
              icon={<Group sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Group Chat" 
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600,
                '&.Mui-selected': { color: '#a78bfa' }
              }}
            />
          </Tabs>

          {/* Chat Name (for groups) */}
          {chatType === 'group' && (
            <TextField 
              fullWidth
              label="Group Name" 
              value={newChatName} 
              onChange={(e) => setNewChatName(e.target.value)} 
              placeholder="Enter group name..."
              sx={{ mb: 2.5 }}
            />
          )}

          {/* User Search */}
          <TextField
            fullWidth
            label={chatType === 'direct' ? "Find User" : "Add Members"}
            value={userQuery}
            onChange={(e) => handleUserSearch(e.target.value)}
            placeholder="Search by username..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: '#52525b' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ 
                fontSize: '0.75rem', 
                color: '#71717a', 
                fontWeight: 600, 
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {chatType === 'direct' ? 'Selected User' : `Selected Members (${selectedUsers.length})`}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedUsers.map((u) => (
                  <Chip
                    key={u.id}
                    avatar={<Avatar sx={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>{u.username?.[0]?.toUpperCase()}</Avatar>}
                    label={u.username}
                    onDelete={() => handleRemoveUser(u.id)}
                    sx={{
                      background: 'rgba(124,58,237,0.15)',
                      border: '1px solid rgba(124,58,237,0.3)',
                      color: '#fafafa',
                      '& .MuiChip-deleteIcon': {
                        color: '#71717a',
                        '&:hover': { color: '#ef4444' }
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* User Suggestions */}
          {userSuggestions.length > 0 && (
            <Box>
              <Typography sx={{ 
                fontSize: '0.75rem', 
                color: '#71717a', 
                fontWeight: 600, 
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Search Results
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {userSuggestions.map((u) => (
                  <Box
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(124,58,237,0.1)',
                        borderColor: 'rgba(124,58,237,0.3)',
                      }
                    }}
                  >
                    <Avatar sx={{ 
                      width: 36, height: 36,
                      background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                      fontSize: '0.875rem',
                    }}>
                      {u.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography sx={{ color: '#fafafa', fontWeight: 600, fontSize: '0.9rem' }}>
                        {u.username}
                      </Typography>
                      <Typography sx={{ color: '#52525b', fontSize: '0.75rem' }}>
                        #{u.id}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Search Loading */}
          {searchLoading && (
            <Typography sx={{ color: '#71717a', fontSize: '0.85rem', textAlign: 'center', py: 2 }}>
              Searching...
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Button 
            onClick={resetCreateDialog}
            sx={{ color: '#71717a' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateChat} 
            variant="contained"
            disabled={selectedUsers.length === 0}
            sx={{
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              },
              '&:disabled': {
                background: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            Create {chatType === 'direct' ? 'Chat' : 'Group'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default ChatsPage;
