import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Grid,
  Card,
  Chip,
  Button,
  Stack,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Star,
  Person,
  ViewComfy,
  ViewList,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { placesAPI } from '../services/api';
import { useNotify } from '../components/ui/NotificationProvider';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const PlaceCard = ({ place, onViewDetails }) => (
  <MotionCard
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    onClick={onViewDetails}
    sx={{
      background: 'rgba(15,23,42,0.5)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 3,
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
      '&:hover': {
        borderColor: 'rgba(124,58,237,0.3)',
        background: 'rgba(124,58,237,0.05)',
        transform: 'translateY(-4px)',
      },
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {/* Image */}
    {place.photo_url && (
      <Box
        sx={{
          width: '100%',
          height: 180,
          background: `url(${place.photo_url}) center/cover`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)',
          }
        }}
      />
    )}

    {/* Content */}
    <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1.05rem',
            color: '#f8fafc',
            mb: 0.5,
          }}
        >
          {place.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LocationOn sx={{ fontSize: 14, color: '#94a3b8' }} />
          <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {place.address || 'No address'}
          </Typography>
        </Box>
      </Box>

      {/* Category Badge */}
      <Box sx={{ mb: 2 }}>
        <Chip
          label={place.category || 'Uncategorized'}
          size="small"
          sx={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.15))',
            color: '#a78bfa',
            border: '1px solid rgba(124,58,237,0.3)',
            fontWeight: 600,
          }}
        />
      </Box>

      {/* Description */}
      {place.description && (
        <Typography
          sx={{
            fontSize: '0.875rem',
            color: '#cbd5e1',
            lineHeight: 1.5,
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 40,
          }}
        >
          {place.description}
        </Typography>
      )}

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 2,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          marginTop: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {place.rating && (
            <>
              <Star
                sx={{
                  fontSize: 14,
                  color: '#fbbf24',
                }}
              />
              <Typography sx={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 600 }}>
                {place.rating.toFixed(1)}
              </Typography>
            </>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Person sx={{ fontSize: 14, color: '#64748b' }} />
          <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
            {place.likes_count || 0} likes
          </Typography>
        </Box>
      </Box>
    </Box>
  </MotionCard>
);

