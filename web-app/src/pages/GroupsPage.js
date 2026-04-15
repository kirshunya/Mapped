import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from '@mui/material';
import { Add, Group as GroupIcon, PersonAdd, ExitToApp, People, Close } from '@mui/icons-material';
import useAuthStore from '../store/authStore';
import { authAPI, groupsAPI } from '../services/api';
import MainLayout from '../components/layout/MainLayout';
import { useNotify } from '../components/ui/NotificationProvider';

const GroupCard = ({ group, isMember, isOwner, onJoin, onLeave, onSelect, loading }) => (
  <Box
    sx={{
      p: 2.2,
      borderRadius: 3,
      background: isMember ? 'rgba(16,185,129,0.09)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isMember ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.08)'}`,
      transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
      '&:hover': {
        borderColor: isMember ? 'rgba(16,185,129,0.55)' : 'rgba(245,158,11,0.35)',
        transform: 'translateY(-2px)',
      },
    }}
  >
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2,
          flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.28), rgba(245,158,11,0.24))',
          border: '1px solid rgba(16,185,129,0.28)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GroupIcon sx={{ fontSize: 19, color: '#34d399' }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>{group.name}</Typography>
          {isOwner && (
            <Chip
              label="Owner"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.62rem',
                fontWeight: 700,
                background: 'rgba(245,158,11,0.15)',
                color: '#f59e0b',
                border: '1px solid rgba(245,158,11,0.35)',
              }}
            />
          )}
          {isMember && !isOwner && (
            <Chip
              label="Member"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.62rem',
                fontWeight: 700,
                background: 'rgba(16,185,129,0.15)',
                color: '#34d399',
                border: '1px solid rgba(16,185,129,0.35)',
              }}
            />
          )}
        </Box>

        {group.description && (
          <Typography sx={{ fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.5, mb: 1.35 }}>{group.description}</Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<People sx={{ fontSize: 13 }} />}
            onClick={() => onSelect(group)}
            sx={{
              fontSize: '0.75rem',
              borderColor: 'rgba(255,255,255,0.2)',
              color: '#cbd5e1',
              '&:hover': { borderColor: '#10b981', color: '#34d399' },
            }}
          >
            Members
          </Button>

          {!isMember ? (
            <Button
              size="small"
              variant="contained"
              startIcon={loading ? <CircularProgress size={12} sx={{ color: 'white' }} /> : <PersonAdd sx={{ fontSize: 13 }} />}
              onClick={() => onJoin(group.id)}
              disabled={loading}
              sx={{ fontSize: '0.75rem' }}
            >
              Join
            </Button>
          ) : !isOwner ? (
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={loading ? <CircularProgress size={12} sx={{ color: 'error.light' }} /> : <ExitToApp sx={{ fontSize: 13 }} />}
              onClick={() => onLeave(group.id)}
              disabled={loading}
              sx={{ fontSize: '0.75rem', borderColor: 'rgba(239,68,68,0.35)' }}
            >
              Leave
            </Button>
          ) : null}
        </Box>
      </Box>
    </Box>
  </Box>
);

const MembersDialog = ({ group, open, onClose }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newUserQuery, setNewUserQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [adding, setAdding] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (open && group) {
      setLoading(true);
      groupsAPI
        .getMembers(group.id)
        .then(({ data }) => setMembers(Array.isArray(data) ? data : []))
        .catch(() => setMembers([]))
        .finally(() => setLoading(false));
    }
  }, [open, group]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupIcon sx={{ fontSize: 17, color: '#34d399' }} />
          {group?.name}
        </Box>
        <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent>
        {group?.owner_id === user?.id && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Find user by username/email"
              value={newUserQuery}
              onChange={async (e) => {
                const q = e.target.value;
                setNewUserQuery(q);
                if (!q.trim()) {
                  setSuggestions([]);
                  return;
                }
                try {
                  const { data } = await authAPI.searchUsers(q.trim());
                  setSuggestions(data?.users || []);
                } catch {
                  setSuggestions([]);
                }
              }}
            />

            {suggestions.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestions.map((u) => (
                  <Chip key={u.id} label={`${u.username} (#${u.id})`} onClick={() => setNewUserId(String(u.id))} sx={{ cursor: 'pointer' }} />
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField fullWidth size="small" label="User ID" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} />
              <Button
                variant="contained"
                disabled={!newUserId || adding}
                onClick={async () => {
                  setAdding(true);
                  try {
                    await groupsAPI.addMember(group.id, { user_id: Number(newUserId), role: 'member' });
                    const { data } = await groupsAPI.getMembers(group.id);
                    setMembers(Array.isArray(data) ? data : []);
                    setNewUserId('');
                    setNewUserQuery('');
                    setSuggestions([]);
                  } finally {
                    setAdding(false);
                  }
                }}
              >
                Add
              </Button>
            </Box>
          </Box>
        )}

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={22} /></Box>
        ) : members.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <People sx={{ fontSize: 34, color: '#1f2937', mb: 1 }} />
            <Typography sx={{ fontSize: '0.88rem', color: '#64748b' }}>No members yet</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {members.map((m) => (
              <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.1, borderRadius: 2, background: 'rgba(255,255,255,0.03)' }}>
                <Avatar src={m.user_avatar} sx={{ width: 30, height: 30, fontSize: '0.8rem', background: 'linear-gradient(135deg,#10b981,#f59e0b)', color: '#082018' }}>
                  {(m.username || String(m.user_id))[0]?.toUpperCase()}
                </Avatar>
                <Typography sx={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.88rem', flex: 1 }}>{m.username || `User #${m.user_id}`}</Typography>
                <Chip
                  label={m.role}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    background: m.role === 'admin' ? 'rgba(245,158,11,0.16)' : 'rgba(16,185,129,0.16)',
                    color: m.role === 'admin' ? '#f59e0b' : '#34d399',
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

const CreateGroupDialog = ({ open, onClose, onCreate }) => {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!form.name.trim()) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await groupsAPI.create(form);
      onCreate(data);
      setForm({ name: '', description: '' });
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupIcon sx={{ color: '#34d399', fontSize: 17 }} /> New group
        </Box>
        <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 0.5 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField fullWidth label="Group name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Description"
          placeholder="What's this group about?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={!form.name.trim() || loading}
          startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Add sx={{ fontSize: 15 }} />}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const GroupsPage = () => {
  const notify = useNotify();
  const { user } = useAuthStore();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [membersOpen, setMembersOpen] = useState(false);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await groupsAPI.getAll();
      setGroups(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load groups');
      notify.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleJoin = async (groupId) => {
    setActionLoading(groupId);
    try {
      await groupsAPI.join(groupId);
      await loadGroups();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to join');
      notify.error('Failed to join group');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async (groupId) => {
    setActionLoading(groupId);
    try {
      await groupsAPI.leave(groupId);
      await loadGroups();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to leave');
      notify.error('Failed to leave group');
    } finally {
      setActionLoading(null);
    }
  };

  const isMember = (g) => g.is_member || g.owner_id === user?.id;

  return (
    <MainLayout>
      <Box sx={{ minHeight: 'calc(100vh - 64px)', px: { xs: 2, md: 3 }, py: 3.2 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.2, gap: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.45rem', md: '1.85rem' }, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Groups
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', color: '#94a3b8' }}>Join groups and build local communities</Typography>
            </Box>
            <Button variant="contained" startIcon={<Add sx={{ fontSize: 15 }} />} onClick={() => setCreateOpen(true)}>
              New group
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress size={24} /></Box>
          ) : groups.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <GroupIcon sx={{ fontSize: 44, opacity: 0.2, color: '#34d399', mb: 1.5 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#e2e8f0', mb: 1 }}>No groups yet</Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mb: 3 }}>Create first group and invite members</Typography>
              <Button variant="contained" startIcon={<Add sx={{ fontSize: 15 }} />} onClick={() => setCreateOpen(true)}>Create group</Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.35 }}>
              {groups.map((g) => (
                <GroupCard
                  key={g.id}
                  group={g}
                  isMember={isMember(g)}
                  isOwner={g.owner_id === user?.id}
                  onJoin={handleJoin}
                  onLeave={handleLeave}
                  onSelect={(grp) => {
                    setSelectedGroup(grp);
                    setMembersOpen(true);
                  }}
                  loading={actionLoading === g.id}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <CreateGroupDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={(g) => setGroups((p) => [g, ...p])} />
      <MembersDialog group={selectedGroup} open={membersOpen} onClose={() => setMembersOpen(false)} />
    </MainLayout>
  );
};

export default GroupsPage;
