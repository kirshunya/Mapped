import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  CircularProgress,
  Autocomplete,
  Stack,
} from '@mui/material';
import {
  Close,
  PhotoCamera,
  Place as PlaceIcon,
} from '@mui/icons-material';
import { postsAPI, mediaAPI, placesAPI } from '../../services/api';
import { useNotify } from '../ui/NotificationProvider';

const CreatePostDialog = ({ open, onClose, onPostCreated }) => {
  const notify = useNotify();
  const [content, setContent] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadPlaces = useCallback(async () => {
    try {
      const response = await placesAPI.getAll({ limit: 100 });
      // Handle response format: { places: [...] } or direct array
      const placesData = response.data?.places || response.data || [];
      setPlaces(Array.isArray(placesData) ? placesData : []);
    } catch (error) {
      console.error('Failed to load places:', error);
      notify.error('Failed to load places');
    }
  }, [notify]);

  useEffect(() => {
    if (open) {
      loadPlaces();
    }
  }, [open, loadPlaces]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages([...selectedImages, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedImages.length === 0) {
      return;
    }

    setLoading(true);
    try {
      // Upload images first
      let mediaUrls = [];
      if (selectedImages.length > 0) {
        setUploading(true);
        for (const file of selectedImages) {
          const response = await mediaAPI.upload(file);
          if (response.data?.url) {
            mediaUrls.push(response.data.url);
          }
        }
        setUploading(false);
      }

      // Create post
      const postData = {
        content: content.trim(),
        media_urls: mediaUrls,
      };

      if (selectedPlace) {
        postData.place_id = selectedPlace.id;
        postData.place_name = selectedPlace.name;
      }

      await postsAPI.create(postData);
      
      // Reset form
      setContent('');
      setSelectedPlace(null);
      setSelectedImages([]);
      setImagePreviews([]);
      
      if (onPostCreated) onPostCreated();
      onClose();
      notify.success('Post published');
    } catch (error) {
      console.error('Failed to create post:', error);
      notify.error('Failed to create post');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: '#09090b',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fafafa',
          fontWeight: 600,
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        Create Post
        <IconButton
          onClick={onClose}
          sx={{
            color: '#71717a',
            '&:hover': {
              color: '#fafafa',
              background: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Content TextField */}
          <TextField
            multiline
            rows={4}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="outlined"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fafafa',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(124, 58, 237, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#7c3aed',
                },
              },
            }}
          />

          {/* Place Autocomplete */}
          <Autocomplete
            options={places}
            value={selectedPlace}
            onChange={(e, newValue) => setSelectedPlace(newValue)}
            getOptionLabel={(option) => option.name || ''}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Add location (optional)"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <PlaceIcon sx={{ color: '#71717a', ml: 1, mr: 0.5 }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fafafa',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(124, 58, 237, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#7c3aed',
                    },
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <li
                {...props}
                style={{
                  background: '#09090b',
                  color: '#fafafa',
                  padding: '8px 16px',
                }}
              >
                {option.name}
              </li>
            )}
            sx={{
              '& .MuiAutocomplete-listbox': {
                background: '#09090b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }}
          />

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: 1,
              }}
            >
              {imagePreviews.map((preview, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    paddingTop: '100%',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: '#fafafa',
                      '&:hover': {
                        background: 'rgba(0, 0, 0, 0.85)',
                      },
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          {/* Upload Button */}
          <Button
            component="label"
            startIcon={<PhotoCamera />}
            sx={{
              justifyContent: 'flex-start',
              color: '#7c3aed',
              textTransform: 'none',
              fontWeight: 500,
              py: 1.5,
              px: 2,
              background: 'rgba(124, 58, 237, 0.05)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              borderRadius: '12px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'rgba(124, 58, 237, 0.1)',
                borderColor: 'rgba(124, 58, 237, 0.3)',
              },
            }}
          >
            Add Photos
            <input
              type="file"
              hidden
              accept="image/*"
              multiple
              onChange={handleImageSelect}
            />
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: '#71717a',
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            '&:hover': {
              color: '#fafafa',
              background: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || uploading || (!content.trim() && selectedImages.length === 0)}
          sx={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
            color: '#fafafa',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #6d28d9 0%, #db2777 100%)',
              boxShadow: '0 6px 16px rgba(124, 58, 237, 0.4)',
            },
            '&:disabled': {
              background: 'rgba(124, 58, 237, 0.2)',
              color: 'rgba(250, 250, 250, 0.4)',
            },
          }}
        >
          {uploading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: '#fafafa' }} />
              Uploading...
            </>
          ) : loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: '#fafafa' }} />
              Posting...
            </>
          ) : (
            'Post'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePostDialog;
