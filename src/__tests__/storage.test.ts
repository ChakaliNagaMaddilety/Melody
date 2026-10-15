import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  __INTERNAL__MOCK_STORE__: {},
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// We need to test the storage module which uses AsyncStorage
// Since the real AsyncStorage v3 uses a different internal mechanism,
// we'll create a simple in-memory mock

const mockStore: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStore).forEach((k) => delete mockStore[k]);
  (mockAsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => mockStore[key] || null);
  (mockAsyncStorage.setItem as jest.Mock).mockImplementation(async (key: string, value: string) => {
    mockStore[key] = value;
  });
  (mockAsyncStorage.removeItem as jest.Mock).mockImplementation(async (key: string) => {
    delete mockStore[key];
  });
});

// Import storage functions directly
import {
  getPlaylists,
  createPlaylist,
  renamePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  getFavoriteTrackIds,
  toggleFavorite,
  getRecentTrackIds,
  addRecentTrack,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  getPreferences,
  savePreferences,
  clearAllData,
} from '../services/storage';

const STORAGE_KEYS = {
  PLAYLISTS: 'melody_playlists',
  FAVORITES: 'melody_favorites',
  RECENT_TRACKS: 'melody_recent_tracks',
  RECENT_SEARCHES: 'melody_recent_searches',
  PREFERENCES: 'melody_preferences',
};

describe('Playlist CRUD', () => {
  it('starts with empty playlists', async () => {
    const playlists = await getPlaylists();
    expect(playlists).toEqual([]);
  });

  it('creates a playlist', async () => {
    const playlist = await createPlaylist('My Playlist');
    expect(playlist.name).toBe('My Playlist');
    expect(playlist.id).toBeDefined();
    expect(playlist.trackIds).toEqual([]);
    expect(playlist.createdAt).toBeGreaterThan(0);

    const all = await getPlaylists();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(playlist.id);
  });

  it('renames a playlist', async () => {
    const playlist = await createPlaylist('Old Name');
    const success = await renamePlaylist(playlist.id, 'New Name');
    expect(success).toBe(true);

    const all = await getPlaylists();
    expect(all[0].name).toBe('New Name');
  });

  it('returns false when renaming non-existent playlist', async () => {
    const success = await renamePlaylist('fake_id', 'Name');
    expect(success).toBe(false);
  });

  it('deletes a playlist', async () => {
    const p1 = await createPlaylist('Playlist 1');
    const p2 = await createPlaylist('Playlist 2');
    const success = await deletePlaylist(p1.id);
    expect(success).toBe(true);

    const all = await getPlaylists();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(p2.id);
  });

  it('adds track to playlist without duplicates', async () => {
    const playlist = await createPlaylist('Test');
    await addTrackToPlaylist(playlist.id, 100);
    await addTrackToPlaylist(playlist.id, 100); // duplicate
    await addTrackToPlaylist(playlist.id, 200);

    const all = await getPlaylists();
    expect(all[0].trackIds).toEqual([100, 200]);
  });

  it('removes track from playlist', async () => {
    const playlist = await createPlaylist('Test');
    await addTrackToPlaylist(playlist.id, 100);
    await addTrackToPlaylist(playlist.id, 200);
    await removeTrackFromPlaylist(playlist.id, 100);

    const all = await getPlaylists();
    expect(all[0].trackIds).toEqual([200]);
  });
});

describe('Favorites', () => {
  it('starts with empty favorites', async () => {
    const favs = await getFavoriteTrackIds();
    expect(favs).toEqual([]);
  });

  it('toggles favorite on', async () => {
    const result = await toggleFavorite(123);
    expect(result.isFavorite).toBe(true);
    expect(result.favorites).toContain(123);
  });

  it('toggles favorite off', async () => {
    await toggleFavorite(123);
    const result = await toggleFavorite(123);
    expect(result.isFavorite).toBe(false);
    expect(result.favorites).not.toContain(123);
  });

  it('prepends new favorites', async () => {
    await toggleFavorite(1);
    await toggleFavorite(2);
    const favs = await getFavoriteTrackIds();
    expect(favs[0]).toBe(2);
    expect(favs[1]).toBe(1);
  });
});

describe('Recently played', () => {
  it('adds recent track and prepends', async () => {
    await addRecentTrack(10);
    await addRecentTrack(20);
    const ids = await getRecentTrackIds();
    expect(ids[0]).toBe(20);
    expect(ids[1]).toBe(10);
  });

  it('does not duplicate recent tracks', async () => {
    await addRecentTrack(10);
    await addRecentTrack(20);
    await addRecentTrack(10); // move to front
    const ids = await getRecentTrackIds();
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBe(10);
    expect(ids[1]).toBe(20);
  });
});

describe('Recent searches', () => {
  it('adds recent search', async () => {
    await addRecentSearch('rock');
    const searches = await getRecentSearches();
    expect(searches).toContain('rock');
  });

  it('removes duplicates and prepends', async () => {
    await addRecentSearch('jazz');
    await addRecentSearch('pop');
    await addRecentSearch('jazz');
    const searches = await getRecentSearches();
    expect(searches).toHaveLength(2);
    expect(searches[0]).toBe('jazz');
    expect(searches[1]).toBe('pop');
  });

  it('clears recent searches', async () => {
    await addRecentSearch('test');
    await clearRecentSearches();
    const searches = await getRecentSearches();
    expect(searches).toEqual([]);
  });
});

describe('Preferences', () => {
  it('returns default preferences on first load', async () => {
    const prefs = await getPreferences();
    expect(prefs.shuffle).toBe(false);
    expect(prefs.repeat).toBe('off');
    expect(prefs.volume).toBe(1.0);
  });

  it('saves and merges preferences', async () => {
    await savePreferences({ shuffle: true });
    const prefs = await getPreferences();
    expect(prefs.shuffle).toBe(true);
    expect(prefs.repeat).toBe('off'); // unchanged
  });
});

describe('clearAllData', () => {
  it('removes all stored data', async () => {
    await createPlaylist('Test');
    await toggleFavorite(1);
    await addRecentSearch('query');
    await savePreferences({ shuffle: true });

    const success = await clearAllData();
    expect(success).toBe(true);

    expect(await getPlaylists()).toEqual([]);
    expect(await getFavoriteTrackIds()).toEqual([]);
    expect(await getRecentSearches()).toEqual([]);
  });
});