const PlacesPage = () => {
  const navigate = useNavigate();
  const notify = useNotify();

  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const categories = [
    'Restaurant',
    'Cafe',
    'Park',
    'Museum',
    'Beach',
    'Mountain',
    'Monument',
    'Gallery',
    'Theater',
    'Market',
  ];

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await placesAPI.getAll();
      const list = Array.isArray(data?.places) ? data.places : [];
      setPlaces(list);
      setFilteredPlaces(list);
    } catch (err) {
      console.error(err);
      notify.error('Failed to load places');
      setPlaces([]);
      setFilteredPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  useEffect(() => {
    let filtered = places;

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    setFilteredPlaces(filtered);
  }, [searchQuery, selectedCategory, places]);

  return (
    <MainLayout>
      <Box sx={{ minHeight: 'calc(100vh - 64px)', background: '#030712', py: 4 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 3 } }}>
          {/* Header */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            sx={{ mb: 4 }}
          >
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.8rem', md: '2.2rem' },
                color: '#f8fafc',
                letterSpacing: '-0.02em',
                mb: 1,
              }}
            >
              Discover Places
            </Typography>
            <Typography
              sx={{
                fontSize: '1rem',
                color: '#94a3b8',
              }}
            >
              Explore amazing locations shared by our community
            </Typography>
          </MotionBox>

          {/* Search and Filters */}
          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            sx={{ mb: 4 }}
          >
            <Stack spacing={3}>
              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder="Search places by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 20, color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 2.5,
                    fontSize: '1rem',
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

              {/* Category Filter */}
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#94a3b8',
                    mb: 1.5,
                  }}
                >
                  Filter by Category
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  <Chip
                    label="All"
                    onClick={() => setSelectedCategory(null)}
                    sx={{
                      background:
                        !selectedCategory
                          ? 'linear-gradient(135deg, #7c3aed, #ec4899)'
                          : 'rgba(255,255,255,0.05)',
                      color: !selectedCategory ? 'white' : '#94a3b8',
                      border: !selectedCategory ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': {
                        background:
                          !selectedCategory
                            ? 'linear-gradient(135deg, #8b5cf6, #f472b6)'
                            : 'rgba(255,255,255,0.1)',
                      },
                    }}
                  />
                  {categories.map((cat) => (
                    <Chip
                      key={cat}
                      label={cat}
                      onClick={() => setSelectedCategory(cat)}
                      sx={{
                        background:
                          selectedCategory === cat
                            ? 'linear-gradient(135deg, #7c3aed, #ec4899)'
                            : 'rgba(255,255,255,0.05)',
                        color: selectedCategory === cat ? 'white' : '#94a3b8',
                        border:
                          selectedCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        '&:hover': {
                          background:
                            selectedCategory === cat
                              ? 'linear-gradient(135deg, #8b5cf6, #f472b6)'
                              : 'rgba(255,255,255,0.1)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* View Mode Toggle */}
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  startIcon={<ViewComfy />}
                  onClick={() => setViewMode('grid')}
                  variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    background: viewMode === 'grid' ? 'rgba(124,58,237,0.2)' : 'transparent',
                    borderColor: viewMode === 'grid' ? 'transparent' : 'rgba(255,255,255,0.1)',
                    color: '#a78bfa',
                  }}
                >
                  Grid
                </Button>
                <Button
                  size="small"
                  startIcon={<ViewList />}
                  onClick={() => setViewMode('list')}
                  variant={viewMode === 'list' ? 'contained' : 'outlined'}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    background: viewMode === 'list' ? 'rgba(124,58,237,0.2)' : 'transparent',
                    borderColor: viewMode === 'list' ? 'transparent' : 'rgba(255,255,255,0.1)',
                    color: '#a78bfa',
                  }}
                >
                  List
                </Button>
              </Box>
            </Stack>
          </MotionBox>

          {/* Results Count */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            sx={{ mb: 3 }}
          >
            <Typography sx={{ fontSize: '0.9rem', color: '#64748b' }}>
              {loading ? 'Loading...' : `${filteredPlaces.length} place${filteredPlaces.length !== 1 ? 's' : ''} found`}
            </Typography>
          </MotionBox>

          {/* Places Grid/List */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : filteredPlaces.length === 0 ? (
            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              sx={{
                textAlign: 'center',
                py: 10,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.08))',
                border: '1px solid rgba(124,58,237,0.2)',
              }}
            >
              <LocationOn sx={{ fontSize: 56, color: '#27272a', mb: 2 }} />
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', mb: 1 }}>
                No places found
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', color: '#64748b' }}>
                Try adjusting your search or filters
              </Typography>
            </MotionBox>
          ) : viewMode === 'grid' ? (
            <Grid container spacing={2}>
              <AnimatePresence>
                {filteredPlaces.map((place, idx) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={place.id}>
                    <PlaceCard
                      place={place}
                      onViewDetails={() => navigate(`/places/${place.id}`)}
                    />
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          ) : (
            <Stack spacing={2}>
              <AnimatePresence>
                {filteredPlaces.map((place, idx) => (
                  <MotionBox
                    key={place.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      onClick={() => navigate(`/places/${place.id}`)}
                      sx={{
                        background: 'rgba(15,23,42,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 3,
                        p: 3,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'rgba(124,58,237,0.3)',
                          background: 'rgba(124,58,237,0.05)',
                        },
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            color: '#f8fafc',
                            mb: 0.75,
                          }}
                        >
                          {place.name}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <LocationOn sx={{ fontSize: 14, color: '#94a3b8' }} />
                          <Typography sx={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                            {place.address || 'No address'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            label={place.category || 'Uncategorized'}
                            size="small"
                            sx={{
                              background: 'rgba(124,58,237,0.2)',
                              color: '#a78bfa',
                              border: '1px solid rgba(124,58,237,0.3)',
                            }}
                          />
                          {place.rating && (
                            <Chip
                              icon={<Star sx={{ fontSize: 14 }} />}
                              label={place.rating.toFixed(1)}
                              size="small"
                              sx={{
                                background: 'rgba(251,191,36,0.15)',
                                color: '#fbbf24',
                              }}
                            />
                          )}
                        </Box>
                      </Box>

                      {place.description && (
                        <Typography
                          sx={{
                            flex: 1,
                            fontSize: '0.9rem',
                            color: '#cbd5e1',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {place.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                        <Person sx={{ fontSize: 16, color: '#64748b' }} />
                        <Typography sx={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                          {place.likes_count || 0}
                        </Typography>
                      </Box>
                    </Card>
                  </MotionBox>
                ))}
              </AnimatePresence>
            </Stack>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default PlacesPage;
