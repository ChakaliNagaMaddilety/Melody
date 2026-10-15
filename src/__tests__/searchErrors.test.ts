import { ApiError } from '../services/itunesApi';
import { searchMusic } from '../services/itunesApi';

// Mock global fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('searchMusic error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws network error when fetch rejects', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new TypeError('Failed to fetch'));
    try {
      await searchMusic('test query');
      fail('Should have thrown');
    } catch (err) {
      expect(err instanceof ApiError).toBe(true);
      expect((err as ApiError).type).toBe('network');
    }
  });

  it('throws network error on non-ok response', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as unknown as Response);
    await expect(searchMusic('test')).rejects.toThrow(ApiError);
  });

  it('throws parse error when JSON parsing fails', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => { throw new SyntaxError('Unexpected token'); },
    } as unknown as Response);
    try {
      await searchMusic('test');
      fail('Should have thrown');
    } catch (err) {
      expect(err instanceof ApiError).toBe(true);
      expect((err as ApiError).type).toBe('parse');
    }
  });

  it('throws empty error for short search terms', async () => {
    try {
      await searchMusic('a');
      fail('Should have thrown');
    } catch (err) {
      expect(err instanceof ApiError).toBe(true);
      expect((err as ApiError).type).toBe('empty');
    }
  });
});

describe('ApiError', () => {
  it('creates error with correct type and message', () => {
    const err = new ApiError('Something went wrong', 'network');
    expect(err.message).toBe('Something went wrong');
    expect(err.type).toBe('network');
    expect(err.name).toBe('ApiError');
  });

  it('defaults to network type', () => {
    const err = new ApiError('Default error');
    expect(err.type).toBe('network');
  });
});
