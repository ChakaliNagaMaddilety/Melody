import React, { createContext, useContext, useCallback, useEffect, useRef, useState, ReactNode } from 'react';
import { Track, RepeatMode, PlayerState, AppPreferences } from '@/src/types';
import { audioPlayer, PlayerStatus } from '@/src/services/audioPlayer';
import * as storage from '@/src/services/storage';
import { DEFAULT_PREFERENCES } from '@/src/services/storage';

interface PlayerContextValue {
  playerState: PlayerState;
  preferences: AppPreferences;
  isPlayerVisible: boolean;
  showPlayer: () => void;
  hidePlayer: () => void;
  playTrack: (track: Track, queue?: Track[]) => void;
  playQueue: (tracks: Track[], startIndex: number) => void;
  togglePlayPause: () => void;
  next: () => void;
  prev: () => void;
  seekTo: (positionMs: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setVolume: (volume: number) => void;
  removeFromQueue: (index: number) => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
}

const initialState: PlayerState = {
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  positionMs: 0,
  durationMs: 0,
  shuffle: false,
  repeat: 'off',
  isLoading: false,
  error: null,
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playerState, setPlayerState] = useState<PlayerState>(initialState);
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const stateRef = useRef(playerState);
  const prefsRef = useRef(preferences);

  // Keep refs in sync
  useEffect(() => {
    stateRef.current = playerState;
  }, [playerState]);

  useEffect(() => {
    prefsRef.current = preferences;
  }, [preferences]);

  // Load preferences on mount
  useEffect(() => {
    storage.getPreferences().then((prefs) => {
      setPreferences(prefs);
      setPlayerState((prev) => ({
        ...prev,
        shuffle: prefs.shuffle,
        repeat: prefs.repeat,
      }));
    });
  }, []);

  // Subscribe to audio player status
  useEffect(() => {
    audioPlayer.onStatusChange((status: PlayerStatus) => {
      setPlayerState((prev) => ({
        ...prev,
        isPlaying: status.isPlaying,
        positionMs: status.positionMs,
        durationMs: status.durationMs || prev.durationMs,
        isLoading: false,
        error: status.error,
      }));

      // Handle track completion
      if (status.isLoaded && status.positionMs > 0 && status.durationMs > 0) {
        if (status.positionMs >= status.durationMs - 300 && !status.isPlaying) {
          handleTrackEnd();
        }
      }
    });

    return () => {
      audioPlayer.stopAndRelease();
    };
  }, []);

  const handleTrackEnd = useCallback(() => {
    const state = stateRef.current;
    if (state.repeat === 'one') {
      if (state.currentTrack) {
        audioPlayer.loadTrack(state.currentTrack, true);
      }
      return;
    }

    const queue = state.queue;
    let nextIndex = state.queueIndex + 1;

    if (nextIndex >= queue.length) {
      if (state.repeat === 'all' && queue.length > 0) {
        nextIndex = 0;
      } else {
        setPlayerState((prev) => ({ ...prev, isPlaying: false }));
        return;
      }
    }

    if (nextIndex < queue.length) {
      const nextTrack = queue[nextIndex];
      setPlayerState((prev) => ({ ...prev, queueIndex: nextIndex, currentTrack: nextTrack }));
      audioPlayer.loadTrack(nextTrack, true);
      storage.addRecentTrack(nextTrack.id);
      storage.saveTracks([nextTrack]);
    }
  }, []);

  const playTrackInternal = useCallback((track: Track, queue: Track[], index: number) => {
    setPlayerState((prev) => ({
      ...prev,
      currentTrack: track,
      queue,
      queueIndex: index,
      isLoading: true,
      error: null,
      positionMs: 0,
      durationMs: track.durationMs || 0,
    }));
    audioPlayer.loadTrack(track, true);
    storage.addRecentTrack(track.id);
    storage.saveTracks([track]);
  }, []);

  const playTrack = useCallback((track: Track, queue?: Track[]) => {
    const fullQueue = queue && queue.length > 0 ? queue : [track];
    const index = fullQueue.findIndex((t) => t.id === track.id);
    playTrackInternal(track, fullQueue, index >= 0 ? index : 0);
  }, [playTrackInternal]);

  const playQueue = useCallback((tracks: Track[], startIndex: number) => {
    if (tracks.length === 0) return;
    const state = stateRef.current;
    let queue = tracks;
    let index = startIndex;

    if (state.shuffle) {
      const startTrack = tracks[startIndex];
      const rest = tracks.filter((_, i) => i !== startIndex);
      queue = [startTrack, ...shuffleArray(rest)];
      index = 0;
    }

    playTrackInternal(queue[index], queue, index);
  }, [playTrackInternal]);

  const togglePlayPause = useCallback(() => {
    audioPlayer.togglePlayPause();
  }, []);

