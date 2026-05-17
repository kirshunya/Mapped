import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, IconButton, Avatar,
  TextField, InputAdornment, Tooltip, Badge, Button, Chip,
  Drawer, Slider, Fab, Menu, MenuItem, Divider, Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon, FilterList, Close, Add as AddIcon,
  MyLocation, Groups as GroupsIcon, Person, Shield,
  Logout, TravelExplore, Public, Lock, LocationOn,
  DynamicFeed, Layers, Map as MapIcon, Satellite,
  ChatBubbleOutline, ExploreOutlined, Settings,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, ZoomControl } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import useAuthStore from '../store/authStore';
import usePlaceStore from '../store/placeStore';
import { placesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, getCat } from '../components/ui/categories';
import { makeMarkerIcon } from '../components/map/markerIcon';
import { PlaceCard } from '../components/place/PlaceCard';
import { PlaceDetail } from '../components/place/PlaceDetail';
import { AddPlaceDialog } from '../components/place/AddPlaceDialog';

const MotionBox = motion(Box);

// Map tile options for different styles
const MAP_TILES = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    label: 'Dark',
    icon: <MapIcon sx={{ fontSize: 18 }} />,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    label: 'Satellite',
    icon: <Satellite sx={{ fontSize: 18 }} />,
  },
  minimal: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
    label: 'Minimal',
    icon: <Layers sx={{ fontSize: 18 }} />,
  },
};

function MapClickHandler({ onMapClick, mode }) {
  const modeRef = React.useRef(mode);
  const cbRef = React.useRef(onMapClick);
  React.useEffect(() => { modeRef.current = mode; }, [mode]);
  React.useEffect(() => { cbRef.current = onMapClick; }, [onMapClick]);
  useMapEvents({ click: (e) => { if (modeRef.current === 'add') cbRef.current(e.latlng); } });
  return null;
}

function MapFlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 16, { duration: 1.2, easeLinearity: 0.25 });
  }, [center, map]);
  return null;
}

