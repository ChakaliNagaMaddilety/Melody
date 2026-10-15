import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track, Playlist, AppPreferences, RepeatMode } from '@/src/types';
import { STORAGE_KEYS, RECENT_SEARCHES_MAX, RECENT_TRACKS_MAX } from '@/src/constants/config';

export const DEFAULT_PREFERENCES: AppPreferences = {
  shuffle: false,
  repeat: 'off',
  volume: 1.0,
};

// --- Track store for referenced tracks (keyed by id) ---
const TRACK_STORE_KEY = 'melody_track_store';

interface TrackStore {
  [id: number]: Track;
}

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[storage] Failed to read ${key}:`, err);
    return fallback;
  }
}

async function writeJSON(key: string, value: unknown): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[storage] Failed to write ${key}:`, err);
    return false;
  }
}

// --- Track store management ---
export async function saveTracks(tracks: Track[]): Promise<void> {
  if (tracks.length === 0) return;
  const store = await readJSON<TrackStore>(TRACK_STORE_KEY, {});
  for (const track of tracks) {
    store[track.id] = track;
  }
  await writeJSON(TRACK_STORE_KEY, store);
}

export async function getTrackById(id: number): Promise<Track | null> {
  const store = await readJSON<TrackStore>(TRACK_STORE_KEY, {});
  return store[id] || null;
}

export async function getTracksByIds(ids: number[]): Promise<Track[]> {
  const store = await readJSON<TrackStore>(TRACK_STORE_KEY, {});
  return ids.map((id) => store[id]).filter(Boolean) as Track[];
}

// --- Playlists ---
export async function getPlaylists(): Promise<Playlist[]> {
  return readJSON<Playlist[]>(STORAGE_KEYS.PLAYLISTS, []);
}

export async function savePlaylists(playlists: Playlist[]): Promise<boolean> {
  return writeJSON(STORAGE_KEYS.PLAYLISTS, playlists);
}

export async function createPlaylist(name: string): Promise<Playlist> {
  const playlists = await getPlaylists();
  const playlist: Playlist = {
    id: `pl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    createdAt: Date.now(),
    trackIds: [],
  };
  playlists.push(playlist);
  await savePlaylists(playlists);
  return playlist;
}

export async function renamePlaylist(id: string, newName: string): Promise<boolean> {
  const playlists = await getPlaylists();
  const playlist = playlists.find((p) => p.id === id);
  if (!playlist) return false;
  playlist.name = newName.trim();
  return savePlaylists(playlists);
}

export async function deletePlaylist(id: string): Promise<boolean> {
  const playlists = await getPlaylists();
  const filtered = playlists.filter((p) => p.id !== id);
  return savePlaylists(filtered);
}

export async function addTrackToPlaylist(playlistId: string, trackId: number): Promise<boolean> {
  const playlists = await getPlaylists();
  const playlist = playlists.find((p) => p.id === playlistId);
  if (!playlist) return false;
  if (playlist.trackIds.includes(trackId)) return true; // duplicate prevention
  playlist.trackIds.push(trackId);
  return savePlaylists(playlists);
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: number): Promise<boolean> {
  const playlists = await getPlaylists();
  const playlist = playlists.find((p) => p.id === playlistId);
  if (!playlist) return false;
  playlist.trackIds = playlist.trackIds.filter((id) => id !== trackId);
  return savePlaylists(playlists);
}

// --- Favorites ---
export async function getFavoriteTrackIds(): Promise<number[]> {
  return readJSON<number[]>(STORAGE_KEYS.FAVORITES, []);
}

export async function setFavoriteTrackIds(ids: number[]): Promise<boolean> {
  return writeJSON(STORAGE_KEYS.FAVORITES, ids);
}

export async function toggleFavorite(trackId: number): Promise<{ favorites: number[]; isFavorite: boolean }> {
  const favorites = await getFavoriteTrackIds();
  const idx = favorites.indexOf(trackId);
  if (idx >= 0) {
    favorites.splice(idx, 1);
  } else {
    favorites.unshift(trackId);
  }
  await setFavoriteTrackIds(favorites);
  return { favorites, isFavorite: idx < 0 };
}

// --- Recently played ---
export async function getRecentTrackIds(): Promise<number[]> {
  return readJSON<number[]>(STORAGE_KEYS.RECENT_TRACKS, []);
}

export async function addRecentTrack(trackId: number): Promise<number[]> {
  const ids = await getRecentTrackIds();
  const filtered = ids.filter((id) => id !== trackId);
  filtered.unshift(trackId);
  const trimmed = filtered.slice(0, RECENT_TRACKS_MAX);
  await writeJSON(STORAGE_KEYS.RECENT_TRACKS, trimmed);
  return trimmed;
}

export async function clearRecentTracks(): Promise<boolean> {
  return writeJSON(STORAGE_KEYS.RECENT_TRACKS, []);
}

// --- Recent searches ---
export async function getRecentSearches(): Promise<string[]> {
  return readJSON<string[]>(STORAGE_KEYS.RECENT_SEARCHES, []);
}

export async function addRecentSearch(term: string): Promise<string[]> {
  const trimmed = term.trim();
  if (!trimmed) return getRecentSearches();
  const searches = await getRecentSearches();
  const filtered = searches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
  filtered.unshift(trimmed);
  const sliced = filtered.slice(0, RECENT_SEARCHES_MAX);
  await writeJSON(STORAGE_KEYS.RECENT_SEARCHES, sliced);
  return sliced;
}

export async function clearRecentSearches(): Promise<boolean> {
  return writeJSON(STORAGE_KEYS.RECENT_SEARCHES, []);
}

// --- Preferences ---
export async function getPreferences(): Promise<AppPreferences> {
  return readJSON<AppPreferences>(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
}

export async function savePreferences(prefs: Partial<AppPreferences>): Promise<AppPreferences> {
  const current = await getPreferences();
  const merged = { ...current, ...prefs };
  await writeJSON(STORAGE_KEYS.PREFERENCES, merged);
  return merged;
}

// --- Data management ---
export async function clearAllData(): Promise<boolean> {
  try {
    const keys = [
      STORAGE_KEYS.PLAYLISTS,
      STORAGE_KEYS.FAVORITES,
      STORAGE_KEYS.RECENT_TRACKS,
      STORAGE_KEYS.RECENT_SEARCHES,
      STORAGE_KEYS.PREFERENCES,
      TRACK_STORE_KEY,
    ];
    await Promise.all(keys.map((k) => AsyncStorage.removeItem(k)));
    return true;
  } catch (err) {
    console.warn('[storage] Failed to clear data:', err);
    return false;
  }
}
