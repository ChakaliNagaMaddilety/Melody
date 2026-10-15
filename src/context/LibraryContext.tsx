import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { Track, Playlist } from '@/src/types';
import * as storage from '@/src/services/storage';

interface LibraryContextValue {
  playlists: Playlist[];
  favoriteTrackIds: number[];
  recentTrackIds: number[];
  recentSearches: string[];
  isLoading: boolean;
  createPlaylist: (name: string) => Promise<Playlist | null>;
  renamePlaylist: (id: string, newName: string) => Promise<boolean>;
  deletePlaylist: (id: string) => Promise<boolean>;
  addTrackToPlaylist: (playlistId: string, trackId: number) => Promise<boolean>;
  removeTrackFromPlaylist: (playlistId: string, trackId: number) => Promise<boolean>;
  toggleFavorite: (trackId: number) => Promise<void>;
  isFavorite: (trackId: number) => boolean;
  addRecentSearch: (term: string) => Promise<void>;
  clearRecentSearches: () => Promise<void>;
  clearRecentTracks: () => Promise<void>;
  clearAllData: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<number[]>([]);
  const [recentTrackIds, setRecentTrackIds] = useState<number[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [pls, favs, recents, searches] = await Promise.all([
      storage.getPlaylists(),
      storage.getFavoriteTrackIds(),
      storage.getRecentTrackIds(),
      storage.getRecentSearches(),
    ]);
    setPlaylists(pls);
    setFavoriteTrackIds(favs);
    setRecentTrackIds(recents);
    setRecentSearches(searches);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createPlaylist = useCallback(async (name: string): Promise<Playlist | null> => {
    if (!name.trim()) return null;
    const playlist = await storage.createPlaylist(name);
    setPlaylists((prev) => [...prev, playlist]);
    return playlist;
  }, []);

  const renamePlaylist = useCallback(async (id: string, newName: string): Promise<boolean> => {
    if (!newName.trim()) return false;
    const success = await storage.renamePlaylist(id, newName);
    if (success) {
      setPlaylists((prev) => prev.map((p) => (p.id === id ? { ...p, name: newName.trim() } : p)));
    }
    return success;
  }, []);

  const deletePlaylist = useCallback(async (id: string): Promise<boolean> => {
    const success = await storage.deletePlaylist(id);
    if (success) {
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
    }
    return success;
  }, []);

  const addTrackToPlaylist = useCallback(async (playlistId: string, trackId: number): Promise<boolean> => {
    const success = await storage.addTrackToPlaylist(playlistId, trackId);
    if (success) {
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlistId
            ? { ...p, trackIds: p.trackIds.includes(trackId) ? p.trackIds : [...p.trackIds, trackId] }
            : p
        )
      );
    }
    return success;
  }, []);

  const removeTrackFromPlaylist = useCallback(async (playlistId: string, trackId: number): Promise<boolean> => {
    const success = await storage.removeTrackFromPlaylist(playlistId, trackId);
    if (success) {
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlistId ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) } : p
        )
      );
    }
    return success;
  }, []);

  const toggleFavorite = useCallback(async (trackId: number): Promise<void> => {
    const result = await storage.toggleFavorite(trackId);
    setFavoriteTrackIds(result.favorites);
  }, []);

  const isFavorite = useCallback((trackId: number): boolean => favoriteTrackIds.includes(trackId), [favoriteTrackIds]);

  const addRecentSearch = useCallback(async (term: string): Promise<void> => {
    const searches = await storage.addRecentSearch(term);
    setRecentSearches(searches);
  }, []);

  const clearRecentSearches = useCallback(async (): Promise<void> => {
    await storage.clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const clearRecentTracks = useCallback(async (): Promise<void> => {
    await storage.clearRecentTracks();
    setRecentTrackIds([]);
  }, []);

  const clearAllData = useCallback(async (): Promise<boolean> => {
    const success = await storage.clearAllData();
    if (success) {
      setPlaylists([]);
      setFavoriteTrackIds([]);
      setRecentTrackIds([]);
      setRecentSearches([]);
    }
    return success;
  }, []);

  const value: LibraryContextValue = {
    playlists,
    favoriteTrackIds,
    recentTrackIds,
    recentSearches,
    isLoading,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    toggleFavorite,
    isFavorite,
    addRecentSearch,
    clearRecentSearches,
    clearRecentTracks,
    clearAllData,
    refresh,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return ctx;
}
