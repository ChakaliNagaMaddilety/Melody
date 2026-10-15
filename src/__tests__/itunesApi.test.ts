import { parseITunesResult, parseSearchResponse, ApiError } from '../services/itunesApi';
import { iTunesResult } from '../types';

describe('parseITunesResult', () => {
  const validResult: iTunesResult = {
    trackId: 12345,
    trackName: 'Test Song',
    artistName: 'Test Artist',
    collectionName: 'Test Album',
    artworkUrl100: 'https://example.com/image100x100.jpg',
    previewUrl: 'https://example.com/preview.m4a',
    trackTimeMillis: 30000,
    collectionId: 67890,
    primaryGenreName: 'Pop',
    releaseDate: '2023-01-15',
    wrapperType: 'track',
    kind: 'song',
  };

  it('parses a valid track result', () => {
    const track = parseITunesResult(validResult);
    expect(track).not.toBeNull();
    expect(track!.id).toBe(12345);
    expect(track!.title).toBe('Test Song');
    expect(track!.artist).toBe('Test Artist');
    expect(track!.album).toBe('Test Album');
    expect(track!.artworkUrl).toBe('https://example.com/image600x600.jpg');
    expect(track!.previewUrl).toBe('https://example.com/preview.m4a');
    expect(track!.durationMs).toBe(30000);
    expect(track!.collectionId).toBe(67890);
    expect(track!.genre).toBe('Pop');
  });

  it('returns null when trackId is missing', () => {
    const track = parseITunesResult({ ...validResult, trackId: undefined });
    expect(track).toBeNull();
  });

  it('returns null when trackName is missing', () => {
    const track = parseITunesResult({ ...validResult, trackName: undefined });
    expect(track).toBeNull();
  });

  it('returns null when artistName is missing', () => {
    const track = parseITunesResult({ ...validResult, artistName: undefined });
    expect(track).toBeNull();
  });

  it('uses Unknown Album when collectionName is missing', () => {
    const track = parseITunesResult({ ...validResult, collectionName: undefined });
    expect(track).not.toBeNull();
    expect(track!.album).toBe('Unknown Album');
  });

  it('sets previewUrl to null when missing', () => {
    const track = parseITunesResult({ ...validResult, previewUrl: undefined });
    expect(track).not.toBeNull();
    expect(track!.previewUrl).toBeNull();
  });

  it('sets durationMs to null when trackTimeMillis is missing', () => {
    const track = parseITunesResult({ ...validResult, trackTimeMillis: undefined });
    expect(track).not.toBeNull();
    expect(track!.durationMs).toBeNull();
  });

  it('returns empty string for artwork when artworkUrl100 is missing', () => {
    const track = parseITunesResult({ ...validResult, artworkUrl100: undefined });
    expect(track).not.toBeNull();
    expect(track!.artworkUrl).toBe('');
  });

  it('upgrades artwork URL from 100x100 to 600x600', () => {
    const track = parseITunesResult(validResult);
    expect(track!.artworkUrl).toContain('600x600');
    expect(track!.artworkUrl).not.toContain('100x100');
  });
});

describe('parseSearchResponse', () => {
  it('parses a valid response with results', () => {
    const data = {
      resultCount: 2,
      results: [
        {
          trackId: 1,
          trackName: 'Song A',
          artistName: 'Artist A',
          collectionName: 'Album A',
          artworkUrl100: 'https://example.com/a100x100.jpg',
          previewUrl: 'https://example.com/a.m4a',
          trackTimeMillis: 30000,
          wrapperType: 'track',
          kind: 'song',
        },
        {
          trackId: 2,
          trackName: 'Song B',
          artistName: 'Artist B',
          collectionName: 'Album B',
          artworkUrl100: 'https://example.com/b100x100.jpg',
          previewUrl: 'https://example.com/b.m4a',
          trackTimeMillis: 25000,
          wrapperType: 'track',
          kind: 'song',
        },
      ],
    };

    const result = parseSearchResponse(data);
    expect(result.tracks).toHaveLength(2);
    expect(result.totalCount).toBe(2);
    expect(result.tracks[0].title).toBe('Song A');
    expect(result.tracks[1].title).toBe('Song B');
  });

  it('filters out invalid results', () => {
    const data = {
      resultCount: 3,
      results: [
        { trackId: 1, trackName: 'Valid', artistName: 'Artist', wrapperType: 'track', kind: 'song' },
        { trackId: undefined, trackName: 'Invalid', artistName: 'Artist' },
        { artistName: 'No track info' },
      ],
    };

    const result = parseSearchResponse(data);
    expect(result.tracks).toHaveLength(1);
    expect(result.tracks[0].title).toBe('Valid');
  });

  it('handles empty results array', () => {
    const data = { resultCount: 0, results: [] };
    const result = parseSearchResponse(data);
    expect(result.tracks).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });

  it('throws ApiError for invalid response format', () => {
    expect(() => parseSearchResponse(null)).toThrow(ApiError);
    expect(() => parseSearchResponse('not an object')).toThrow(ApiError);
    expect(() => parseSearchResponse(undefined)).toThrow(ApiError);
  });

  it('handles missing results array gracefully', () => {
    const data = { resultCount: 0 };
    const result = parseSearchResponse(data);
    expect(result.tracks).toHaveLength(0);
  });

  it('handles non-number resultCount', () => {
    const data = { resultCount: 'invalid', results: [] };
    const result = parseSearchResponse(data);
    expect(result.totalCount).toBe(0);
  });
});
