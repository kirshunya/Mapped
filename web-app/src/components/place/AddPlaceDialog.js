import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, Select, MenuItem, InputLabel, CircularProgress,
} from '@mui/material';
import { LocationOn, Close, Send, Public, Lock, Group, AttachFile } from '@mui/icons-material';
import { groupsAPI, mediaAPI } from '../../services/api';
import { CATEGORIES } from '../ui/categories';
import { useNotify } from '../ui/NotificationProvider';

export const AddPlaceDialog = ({ open, onClose, position, onSubmit, loading }) => {
  const notify = useNotify();
  const [form, setForm] = useState({ name: '', description: '', category: 'other', privacy: 'public', group_id: '' });
  const [groups, setGroups] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      groupsAPI.getAll()
        .then(({ data }) => setGroups(Array.isArray(data) ? data : []))
        .catch(() => {
          setGroups([]);
          notify.error('Failed to load groups');
        });
    }
  }, [open, notify]);

  useEffect(() => {
    if (!open) {
      setPhotos([]);
      setForm({ name: '', description: '', category: 'other', privacy: 'public', group_id: '' });
    }
  }, [open]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const { data } = await mediaAPI.upload(file);
        uploaded.push(data.url);
      }
      setPhotos((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error('Upload failed:', err);
      notify.error('Photo upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    const payload = { ...form, latitude: position.lat, longitude: position.lng };
    if (form.privacy !== 'group') delete payload.group_id;
    else payload.group_id = form.group_id ? Number(form.group_id) : undefined;
    if (photos.length > 0) payload.media_urls = photos;
    onSubmit(payload);
  };

  if (!position) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn sx={{ color: 'primary.main', fontSize: 20 }} />
          Add new place
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#52525b' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
          <Box sx={{
            px: 2, py: 1.25, borderRadius: 2,
            background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <LocationOn sx={{ fontSize: 14, color: '#7c3aed' }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#71717a', fontFamily: 'monospace' }}>
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </Typography>
          </Box>

          <TextField
            fullWidth label="Place name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <TextField
            fullWidth multiline rows={2} label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What makes this place special?"
          />

          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select value={form.category} label="Category" onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 26, height: 26, borderRadius: 1.5,
                      background: `${c.color}18`, border: `1px solid ${c.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                    }}>
                      {c.emoji}
                    </Box>
                    {c.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
              Photos {photos.length > 0 && `(${photos.length})`}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {photos.map((url, i) => (
                <Box key={i} sx={{ position: 'relative', width: 64, height: 64 }}>
                  <Box component="img" src={url} alt=""
                    sx={{ width: 64, height: 64, borderRadius: 1.5, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.07)' }} />
                  <IconButton size="small" onClick={() => removePhoto(i)}
                    sx={{ position: 'absolute', top: -6, right: -6, background: 'rgba(0,0,0,0.7)', p: 0.25, '&:hover': { background: 'rgba(239,68,68,0.8)' } }}>
                    <Close sx={{ fontSize: 10, color: 'white' }} />
                  </IconButton>
                </Box>
              ))}
              <Button
                component="label"
                disabled={uploading}
                sx={{
                  width: 64, height: 64, borderRadius: 1.5, border: '1px dashed rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0,
                  color: '#52525b', '&:hover': { borderColor: '#7c3aed', color: '#7c3aed' },
                }}
              >
                {uploading ? <CircularProgress size={18} /> : <AttachFile sx={{ fontSize: 20 }} />}
                <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFileChange} />
              </Button>
            </Box>
          </Box>

          <FormControl fullWidth size="small">
            <InputLabel>Visibility</InputLabel>
            <Select value={form.privacy} label="Visibility" onChange={(e) => setForm({ ...form, privacy: e.target.value })}>
              <MenuItem value="public">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Public sx={{ fontSize: 16, color: '#10b981' }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Public</Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: '#52525b' }}>Requires moderation approval</Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem value="private">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lock sx={{ fontSize: 16, color: '#71717a' }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Private</Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: '#52525b' }}>Only visible to you</Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem value="group">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Group sx={{ fontSize: 16, color: '#a78bfa' }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Group</Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: '#52525b' }}>Visible to group members</Typography>
                  </Box>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {form.privacy === 'group' && (
            <FormControl fullWidth size="small">
              <InputLabel>Select group</InputLabel>
              <Select value={form.group_id} label="Select group" onChange={(e) => setForm({ ...form, group_id: e.target.value })}>
                {groups.length === 0 && (
                  <MenuItem disabled value=""><em>No groups — create one first</em></MenuItem>
                )}
                {groups.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    <Group sx={{ fontSize: 16, color: '#a78bfa', mr: 1 }} />
                    {g.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!form.name || loading}
          startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Send sx={{ fontSize: 15 }} />}>
          {loading ? 'Adding…' : 'Add Place'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
