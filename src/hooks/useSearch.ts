import { useState, useEffect, useRef, useCallback } from 'react';
import { Track, SearchResult } from '@/src/types';
import { searchMusic, ApiError } from '@/src/services/itunesApi';
import { SEARCH_DEBOUNCE_MS } from '@/src/constants/config';

interface UseSearchState {
  query: string;
  results: Track[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

export function useSearch() {
  const [state, setState] = useState<UseSearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false,
  });

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (term: string) => {
    const trimmed = term.trim();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    if (trimmed.length < 2) {
      setState({
        query: term,
        results: [],
        isLoading: false,
        error: null,
        hasSearched: false,
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      query: term,
      isLoading: true,
      error: null,
    }));

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const result: SearchResult = await searchMusic(trimmed, {
          signal: controller.signal,
          limit: 25,
        });
        setState({
          query: term,
          results: result.tracks,
          isLoading: false,
          error: null,
          hasSearched: true,
        });
      } catch (err) {
        if (err instanceof ApiError && err.type === 'cancelled') {
          return;
        }
        const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
        setState({
          query: term,
          results: [],
          isLoading: false,
          error: message,
          hasSearched: true,
        });
      }
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  const clearSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();
    setState({
      query: '',
      results: [],
      isLoading: false,
      error: null,
      hasSearched: false,
    });
  }, []);

  const retry = useCallback(() => {
    if (state.query.trim().length >= 2) {
      search(state.query);
    }
  }, [state.query, search]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { ...state, search, clearSearch, retry };
}