const MainMap = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { places, setPlaces, addPlace, updatePlace, removePlace } = usePlaceStore();

  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('view');
  const [newPlacePos, setNewPlacePos] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [catFilter, setCatFilter] = useState([]);
  const [privFilter, setPrivFilter] = useState([]);
  const [ratingFilter, setRatingFilter] = useState([0, 5]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterDrawer, setFilterDrawer] = useState(false);
  const [mapStyle, setMapStyle] = useState('dark');
  const [mapStyleMenu, setMapStyleMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await placesAPI.getAll({ limit: 500 });
      setPlaces(Array.isArray(data) ? data : (data.places || []));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [setPlaces]);

  useEffect(() => { fetchPlaces(); }, [fetchPlaces]);

  const handleMapClick = (latlng) => { setNewPlacePos(latlng); setAddDialogOpen(true); };

  const handleAddPlace = async (placeData) => {
    setAddLoading(true);
    try {
      const { data } = await placesAPI.create(placeData);
      addPlace(data);
      setAddDialogOpen(false);
      setMode('view');
    } catch (err) { console.error(err); }
    finally { setAddLoading(false); }
  };

  const filteredPlaces = places
    .filter((p) => p.approval === 'approved' || p.user_id === user?.id)
    .filter((p) => !search || (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase()))
    .filter((p) => catFilter.length === 0 || catFilter.includes(p.category))
    .filter((p) => privFilter.length === 0 || privFilter.includes(p.privacy))
    .filter((p) => (p.rating || 0) >= ratingFilter[0]);

  const pendingCount = places.filter((p) => p.approval === 'pending').length;
  const activeFilters = catFilter.length + privFilter.length + (ratingFilter[0] > 0 ? 1 : 0);

  const toggleCat = (v) => setCatFilter((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);
  const togglePriv = (v) => setPrivFilter((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);
  const clearFilters = () => { setCatFilter([]); setPrivFilter([]); setRatingFilter([0, 5]); };

  const handleMyLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error('Geolocation error:', err)
    );
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#09090b', overflow: 'hidden' }}>
      {/* Top Navigation Bar */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        sx={{
          position: 'relative',
          zIndex: 1100,
          bgcolor: 'rgba(9,9,11,0.85)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          px: { xs: 2, sm: 3 },
          py: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, maxWidth: 1800, mx: 'auto' }}>
          {/* Logo */}
          <Box 
            onClick={() => navigate('/')} 
            sx={{ 
              display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { opacity: 0.8 },
            }}
          >
            <Box sx={{
              width: 36, height: 36, borderRadius: 2,
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
              boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
            }}>📍</Box>
            <Typography sx={{ 
              fontWeight: 800, fontSize: '1.25rem', 
              background: 'linear-gradient(135deg, #a78bfa, #f472b6)', 
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              display: { xs: 'none', sm: 'block' },
            }}>
              Mapped
            </Typography>
          </Box>

          {/* Search */}
          <TextField 
            size="small" 
            placeholder="Search places…" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            sx={{ 
              flex: 1, 
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255,255,255,0.03)',
                '&:hover': { background: 'rgba(255,255,255,0.05)' },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: '#52525b' }} />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.5 }}>
                    <Close sx={{ fontSize: 16, color: '#52525b' }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Nav Actions */}
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Filters */}
            <Tooltip title="Filters">
              <IconButton onClick={() => setFilterDrawer(true)} sx={{ color: '#71717a', '&:hover': { color: '#a78bfa' } }}>
                <Badge 
                  badgeContent={activeFilters || null} 
                  color="primary"
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.625rem', minWidth: 16, height: 16 } }}
                >
                  <FilterList sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <Tooltip title={user?.username || 'Account'}>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                <Avatar 
                  src={user?.avatar} 
                  sx={{ 
                    width: 34, height: 34, fontSize: '0.85rem', 
                    background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.3)',
                      boxShadow: '0 0 12px rgba(124,58,237,0.3)',
                    }
                  }}
                >
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>

          {/* User menu dropdown */}
          <Menu 
            anchorEl={anchorEl} 
            open={Boolean(anchorEl)} 
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(255,255,255,0.06)', mb: 0.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#fafafa' }}>
                {user?.username}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#52525b', textTransform: 'capitalize' }}>
                {user?.role}
              </Typography>
            </Box>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/feed'); }}>
              <DynamicFeed sx={{ fontSize: 18, mr: 1.5, color: '#71717a' }} /> Feed
            </MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
              <Person sx={{ fontSize: 18, mr: 1.5, color: '#71717a' }} /> Profile
            </MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/groups'); }}>
              <GroupsIcon sx={{ fontSize: 18, mr: 1.5, color: '#71717a' }} /> Groups
            </MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/chats'); }}>
              <ChatBubbleOutline sx={{ fontSize: 18, mr: 1.5, color: '#71717a' }} /> Chats
            </MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>
              <Settings sx={{ fontSize: 18, mr: 1.5, color: '#71717a' }} /> Settings
            </MenuItem>
            {(user?.role === 'moderator' || user?.role === 'admin') && (
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/moderation'); }}>
                <Shield sx={{ fontSize: 18, mr: 1.5, color: '#a78bfa' }} /> Moderation
                {pendingCount > 0 && (
                  <Chip 
                    label={pendingCount} 
                    size="small" 
                    color="warning" 
                    sx={{ ml: 'auto', height: 20, fontSize: '0.65rem', fontWeight: 700 }} 
                  />
                )}
              </MenuItem>
            )}
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={() => { logout(); navigate('/login'); }} sx={{ color: '#f87171' }}>
              <Logout sx={{ fontSize: 18, mr: 1.5 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </MotionBox>

      {/* Main Content */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Map Container */}
        <MapContainer 
          center={[53.9045, 27.5615]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer 
            url={MAP_TILES[mapStyle].url} 
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <ZoomControl position="bottomright" />
          <MapClickHandler onMapClick={handleMapClick} mode={mode} />
          <MapFlyTo center={mapCenter} />
          
          {/* Place Markers */}
          {filteredPlaces.map((place) => {
            const cat = getCat(place.category);
            const sel = selectedPlace?.id === place.id;
            return (
              <Marker 
                key={place.id} 
                position={[place.latitude, place.longitude]}
                icon={makeMarkerIcon(cat.color, cat.emoji, sel)}
                eventHandlers={{ 
                  click: () => { 
                    setSelectedPlace(place); 
                    setMapCenter({ lat: place.latitude, lng: place.longitude }); 
                  }
                }}
                zIndexOffset={sel ? 1000 : 0}
              >
                <Popup>
                  <Box sx={{ p: 2, minWidth: 220 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <Box sx={{ 
                        width: 36, height: 36, borderRadius: 2,
                        background: `${cat.color}20`, 
                        border: `1px solid ${cat.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontSize: 18 
                      }}>
                        {cat.emoji}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#fafafa', lineHeight: 1.2 }}>
                          {place.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: cat.color, fontWeight: 600 }}>
                          {cat.label}
                        </Typography>
                      </Box>
                    </Box>
                    {place.description && (
                      <Typography sx={{ fontSize: '0.8rem', color: '#a1a1aa', lineHeight: 1.5, mb: 1.5 }}>
                        {place.description.length > 100 ? place.description.slice(0, 100) + '…' : place.description}
                      </Typography>
                    )}
                    <Button 
                      size="small" 
                      fullWidth 
                      variant="contained"
                      onClick={() => {
                        setSelectedPlace(place);
                        setMapCenter({ lat: place.latitude, lng: place.longitude });
                      }}
                      sx={{ 
                        mt: 0.5,
                        background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                        fontSize: '0.8rem',
                        py: 0.75,
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {mode === 'view' && !selectedPlace && (
            <MotionBox
              key="sidebar-list"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              sx={styles.sidebar}
            >
              {/* Sidebar Header */}
              <Box sx={{ 
                px: 3, pt: 3, pb: 2.5, 
                borderBottom: '1px solid rgba(255,255,255,0.06)', 
                background: 'linear-gradient(180deg, rgba(124,58,237,0.05) 0%, transparent 100%)',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: 2.5,
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.2))',
                    border: '1px solid rgba(124,58,237,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ExploreOutlined sx={{ fontSize: 20, color: '#a78bfa' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#fafafa' }}>
                      Explore Places
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#71717a' }}>
                      {loading ? 'Loading...' : `${filteredPlaces.length} place${filteredPlaces.length !== 1 ? 's' : ''} found`}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Category Quick Filters */}
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 2 }}>
                  {CATEGORIES.slice(0, 5).map((c) => (
                    <Chip 
                      key={c.value} 
                      label={c.emoji}
                      size="small"
                      onClick={() => toggleCat(c.value)}
                      sx={{
                        width: 36, height: 36, borderRadius: 2,
                        background: catFilter.includes(c.value) ? `${c.color}20` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${catFilter.includes(c.value) ? c.color : 'rgba(255,255,255,0.08)'}`,
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        '& .MuiChip-label': { px: 0 },
                        '&:hover': { 
                          background: `${c.color}15`,
                          borderColor: c.color,
                          transform: 'scale(1.1)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Places List */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                {loading ? (
                  // Loading skeletons
                  Array.from({ length: 4 }).map((_, i) => (
                    <PlaceCard key={i} loading />
                  ))
                ) : filteredPlaces.length === 0 ? (
                  <MotionBox 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{ textAlign: 'center', py: 8 }}
                  >
                    <Box sx={{
                      width: 64, height: 64, borderRadius: 3, mx: 'auto', mb: 2,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <SearchIcon sx={{ fontSize: 28, color: '#3f3f46' }} />
                    </Box>
                    <Typography sx={{ fontSize: '1rem', color: '#52525b', fontWeight: 600, mb: 0.5 }}>
                      No places found
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#3f3f46' }}>
                      Try adjusting your filters or search
                    </Typography>
                    {activeFilters > 0 && (
                      <Button 
                        size="small" 
                        onClick={clearFilters}
                        sx={{ mt: 2, color: '#7c3aed' }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </MotionBox>
                ) : (
                  filteredPlaces.map((p, idx) => (
                    <MotionBox
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <PlaceCard 
                        place={p} 
                        selected={selectedPlace?.id === p.id}
                        onClick={() => { 
                          setSelectedPlace(p); 
                          setMapCenter({ lat: p.latitude, lng: p.longitude }); 
                        }} 
                      />
                    </MotionBox>
                  ))
                )}
              </Box>
            </MotionBox>
          )}

          {/* Place Detail Sidebar */}
          {selectedPlace && (
            <MotionBox
              key="sidebar-detail"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              sx={styles.sidebar}
            >
              <Box sx={{ 
                px: 2.5, pt: 2, pb: 1.5, 
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.01)',
              }}>
                <Button 
                  size="small" 
                  startIcon={<Close sx={{ fontSize: 16 }} />}
                  onClick={() => setSelectedPlace(null)}
                  sx={{ 
                    color: '#71717a', fontSize: '0.8125rem', px: 1.5, py: 0.75, fontWeight: 600,
                    borderRadius: 2,
                    '&:hover': { color: '#fafafa', bgcolor: 'rgba(255,255,255,0.08)' } 
                  }}
                >
                  Back to list
                </Button>
              </Box>
              <PlaceDetail
                place={selectedPlace}
                onClose={() => setSelectedPlace(null)}
                onPlaceUpdated={(updated) => { updatePlace(updated.id, updated); setSelectedPlace(updated); }}
                onPlaceDeleted={(id) => { removePlace(id); setSelectedPlace(null); }}
              />
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Map Controls - Bottom Right */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: 100, 
          right: 16, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1, 
          zIndex: 1000 
        }}>
          {/* Map Style */}
          <Tooltip title="Map style" placement="left">
            <Fab 
              size="small"
              onClick={(e) => setMapStyleMenu(e.currentTarget)}
              sx={styles.fabSmall}
            >
              {MAP_TILES[mapStyle].icon}
            </Fab>
          </Tooltip>

          {/* My Location */}
          <Tooltip title="My location" placement="left">
            <Fab 
              size="small"
              onClick={handleMyLocation}
              sx={styles.fabSmall}
            >
              <MyLocation sx={{ fontSize: 18 }} />
            </Fab>
          </Tooltip>
        </Box>

        {/* Add Place FAB */}
        <Tooltip title={mode === 'add' ? 'Cancel' : 'Add place'} placement="left">
          <Fab 
            color={mode === 'add' ? 'secondary' : 'primary'}
            onClick={() => setMode(mode === 'view' ? 'add' : 'view')}
            sx={{ 
              position: 'absolute',
              bottom: 28,
              right: 16,
              width: 56, 
              height: 56,
              background: mode === 'add' 
                ? 'linear-gradient(135deg, #ec4899, #db2777)' 
                : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              zIndex: 1000,
              '&:hover': { 
                transform: 'scale(1.1) rotate(90deg)', 
                boxShadow: mode === 'add' 
                  ? '0 12px 32px rgba(236,72,153,0.5)' 
                  : '0 12px 32px rgba(124,58,237,0.5)',
              },
            }}
          >
            {mode === 'add' ? <Close sx={{ fontSize: 26 }} /> : <AddIcon sx={{ fontSize: 26 }} />}
          </Fab>
        </Tooltip>

        {/* Map Style Menu */}
        <Menu
          anchorEl={mapStyleMenu}
          open={Boolean(mapStyleMenu)}
          onClose={() => setMapStyleMenu(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          {Object.entries(MAP_TILES).map(([key, tile]) => (
            <MenuItem 
              key={key}
              selected={mapStyle === key}
              onClick={() => { setMapStyle(key); setMapStyleMenu(null); }}
            >
              {tile.icon}
              <Typography sx={{ ml: 1.5 }}>{tile.label}</Typography>
            </MenuItem>
          ))}
        </Menu>

        {/* Add Mode Banner */}
        <AnimatePresence>
          {mode === 'add' && (
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              sx={styles.addBanner}
            >
              <Box sx={{
                width: 32, height: 32, borderRadius: 2,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LocationOn sx={{ fontSize: 18, color: 'white' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.9rem', color: 'white', fontWeight: 700 }}>
                  Add New Place
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                  Click anywhere on the map
                </Typography>
              </Box>
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>

      {/* Filter Drawer */}
      <Drawer 
        anchor="right" 
        open={filterDrawer} 
        onClose={() => setFilterDrawer(false)}
        PaperProps={{ 
          sx: { 
            width: 320, 
            bgcolor: 'rgba(9,9,11,0.98)', 
            backdropFilter: 'blur(24px)', 
            border: '1px solid rgba(255,255,255,0.06)', 
          } 
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.2))',
                border: '1px solid rgba(124,58,237,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FilterList sx={{ fontSize: 18, color: '#a78bfa' }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#fafafa' }}>
                Filters
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setFilterDrawer(false)} sx={{ color: '#52525b' }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <Typography sx={{ 
            fontSize: '0.7rem', color: '#52525b', fontWeight: 700, 
            textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 
          }}>
            Category
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
            {CATEGORIES.map((c) => (
              <Chip 
                key={c.value} 
                label={`${c.emoji} ${c.label}`} 
                clickable 
                onClick={() => toggleCat(c.value)}
                sx={{
                  border: '1px solid', 
                  borderColor: catFilter.includes(c.value) ? c.color : 'rgba(255,255,255,0.1)',
                  background: catFilter.includes(c.value) ? `${c.color}18` : 'transparent',
                  color: catFilter.includes(c.value) ? c.color : '#71717a',
                  fontWeight: 600, fontSize: '0.8125rem',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: c.color,
                    background: `${c.color}10`,
                  }
                }} 
              />
            ))}
          </Box>

          <Typography sx={{ 
            fontSize: '0.7rem', color: '#52525b', fontWeight: 700, 
            textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 
          }}>
            Visibility
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
            {[
              { v: 'public', l: 'Public', i: <Public sx={{ fontSize: 14 }} /> }, 
              { v: 'private', l: 'Private', i: <Lock sx={{ fontSize: 14 }} /> }
            ].map((p) => (
              <Chip 
                key={p.v} 
                icon={p.i} 
                label={p.l} 
                clickable 
                onClick={() => togglePriv(p.v)}
                sx={{
                  border: '1px solid', 
                  borderColor: privFilter.includes(p.v) ? '#7c3aed' : 'rgba(255,255,255,0.1)',
                  background: privFilter.includes(p.v) ? 'rgba(124,58,237,0.15)' : 'transparent',
                  color: privFilter.includes(p.v) ? '#a78bfa' : '#71717a', 
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#7c3aed',
                    background: 'rgba(124,58,237,0.1)',
                  }
                }} 
              />
            ))}
          </Box>

          <Typography sx={{ 
            fontSize: '0.7rem', color: '#52525b', fontWeight: 700, 
            textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 
          }}>
            Minimum Rating
          </Typography>
          <Box sx={{ px: 1 }}>
            <Slider 
              value={ratingFilter} 
              onChange={(_, v) => setRatingFilter(v)} 
              min={0} 
              max={5} 
              step={0.5}
              valueLabelDisplay="auto" 
              valueLabelFormat={(v) => v === 0 ? 'Any' : `${v}★`} 
              sx={{ mb: 4 }} 
            />
          </Box>

          <Button 
            fullWidth 
            variant="outlined" 
            onClick={clearFilters} 
            disabled={activeFilters === 0}
            sx={{
              py: 1.5,
              borderColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                borderColor: 'rgba(124,58,237,0.5)',
                background: 'rgba(124,58,237,0.1)',
              }
            }}
          >
            Clear all filters {activeFilters > 0 && `(${activeFilters})`}
          </Button>
        </Box>
      </Drawer>

      {/* Add Place Dialog */}
      <AddPlaceDialog 
        open={addDialogOpen} 
        onClose={() => { setAddDialogOpen(false); setMode('view'); }}
        position={newPlacePos} 
        onSubmit={handleAddPlace} 
        loading={addLoading} 
      />
    </Box>
  );
};

const styles = {
  sidebar: {
    position: 'absolute', 
    top: 16, 
    left: 16, 
    bottom: 16, 
    width: 380, 
    zIndex: 900,
    borderRadius: 4, 
    background: 'rgba(9,9,11,0.92)', 
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)', 
    border: '1px solid rgba(124,58,237,0.15)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(124,58,237,0.08)',
    display: 'flex', 
    flexDirection: 'column', 
    overflow: 'hidden',
  },
  fabSmall: {
    bgcolor: 'rgba(15,15,20,0.95)', 
    color: '#a78bfa', 
    border: '1px solid rgba(124,58,237,0.2)',
    backdropFilter: 'blur(12px)',
    transition: 'all 0.2s ease',
    '&:hover': { 
      bgcolor: 'rgba(124,58,237,0.15)', 
      color: '#c4b5fd', 
      transform: 'scale(1.1)',
      borderColor: 'rgba(124,58,237,0.4)',
    },
  },
  addBanner: {
    position: 'absolute', 
    top: 20, 
    left: '50%', 
    transform: 'translateX(-50%)', 
    zIndex: 1000,
    px: 3, 
    py: 1.5, 
    borderRadius: 3,
    background: 'linear-gradient(135deg, rgba(236,72,153,0.95), rgba(219,39,119,0.95))', 
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex', 
    alignItems: 'center', 
    gap: 1.5,
    boxShadow: '0 16px 48px rgba(236,72,153,0.4)',
  },
};

export default MainMap;
