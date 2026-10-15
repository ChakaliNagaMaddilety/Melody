import { Track, iTunesResult, SearchResult } from '@/src/types';
import { ITUNES_API_URL, ITUNES_LOOKUP_URL } from '@/src/constants/config';

export class ApiError extends Error {
  constructor(message: string, public readonly type: 'network' | 'parse' | 'empty' | 'cancelled' = 'network') {
    super(message);
    this.name = 'ApiError';
  }
}

function highResArtwork(url: string | undefined): string {
  if (!url) return '';
  return url.replace('100x100', '600x600');
}

export function parseITunesResult(raw: iTunesResult): Track | null {
  if (!raw.trackId || !raw.trackName || !raw.artistName) return null;
  if (raw.wrapperType === 'track' || raw.kind === 'song' || raw.previewUrl) {
    return {
      id: raw.trackId,
      title: raw.trackName,
      artist: raw.artistName,
      album: raw.collectionName || 'Unknown Album',
      artworkUrl: highResArtwork(raw.artworkUrl100),
      previewUrl: raw.previewUrl || null,
      durationMs: raw.trackTimeMillis || null,
      collectionId: raw.collectionId,
      genre: raw.primaryGenreName,
      releaseDate: raw.releaseDate,
    };
  }
  return null;
}

export function parseSearchResponse(data: unknown): SearchResult {
  if (!data || typeof data !== 'object') {
    throw new ApiError('Invalid response format', 'parse');
  }
  const obj = data as Record<string, unknown>;
  const results = Array.isArray(obj.results) ? obj.results : [];
  const tracks: Track[] = [];
  for (const raw of results) {
    const track = parseITunesResult(raw as iTunesResult);
    if (track) tracks.push(track);
  }
  return {
    tracks,
    totalCount: typeof obj.resultCount === 'number' ? obj.resultCount : tracks.length,
  };
}

interface SearchOptions {
  signal?: AbortSignal;
  limit?: number;
  country?: string;
}

export async function searchMusic(term: string, options: SearchOptions = {}): Promise<SearchResult> {
  const trimmed = term.trim();
  if (trimmed.length < 2) {
    throw new ApiError('Search term too short', 'empty');
  }

  const params = new URLSearchParams({
    term: trimmed,
    media: 'music',
    entity: 'song',
    limit: String(options.limit || 25),
    country: options.country || 'US',
  });

  const url = `${ITUNES_API_URL}?${params.toString()}`;
  let response: Response;

  try {
    response = await fetch(url, {
      signal: options.signal,
      headers: { Accept: 'application/json' },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request cancelled', 'cancelled');
    }
    throw new ApiError('Network error. Check your connection and try again.', 'network');
  }

  if (!response.ok) {
    throw new ApiError(`Server error (${response.status}). Please try again.`, 'network');
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError('Failed to parse response data', 'parse');
  }

  return parseSearchResponse(data);
}

export async function lookupTracks(ids: number[], options: SearchOptions = {}): Promise<Track[]> {
  if (ids.length === 0) return [];

  const params = new URLSearchParams({
    id: ids.join(','),
    entity: 'song',
  });

  const url = `${ITUNES_LOOKUP_URL}?${params.toString()}`;
  let response: Response;

  try {
    response = await fetch(url, {
      signal: options.signal,
      headers: { Accept: 'application/json' },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request cancelled', 'cancelled');
    }
    throw new ApiError('Network error', 'network');
  }

  if (!response.ok) {
    throw new ApiError(`Server error (${response.status})`, 'network');
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError('Failed to parse response', 'parse');
  }

  const result = parseSearchResponse(data);
  return result.tracks;
}

export async function fetchTracksByQuery(
  query: string,
  options: SearchOptions = {}
): Promise<Track[]> {
  const result = await searchMusic(query, options);
  return result.tracks;
}
