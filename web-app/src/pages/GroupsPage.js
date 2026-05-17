import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Avatar,
  Menu,
  MenuItem,
  CircularProgress,
  Divider,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add,
  Search,
  Close,
  Group as GroupIcon,
  Person,
  MoreVert,
  Edit,
  Delete,
  PersonAdd,
  ExitToApp,
  People,
  ArrowBack,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../components/layout/MainLayout';
import { groupsAPI, authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { useNotify } from '../components/ui/NotificationProvider';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const GroupsPage = () => {
  const { user } = useAuthStore();
  const notify = useNotify();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupSearch, setGroupSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [groupMenuAnchor, setGroupMenuAnchor] = useState(null);
  const [newUserQuery, setNewUserQuery] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [newUserId, setNewUserId] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await groupsAPI.getAll();
      // Handle different API response formats
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data?.groups && Array.isArray(data.groups)) {
        list = data.groups;
      } else if (data && typeof data === 'object') {
        // If it's a single object, wrap it in an array
        list = [data];
      }
      setGroups(list);
      // Only set selectedGroup if it's not already set and list has items
      setSelectedGroup((prev) => prev || (list.length > 0 ? list[0] : null));
    } catch (err) {
      console.error('Failed to load groups:', err);
      notify.error('Failed to load groups');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  const loadMembers = useCallback(async (groupId) => {
    if (!groupId) return;
    setMembersLoading(true);
    try {
      const { data } = await groupsAPI.getMembers(groupId);
      let memberList = [];
      if (Array.isArray(data)) {
        memberList = data;
      } else if (data?.members && Array.isArray(data.members)) {
        memberList = data.members;
      }
      setMembers(memberList);
    } catch (err) {
      console.error('Failed to load members:', err);
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (selectedGroup?.id) {
      loadMembers(selectedGroup.id);
    }
  }, [selectedGroup, loadMembers]);

  const filteredGroups = groups.filter((g) => 
    g && g.name && g.name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const isMember = (g) => g && (g.is_member || g.owner_id === user?.id);
  const isOwner = (g) => g && g.owner_id === user?.id;

  const handleJoin = async (groupId) => {
    setActionLoading(groupId);
    try {
      await groupsAPI.join(groupId);
      await loadGroups();
      notify.success('Joined group');
    } catch (err) {
      notify.error(err.response?.data?.error || 'Failed to join');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async (groupId) => {
    setActionLoading(groupId);
    try {
      await groupsAPI.leave(groupId);
      setSelectedGroup(null);
      await loadGroups();
      notify.success('Left group');
    } catch (err) {
      notify.error(err.response?.data?.error || 'Failed to leave');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateGroup = async () => {
    if (!createForm.name.trim()) {
      setCreateError('Group name is required');
      return;
    }
    setCreateLoading(true);
    setCreateError('');
    try {
      const { data } = await groupsAPI.create(createForm);
      setGroups((p) => [data, ...p]);
      setSelectedGroup(data);
      setCreateForm({ name: '', description: '' });
      setCreateOpen(false);
      notify.success('Group created');
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create group');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedGroup || !newUserId) return;
    setAddingMember(true);
    try {
      await groupsAPI.addMember(selectedGroup.id, {
        user_id: Number(newUserId),
        role: 'member',
      });
      await loadMembers(selectedGroup.id);
      setNewUserId('');
      setNewUserQuery('');
      setUserSuggestions([]);
      notify.success('Member added');
    } catch (err) {
      notify.error(err.response?.data?.error || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  return (
    <MainLayout>
      <Box
        sx={{
          display: 'flex',
          height: 'calc(100vh - 64px)',
          background: '#030712',
          overflow: 'hidden',
        }}
      >
        {/* Groups List Sidebar */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: isMobile && selectedGroup ? 0 : '100%', md: 340 },
            borderRadius: 0,
            background: 'rgba(15,23,42,0.4)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.3s ease',
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Typography
                sx={{
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  flex: 1,
                }}
              >
                Groups
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<Add sx={{ fontSize: 16 }} />}
                onClick={() => setCreateOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8b5cf6, #f472b6)',
                  },
                }}
              >
                New
              </Button>
            </Box>

            {/* Search */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search groups..."
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18, color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 2,
                  '&:hover': { background: 'rgba(255,255,255,0.08)' },
                  '&.Mui-focused': {
                    background: 'rgba(124,58,237,0.1)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#7c3aed',
                    },
                  },
                },
              }}
            />
          </Box>

          {/* Groups List */}
          <List
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 1,
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(124,58,237,0.3)',
                borderRadius: '3px',
              },
            }}
          >
            <AnimatePresence>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : filteredGroups.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                    No groups found
                  </Typography>
                </Box>
              ) : (
                filteredGroups.map((group, idx) => (
                  <MotionBox
                    key={group.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ListItemButton
                      onClick={() => setSelectedGroup(group)}
                      selected={selectedGroup?.id === group.id}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        color: '#f8fafc',
                        background:
                          selectedGroup?.id === group.id
                            ? 'rgba(124,58,237,0.2)'
                            : 'transparent',
                        border:
                          selectedGroup?.id === group.id
                            ? '1px solid rgba(124,58,237,0.4)'
                            : '1px solid transparent',
                        '&:hover': {
                          background: 'rgba(124,58,237,0.1)',
                        },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${
                            isMember(group)
                              ? 'rgba(16,185,129,0.2)'
                              : 'rgba(124,58,237,0.2)'
                          }, ${
                            isMember(group)
                              ? 'rgba(16,185,129,0.1)'
                              : 'rgba(236,72,153,0.15)'
                          })`,
                          border: `1px solid ${
                            isMember(group)
                              ? 'rgba(16,185,129,0.3)'
                              : 'rgba(124,58,237,0.3)'
                          }`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <GroupIcon
                          sx={{
                            fontSize: 22,
                            color: isMember(group) ? '#34d399' : '#a78bfa',
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            color: '#f8fafc',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {group.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            mt: 0.25,
                          }}
                        >
                          {group.member_count || 0} members
                        </Typography>
                      </Box>
                    </ListItemButton>
                  </MotionBox>
                ))
              )}
            </AnimatePresence>
          </List>
        </Paper>

        {/* Group Details Panel */}
        {selectedGroup ? (
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Group Header */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 0,
                background: 'rgba(15,23,42,0.4)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isMobile && (
                  <IconButton
                    size="small"
                    onClick={() => setSelectedGroup(null)}
                    sx={{ color: '#a78bfa' }}
                  >
                    <ArrowBack />
                  </IconButton>
                )}
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#f8fafc' }}>
                    {selectedGroup.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                    {members.length} members
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isMember(selectedGroup) && (
                  <Button
                    size="small"
                    startIcon={<People sx={{ fontSize: 16 }} />}
                    onClick={() => setMembersOpen(true)}
                    sx={{
                      textTransform: 'none',
                      color: '#a78bfa',
                      borderColor: 'rgba(124,58,237,0.3)',
                      border: '1px solid rgba(124,58,237,0.3)',
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#7c3aed',
                        background: 'rgba(124,58,237,0.08)',
                      },
                    }}
                  >
                    Members
                  </Button>
                )}

                {isMember(selectedGroup) ? (
                  isOwner(selectedGroup) ? null : (
                    <Button
                      size="small"
                      startIcon={<ExitToApp sx={{ fontSize: 16 }} />}
                      onClick={() => handleLeave(selectedGroup.id)}
                      disabled={actionLoading === selectedGroup.id}
                      sx={{
                        textTransform: 'none',
                        color: '#ef4444',
                        borderColor: 'rgba(239,68,68,0.3)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 2,
                        '&:hover': {
                          borderColor: '#ef4444',
                          background: 'rgba(239,68,68,0.08)',
                        },
                      }}
                    >
                      Leave
                    </Button>
                  )
                ) : (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PersonAdd sx={{ fontSize: 16 }} />}
                    onClick={() => handleJoin(selectedGroup.id)}
                    disabled={actionLoading === selectedGroup.id}
                    sx={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #34d399, #10b981)',
                      },
                    }}
                  >
                    Join
                  </Button>
                )}
              </Box>
            </Paper>

            {/* Group Info */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 3,
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(124,58,237,0.3)',
                  borderRadius: '3px',
                },
              }}
            >
              {/* Description */}
              {selectedGroup.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8', mb: 1, fontWeight: 600 }}>
                    About
                  </Typography>
                  <Typography sx={{ color: '#cbd5e1', lineHeight: 1.6 }}>
                    {selectedGroup.description}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* Members Section */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 600 }}>
                    Members ({members.length})
                  </Typography>
                  {isOwner(selectedGroup) && (
                    <IconButton
                      size="small"
                      onClick={() => setMembersOpen(true)}
                      sx={{ color: '#a78bfa' }}
                    >
                      <Edit sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}
                </Box>

                {membersLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    {members.slice(0, 5).map((m) => (
                      <Box
                        key={m.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: 2,
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <Avatar
                          src={m.user_avatar}
                          sx={{
                            width: 32,
                            height: 32,
                            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                            fontSize: '0.75rem',
                          }}
                        >
                          {(m.username || String(m.user_id))[0]?.toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              color: '#f8fafc',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                            }}
                          >
                            {m.username}
                          </Typography>
                        </Box>
                        <Chip
                          label={m.role}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            background:
                              m.role === 'admin' ? 'rgba(245,158,11,0.16)' : 'rgba(16,185,129,0.16)',
                            color:
                              m.role === 'admin' ? '#f59e0b' : '#34d399',
                            border:
                              m.role === 'admin'
                                ? '1px solid rgba(245,158,11,0.3)'
                                : '1px solid rgba(16,185,129,0.3)',
                          }}
                        />
                      </Box>
                    ))}
                    {members.length > 5 && (
                      <Box sx={{ textAlign: 'center', py: 1 }}>
                        <Button
                          size="small"
                          onClick={() => setMembersOpen(true)}
                          sx={{
                            textTransform: 'none',
                            color: '#a78bfa',
                          }}
                        >
                          View all {members.length} members
                        </Button>
                      </Box>
                    )}
                  </Stack>
                )}
              </Box>
            </Box>
          </MotionBox>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#030712',
            }}
          >
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              sx={{ textAlign: 'center' }}
            >
              <GroupIcon sx={{ fontSize: 64, color: '#27272a', mb: 2 }} />
              <Typography sx={{ color: '#64748b', fontSize: '1rem', fontWeight: 600 }}>
                Select a group to view details
              </Typography>
            </MotionBox>
          </Box>
        )}
      </Box>

      {/* Create Group Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(180deg, rgba(15,15,20,0.98) 0%, rgba(9,9,11,0.99) 100%)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            pb: 2,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.2))',
              border: '1px solid rgba(124,58,237,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GroupIcon sx={{ fontSize: 20, color: '#a78bfa' }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>
              New Group
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              Create a new community
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {createError && (
            <Box
              sx={{
                p: 2,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 2,
                color: '#ef4444',
                fontSize: '0.85rem',
              }}
            >
              {createError}
            </Box>
          )}

          <TextField
            fullWidth
            label="Group name"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder="What's your group about?"
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
              },
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            placeholder="Tell us more about this group..."
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Button
            onClick={() => setCreateOpen(false)}
            sx={{ color: '#64748b' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateGroup}
            disabled={!createForm.name.trim() || createLoading}
            startIcon={createLoading && <CircularProgress size={16} sx={{ color: 'white' }} />}
            sx={{
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8b5cf6, #f472b6)',
              },
            }}
          >
            Create Group
          </Button>
        </DialogActions>
      </Dialog>

      {/* Members Dialog */}
      <Dialog
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(180deg, rgba(15,15,20,0.98) 0%, rgba(9,9,11,0.99) 100%)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(245,158,11,0.2))',
                border: '1px solid rgba(16,185,129,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <People sx={{ fontSize: 20, color: '#34d399' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>
                {selectedGroup?.name}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                Manage members
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => setMembersOpen(false)}
            sx={{ color: '#64748b' }}
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {isOwner(selectedGroup) && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                mb: 3,
                pb: 3,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <TextField
                fullWidth
                size="small"
                label="Find user by username/email"
                value={newUserQuery}
                onChange={async (e) => {
                  const q = e.target.value;
                  setNewUserQuery(q);
                  if (!q.trim()) {
                    setUserSuggestions([]);
                    return;
                  }
                  try {
                    const { data } = await authAPI.searchUsers(q.trim());
                    setUserSuggestions(data?.users || []);
                  } catch {
                    setUserSuggestions([]);
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 18, color: '#52525b' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 2,
                  },
                }}
              />

              {userSuggestions.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {userSuggestions.map((u) => (
                    <Chip
                      key={u.id}
                      label={`${u.username} (#${u.id})`}
                      onClick={() => setNewUserId(String(u.id))}
                      sx={{
                        cursor: 'pointer',
                        background: 'rgba(124,58,237,0.15)',
                        border: '1px solid rgba(124,58,237,0.3)',
                        color: '#f8fafc',
                        '&:hover': { background: 'rgba(124,58,237,0.25)' },
                      }}
                    />
                  ))}
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="User ID"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 2,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  disabled={!newUserId || addingMember}
                  onClick={handleAddMember}
                  startIcon={addingMember && <CircularProgress size={14} sx={{ color: 'white' }} />}
                  sx={{
                    background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8b5cf6, #f472b6)',
                    },
                  }}
                >
                  Add
                </Button>
              </Box>
            </Box>
          )}

          {membersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Stack spacing={1}>
              {members.map((m) => (
                <Box
                  key={m.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(124,58,237,0.08)',
                      borderColor: 'rgba(124,58,237,0.2)',
                    },
                  }}
                >
                  <Avatar
                    src={m.user_avatar}
                    sx={{
                      width: 36,
                      height: 36,
                      background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                      fontSize: '0.8rem',
                      color: 'white',
                    }}
                  >
                    {(m.username || String(m.user_id))[0]?.toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        color: '#f8fafc',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      {m.username}
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                      #{m.user_id}
                    </Typography>
                  </Box>
                  <Chip
                    label={m.role}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      background:
                        m.role === 'admin'
                          ? 'rgba(245,158,11,0.16)'
                          : 'rgba(16,185,129,0.16)',
                      color: m.role === 'admin' ? '#f59e0b' : '#34d399',
                      border:
                        m.role === 'admin'
                          ? '1px solid rgba(245,158,11,0.3)'
                          : '1px solid rgba(16,185,129,0.3)',
                    }}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default GroupsPage;
