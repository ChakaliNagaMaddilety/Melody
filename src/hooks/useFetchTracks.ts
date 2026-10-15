import { useState, useEffect, useCallback } from 'react';
import { Track } from '@/src/types';
import { fetchTracksByQuery } from '@/src/services/itunesApi';
import { ApiError } from '@/src/services/itunesApi';

interface FetchState {
  tracks: Track[];
  isLoading: boolean;
  error: string | null;
}

export function useFetchTracks(queries: string[], enabled: boolean = true) {
  const [state, setState] = useState<FetchState>({
    tracks: [],
    isLoading: false,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!enabled || queries.length === 0) return;

    let cancelled = false;
    const controller = new AbortController();

    const fetchAll = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const results = await Promise.all(
          queries.map((q) => fetchTracksByQuery(q, { signal: controller.signal, limit: 10 }))
        );

        if (cancelled) return;

        // Flatten and deduplicate by track id
        const seen = new Set<number>();
        const allTracks: Track[] = [];
        for (const tracks of results) {
          for (const track of tracks) {
            if (!seen.has(track.id)) {
              seen.add(track.id);
              allTracks.push(track);
            }
          }
        }

        setState({ tracks: allTracks, isLoading: false, error: null });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.type === 'cancelled') return;
        const message = err instanceof ApiError ? err.message : 'Failed to load music. Pull to retry.';
        setState({ tracks: [], isLoading: false, error: message });
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [queries.join(','), enabled, reloadKey]);

  return { ...state, reload };
}
