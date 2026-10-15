export const APP_NAME = 'Melody';
export const APP_TAGLINE = 'Your Music. Your Mood.';

export const ITUNES_API_URL = 'https://itunes.apple.com/search';
export const ITUNES_LOOKUP_URL = 'https://itunes.apple.com/lookup';

export const SEARCH_DEBOUNCE_MS = 400;
export const RECENT_SEARCHES_MAX = 10;
export const RECENT_TRACKS_MAX = 20;
export const MIN_SEARCH_LENGTH = 2;

export const STORAGE_KEYS = {
  PLAYLISTS: 'melody_playlists',
  FAVORITES: 'melody_favorites',
  RECENT_TRACKS: 'melody_recent_tracks',
  RECENT_SEARCHES: 'melody_recent_searches',
  PREFERENCES: 'melody_preferences',
} as const;

export const HOME_CATEGORIES = [
  { id: 'pop', label: 'Pop', query: 'pop hits', icon: 'Music' },
  { id: 'rock', label: 'Rock', query: 'rock anthems', icon: 'Guitar' },
  { id: 'hiphop', label: 'Hip-Hop', query: 'hip hop', icon: 'Mic' },
  { id: 'electronic', label: 'Electronic', query: 'electronic dance', icon: 'Radio' },
  { id: 'jazz', label: 'Jazz', query: 'jazz smooth', icon: 'Music2' },
  { id: 'classical', label: 'Classical', query: 'classical orchestra', icon: 'Music3' },
  { id: 'rnb', label: 'R&B', query: 'r&b soul', icon: 'Heart' },
  { id: 'country', label: 'Country', query: 'country hits', icon: 'Music4' },
] as const;

export const HOME_FEATURED_QUERIES = [
  'top hits 2024',
  'indie discoveries',
  'chill vibes',
  'workout energy',
  'acoustic favorites',
  'throwback classics',
];
