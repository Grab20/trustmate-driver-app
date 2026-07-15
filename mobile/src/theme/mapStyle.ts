// A Life360-inspired dark map style: muted navy background, hidden POI
// clutter, and bright, legible road labels so street names stay readable
// even zoomed in tight.
export const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d2a3d' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d2a3d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#c7cfdb' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#3a4a63' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#33455e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#26374d' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e3e8f0' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3f5573' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#374b66' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#16202e' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5c7a99' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#1d2a3d' }],
  },
]
