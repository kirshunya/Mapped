import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Skeleton,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
} from '@mui/material';
import { TuneOutlined, Star, NavigateNext, AutoAwesome } from '@mui/icons-material';
import { placesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [recommendationType, setRecommendationType] = useState('smart');
  const [category, setCategory] = useState('all');
  const [maxDistance, setMaxDistance] = useState(50);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await placesAPI.getRecommendations({
        limit: 12,
        type: recommendationType,
        category: category !== 'all' ? category : undefined,
        maxDistance,
      });
      setPlaces(response.data?.places || []);
    } finally {
      setLoading(false);
    }
  }, [recommendationType, category, maxDistance]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const recommendationsCount = useMemo(() => places.length, [places]);

  const parseMedia = (value) => {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return [value];
      }
    }
    return [];
  };

  return (
    <MainLayout>
      <Box sx={{ minHeight: 'calc(100vh - 64px)', py: 3.2 }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              p: { xs: 2.2, md: 2.8 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(245,158,11,0.08) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              mb: 3,
            }}
          >
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.6rem', md: '2.1rem' }, color: '#f8fafc', letterSpacing: '-0.03em', mb: 0.6 }}>
              Recommendations Engine
            </Typography>
            <Typography sx={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
              Smart place suggestions with filters and one-click regeneration.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <ToggleButtonGroup
              value={recommendationType}
              exclusive
              onChange={(e, v) => v && setRecommendationType(v)}
              sx={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, p: 0.4 }}
            >
              <ToggleButton value="smart" sx={{ border: 'none', borderRadius: 2.3, textTransform: 'none', fontWeight: 700, px: 2 }}>
                <AutoAwesome sx={{ fontSize: 17, mr: 0.7 }} /> Smart
              </ToggleButton>
              <ToggleButton value="popular" sx={{ border: 'none', borderRadius: 2.3, textTransform: 'none', fontWeight: 700, px: 2 }}>Popular</ToggleButton>
              <ToggleButton value="nearby" sx={{ border: 'none', borderRadius: 2.3, textTransform: 'none', fontWeight: 700, px: 2 }}>Nearby</ToggleButton>
              <ToggleButton value="random" sx={{ border: 'none', borderRadius: 2.3, textTransform: 'none', fontWeight: 700, px: 2 }}>Random</ToggleButton>
            </ToggleButtonGroup>

            <Button variant="outlined" startIcon={<TuneOutlined />} onClick={() => setFilterOpen((p) => !p)} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Filters
            </Button>

            <Chip label={`${recommendationsCount} places`} sx={{ color: '#34d399', border: '1px solid rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.1)', fontWeight: 700 }} />
            <Box sx={{ flex: 1 }} />

            <Button variant="contained" onClick={loadRecommendations} disabled={loading} sx={{ textTransform: 'none', fontWeight: 800, px: 3 }}>
              Generate
            </Button>
          </Box>

          <Collapse in={filterOpen}>
            <Box sx={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, p: 2.5, mb: 3 }}>
              <Stack spacing={2.4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="restaurant">Restaurant</MenuItem>
                    <MenuItem value="cafe">Cafe</MenuItem>
                    <MenuItem value="bar">Bar</MenuItem>
                    <MenuItem value="museum">Museum</MenuItem>
                    <MenuItem value="park">Park</MenuItem>
                  </Select>
                </FormControl>

                <Box>
                  <Typography sx={{ color: '#f8fafc', mb: 1.1, fontWeight: 700 }}>Max Distance: {maxDistance} km</Typography>
                  <Slider value={maxDistance} onChange={(e, v) => setMaxDistance(v)} min={1} max={100} valueLabelDisplay="auto" />
                </Box>
              </Stack>
            </Box>
          </Collapse>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', lg: 'repeat(4,1fr)' },
              gap: 2,
            }}
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} sx={{ borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton width="80%" />
                      <Skeleton width="40%" />
                      <Skeleton width="100%" height={34} />
                    </CardContent>
                  </Card>
                ))
              : places.map((place) => {
                  const media = parseMedia(place.media_urls);
                  const image = media[0] || 'https://via.placeholder.com/500x300?text=No+Image';
                  return (
                    <Card
                      key={place.id}
                      sx={{
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                        '&:hover': { transform: 'translateY(-4px)', borderColor: 'rgba(16,185,129,0.35)', boxShadow: '0 14px 36px rgba(2,6,23,0.35)' },
                      }}
                    >
                      <CardMedia component="img" height="200" image={image} alt={place.name} sx={{ objectFit: 'cover' }} />
                      <CardContent>
                        <Typography sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '1rem', mb: 0.6 }} noWrap>{place.name}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Chip size="small" label={place.category || 'other'} sx={{ background: 'rgba(16,185,129,0.14)', color: '#34d399', border: '1px solid rgba(16,185,129,0.35)' }} />
                          {!!place.rating && (
                            <Chip size="small" icon={<Star sx={{ fontSize: 14 }} />} label={Number(place.rating).toFixed(1)} sx={{ background: 'rgba(245,158,11,0.14)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.35)' }} />
                          )}
                        </Stack>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.86rem', minHeight: 42 }}>
                          {place.description || 'No description available'}
                        </Typography>
                        <Button endIcon={<NavigateNext />} onClick={() => navigate(`/places/${place.id}`)} sx={{ mt: 1, textTransform: 'none', fontWeight: 700 }}>
                          View place
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
          </Box>

          {!loading && places.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 10, borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', mt: 2 }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '1rem' }}>No recommendations. Adjust filters and try again.</Typography>
            </Box>
          )}
        </Container>
      </Box>
    </MainLayout>
  );
};

export default RecommendationsPage;
