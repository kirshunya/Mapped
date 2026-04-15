import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { Star } from '@mui/icons-material';
import { getCat } from '../ui/categories';

export const PlaceCard = ({ place, selected, onClick, loading }) => {
  const cat = getCat(place?.category);
  
  // Parse media URLs
  const parseMedia = (raw) => {
    if (!raw || raw === 'null') return [];
    if (Array.isArray(raw)) return raw;
    try { 
      const p = JSON.parse(raw); 
      return Array.isArray(p) ? p : []; 
    } catch { 
      return []; 
    }
  };

  const mediaUrls = parseMedia(place?.media_urls);
  const hasPhoto = mediaUrls.length > 0;

  if (loading) {
    return (
      <Box sx={{ mb: 1.5, p: 1.5, borderRadius: 2.5, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <Skeleton variant="rectangular" width="100%" height={140} sx={{ borderRadius: 2, mb: 1.5, bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Skeleton width="70%" height={20} sx={{ mb: 0.5, bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Skeleton width="100%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
      </Box>
    );
  }

  return (
    <Box
      onClick={() => onClick(place)}
      sx={{
        mb: 1.5, borderRadius: 2.5, overflow: 'hidden',
        background: selected ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selected ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.05)'}`,
        cursor: 'pointer', 
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
        '&:hover': { 
          background: 'rgba(124,58,237,0.12)', 
          borderColor: 'rgba(124,58,237,0.5)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(124,58,237,0.2)',
        },
        '&:active': {
          transform: 'translateY(0)',
        }
      }}
    >
      {/* Photo or Category Icon */}
      {hasPhoto ? (
        <Box sx={{ 
          width: '100%', height: 140, position: 'relative', overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: 'linear-gradient(to top, rgba(9,9,11,0.9) 0%, transparent 100%)',
          }
        }}>
          <Box component="img" src={mediaUrls[0]} alt={place.name}
            sx={{ 
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.05)' }
            }} 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {/* Category badge on photo */}
          <Box sx={{
            position: 'absolute', top: 10, right: 10, zIndex: 1,
            px: 1.25, py: 0.5, borderRadius: 99,
            background: `${cat.color}25`, 
            backdropFilter: 'blur(12px)',
            border: `1px solid ${cat.color}40`,
            display: 'flex', alignItems: 'center', gap: 0.5,
          }}>
            <Box sx={{ fontSize: 13 }}>{cat.emoji}</Box>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: cat.color }}>
              {cat.label}
            </Typography>
          </Box>
          {/* Rating badge on photo */}
          {place.rating > 0 && (
            <Box sx={{
              position: 'absolute', bottom: 10, left: 10, zIndex: 1,
              px: 1, py: 0.4, borderRadius: 99,
              background: 'rgba(9,9,11,0.8)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex', alignItems: 'center', gap: 0.4,
            }}>
              <Star sx={{ fontSize: 12, color: '#f59e0b' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>
                {place.rating.toFixed(1)}
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{
          width: '100%', height: 100, 
          background: `linear-gradient(135deg, ${cat.color}15, ${cat.color}05)`,
          border: `1px solid ${cat.color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <Box sx={{ fontSize: 48, opacity: 0.6 }}>{cat.emoji}</Box>
          {place.rating > 0 && (
            <Box sx={{
              position: 'absolute', bottom: 8, right: 8,
              px: 1, py: 0.4, borderRadius: 99,
              background: 'rgba(9,9,11,0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', gap: 0.4,
            }}>
              <Star sx={{ fontSize: 11, color: '#f59e0b' }} />
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#f59e0b' }}>
                {place.rating.toFixed(1)}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Content */}
      <Box sx={{ p: 1.75 }}>
        <Typography sx={{
          fontWeight: 700, fontSize: '0.9375rem', color: '#fafafa',
          mb: 0.5, lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', 
          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
        }}>
          {place.name}
        </Typography>
        
        {place.description && (
          <Typography sx={{
            fontSize: '0.8125rem', color: '#71717a', lineHeight: 1.5, mb: 1,
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {place.description}
          </Typography>
        )}

        {/* Meta row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          {place.username && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ 
                width: 16, height: 16, borderRadius: '50%', 
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.5rem', fontWeight: 700, color: 'white',
              }}>
                {place.username[0]?.toUpperCase()}
              </Box>
              <Typography sx={{ fontSize: '0.6875rem', color: '#52525b', fontWeight: 500 }}>
                @{place.username}
              </Typography>
            </Box>
          )}
          {mediaUrls.length > 1 && (
            <Typography sx={{ 
              ml: 'auto', fontSize: '0.6875rem', color: '#52525b', 
              px: 1, py: 0.25, borderRadius: 99,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              +{mediaUrls.length - 1} photo{mediaUrls.length > 2 ? 's' : ''}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};
