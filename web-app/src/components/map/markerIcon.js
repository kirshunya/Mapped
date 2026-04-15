import L from 'leaflet';

export const makeMarkerIcon = (color, emoji, selected = false) => {
  const size = selected ? 44 : 36;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 ${size} ${size + 8}">
      <defs>
        <filter id="s" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
      </defs>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}"
        fill="${color}" filter="url(#s)" opacity="${selected ? 1 : 0.9}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}"
        fill="none" stroke="white" stroke-width="${selected ? 3 : 2}" opacity="0.9"/>
      <text x="${size / 2}" y="${size / 2 + 1}" text-anchor="middle" dominant-baseline="middle"
        font-size="${selected ? 18 : 15}">${emoji}</text>
      <polygon points="${size / 2 - 5},${size - 3} ${size / 2 + 5},${size - 3} ${size / 2},${size + 7}"
        fill="${color}" opacity="${selected ? 1 : 0.85}"/>
    </svg>`;
  return new L.DivIcon({
    html: svg,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
    className: '',
  });
};
