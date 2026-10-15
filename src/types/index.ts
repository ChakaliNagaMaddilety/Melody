export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  artworkUrl: string;
  previewUrl: string | null;
  durationMs: number | null;
  collectionId?: number;
  genre?: string;
  releaseDate?: string;
}

export interface Playlist {
  id: string;
  name: string;
  createdAt: number;
  trackIds: number[];
}

export interface SearchResult {
  tracks: Track[];
  totalCount: number;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  shuffle: boolean;
  repeat: RepeatMode;
  isLoading: boolean;
  error: string | null;
}

export interface AppPreferences {
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
}

export interface iTunesResult {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackTimeMillis?: number;
  collectionId?: number;
  primaryGenreName?: string;
  releaseDate?: string;
  wrapperType?: string;
  kind?: string;
}