  const next = useCallback(() => {
    const state = stateRef.current;
    if (state.queue.length === 0) return;

    let nextIndex = state.queueIndex + 1;
    if (nextIndex >= state.queue.length) {
      if (state.repeat === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }

    const nextTrack = state.queue[nextIndex];
    setPlayerState((prev) => ({
      ...prev,
      currentTrack: nextTrack,
      queueIndex: nextIndex,
      isLoading: true,
      error: null,
      positionMs: 0,
    }));
    audioPlayer.loadTrack(nextTrack, true);
    storage.addRecentTrack(nextTrack.id);
    storage.saveTracks([nextTrack]);
  }, []);

  const prev = useCallback(() => {
    const state = stateRef.current;
    if (state.queue.length === 0) return;

    // If more than 3 seconds in, restart current track
    if (state.positionMs > 3000) {
      audioPlayer.seekTo(0);
      return;
    }

    let prevIndex = state.queueIndex - 1;
    if (prevIndex < 0) {
      if (state.repeat === 'all') {
        prevIndex = state.queue.length - 1;
      } else {
        audioPlayer.seekTo(0);
        return;
      }
    }

    const prevTrack = state.queue[prevIndex];
    setPlayerState((prev) => ({
      ...prev,
      currentTrack: prevTrack,
      queueIndex: prevIndex,
      isLoading: true,
      error: null,
      positionMs: 0,
    }));
    audioPlayer.loadTrack(prevTrack, true);
    storage.addRecentTrack(prevTrack.id);
    storage.saveTracks([prevTrack]);
  }, []);

  const seekTo = useCallback((positionMs: number) => {
    audioPlayer.seekTo(positionMs);
  }, []);

  const toggleShuffle = useCallback(() => {
    setPlayerState((prev) => {
      const newShuffle = !prev.shuffle;
      let newQueue = prev.queue;
      let newIndex = prev.queueIndex;

      if (newShuffle && prev.queue.length > 0 && prev.currentTrack) {
        const current = prev.currentTrack;
        const rest = prev.queue.filter((t) => t.id !== current.id);
        newQueue = [current, ...shuffleArray(rest)];
        newIndex = 0;
      } else if (!newShuffle && prev.queue.length > 0 && prev.currentTrack) {
        // Restore original order - find by track id in the shuffled queue
        // We can't perfectly restore, so just keep as-is but unshuffle future plays
      }

      const prefs = { ...prefsRef.current, shuffle: newShuffle };
      storage.savePreferences({ shuffle: newShuffle });
      setPreferences(prefs);

      return { ...prev, shuffle: newShuffle, queue: newQueue, queueIndex: newIndex };
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setPlayerState((prev) => {
      const order: RepeatMode[] = ['off', 'all', 'one'];
      const currentIdx = order.indexOf(prev.repeat);
      const newRepeat = order[(currentIdx + 1) % order.length];
      storage.savePreferences({ repeat: newRepeat });
      setPreferences({ ...prefsRef.current, repeat: newRepeat });
      return { ...prev, repeat: newRepeat };
    });
  }, []);

  const setVolume = useCallback((volume: number) => {
    audioPlayer.setVolume(volume);
    storage.savePreferences({ volume });
    setPreferences((prev) => ({ ...prev, volume }));
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setPlayerState((prev) => {
      if (index < 0 || index >= prev.queue.length) return prev;
      const newQueue = prev.queue.filter((_, i) => i !== index);
      let newIndex = prev.queueIndex;
      if (index < prev.queueIndex) {
        newIndex = prev.queueIndex - 1;
      } else if (index === prev.queueIndex) {
        // Current track removed
        newIndex = Math.min(newIndex, newQueue.length - 1);
        if (newIndex >= 0) {
          const newTrack = newQueue[newIndex];
          audioPlayer.loadTrack(newTrack, true);
          return { ...prev, queue: newQueue, queueIndex: newIndex, currentTrack: newTrack };
        }
        return { ...prev, queue: newQueue, queueIndex: -1, currentTrack: null, isPlaying: false };
      }
      return { ...prev, queue: newQueue, queueIndex: newIndex };
    });
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setPlayerState((prev) => {
      const newQueue = [...prev.queue, track];
      storage.saveTracks([track]);
      return { ...prev, queue: newQueue };
    });
  }, []);

  const clearQueue = useCallback(() => {
    setPlayerState((prev) => {
      if (prev.currentTrack) {
        return { ...prev, queue: [prev.currentTrack], queueIndex: 0 };
      }
      return { ...prev, queue: [], queueIndex: -1 };
    });
  }, []);

  const showPlayer = useCallback(() => setIsPlayerVisible(true), []);
  const hidePlayer = useCallback(() => setIsPlayerVisible(false), []);

  const value: PlayerContextValue = {
    playerState,
    preferences,
    isPlayerVisible,
    showPlayer,
    hidePlayer,
    playTrack,
    playQueue,
    togglePlayPause,
    next,
    prev,
    seekTo,
    toggleShuffle,
    cycleRepeat,
    setVolume,
    removeFromQueue,
    addToQueue,
    clearQueue,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return ctx;
}
