export const CATEGORIES = [
  { value: 'cafe',       label: 'Cafe',       emoji: '☕', color: '#f59e0b' },
  { value: 'restaurant', label: 'Restaurant', emoji: '🍽️', color: '#ef4444' },
  { value: 'park',       label: 'Park',       emoji: '🌿', color: '#10b981' },
  { value: 'museum',     label: 'Museum',     emoji: '🏛️', color: '#6366f1' },
  { value: 'monument',   label: 'Monument',   emoji: '🗿', color: '#8b5cf6' },
  { value: 'nature',     label: 'Nature',     emoji: '🏞️', color: '#22c55e' },
  { value: 'other',      label: 'Other',      emoji: '📍', color: '#64748b' },
];

export const getCat = (value) =>
  CATEGORIES.find((c) => c.value === value) || CATEGORIES[CATEGORIES.length - 1];
