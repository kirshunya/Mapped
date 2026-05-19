import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

/**
 * DotsLine - Beautiful animated vertical dots timeline
 * Perfect for showing progress, timeline, or connecting related items
 */
export const DotsLine = ({ 
  items = [], 
  activeIndex = 0, 
  onClick = null,
  variant = 'default', // 'default' | 'compact' | 'large'
}) => {
  const sizes = {
    default: { dot: 12, gap: 12, line: 2 },
    compact: { dot: 8, gap: 8, line: 1.5 },
    large: { dot: 16, gap: 16, line: 2.5 },
  };

  const size = sizes[variant] || sizes.default;

  return (
    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Vertical connecting line */}
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: size.line,
          transform: 'translateX(-50%)',
          background: 'linear-gradient(180deg, rgba(124,58,237,0.3) 0%, rgba(236,72,153,0.3) 100%)',
          zIndex: 0,
        }}
      />

      {/* Dots */}
      {items.map((item, idx) => {
        const isActive = idx === activeIndex;
        const isPast = idx < activeIndex;

        return (
          <MotionBox
            key={idx}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
            onClick={() => onClick?.(idx)}
            sx={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              py: size.gap / 2,
              cursor: onClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Dot */}
            <Box
              sx={{
                width: size.dot,
                height: size.dot,
                borderRadius: '50%',
                background: isActive
                  ? 'linear-gradient(135deg, #7c3aed, #ec4899)'
                  : isPast
                  ? 'linear-gradient(135deg, #a78bfa, #f472b6)'
                  : 'rgba(255,255,255,0.15)',
                border: isActive
                  ? '3px solid rgba(124,58,237,0.5)'
                  : '2px solid rgba(255,255,255,0.2)',
                boxShadow: isActive ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
                transition: 'all 0.3s ease',
                flexShrink: 0,
                '&:hover': onClick && {
                  transform: 'scale(1.3)',
                  boxShadow: '0 0 16px rgba(124,58,237,0.5)',
                },
              }}
            />

            {/* Content */}
            {item && (
              <MotionBox
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 + 0.1, duration: 0.3 }}
                sx={{
                  flex: 1,
                  pb: size.gap / 2,
                }}
              >
                {typeof item === 'string' ? (
                  <Box sx={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 500 }}>
                    {item}
                  </Box>
                ) : (
                  item
                )}
              </MotionBox>
            )}
          </MotionBox>
        );
      })}
    </Box>
  );
};

export default DotsLine;
