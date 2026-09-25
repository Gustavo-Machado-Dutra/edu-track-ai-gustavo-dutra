import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_SESSION_EXPIRED_EVENT, ApiClientError, apiRequest, chatWithAgent } from './api';

describe('apiRequest', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();

    vi.stubGlobal('window', {
      localStorage: {
        getItem: vi.fn((key: string) => storage.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
        removeItem: vi.fn((key: string) => storage.delete(key)),
      },
      dispatchEvent: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses the local API proxy by default', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { status: 'ok' } }), {
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/health');

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/health', expect.any(Object));
  });

  it('explains when the API cannot be reached with ApiClientError and NETWORK_ERROR', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(apiRequest('/health')).rejects.toThrow(ApiClientError);
    await expect(apiRequest('/health')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      message: 'Não foi possível conectar à API. Confirme que o servidor está em execução.',
    });
  });

  it('returns a useful error when the API response is empty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    await expect(apiRequest('/health')).resolves.toEqual({
      error: {
        statusCode: 500,
        code: 'SERVER_UNAVAILABLE',
        message: 'A API não respondeu. Confirme que o servidor está em execução.',
      },
    });
  });

  it('correctly parses 429 quota errors from provider', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            statusCode: 429,
            code: 'PROVIDER_QUOTA',
            message: 'O limite de uso do provedor de IA foi temporariamente atingido.',
          },
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await chatWithAgent('Hello');

    expect(result.error).toBeDefined();
    expect(result.error?.statusCode).toBe(429);
    expect(result.error?.code).toBe('PROVIDER_QUOTA');
    expect(result.error?.message).toContain('limite de uso');
  });

  it('correctly parses 503 provider unavailable errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            statusCode: 503,
            code: 'PROVIDER_UNAVAILABLE',
            message: 'O provedor de inteligência artificial está temporariamente indisponível.',
          },
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await chatWithAgent('Hello');

    expect(result.error).toBeDefined();
    expect(result.error?.statusCode).toBe(503);
    expect(result.error?.code).toBe('PROVIDER_UNAVAILABLE');
  });

  it('refreshes the session and retries a protected request after a 401', async () => {
    window.localStorage.setItem('edutrack.accessToken', 'expired-token');
    window.localStorage.setItem('edutrack.refreshToken', 'refresh-token');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { statusCode: 401, message: 'Unauthorized' } }), {
          status: 401,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { accessToken: 'new-access-token', refreshToken: 'new-refresh-token', user: {} },
          }),
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] })));
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/subjects');

    expect(fetchMock).toHaveBeenCalledTimes(3);
    const refreshRequest = fetchMock.mock.calls[1];
    const retryRequest = fetchMock.mock.calls[2];
    expect(refreshRequest?.[0]).toBe('/api/v1/auth/refresh');
    expect(new Headers(retryRequest?.[1]?.headers).get('Authorization')).toBe(
      'Bearer new-access-token',
    );
  });

  it('clears the session and emits an expiration event when refresh fails', async () => {
    window.localStorage.setItem('edutrack.accessToken', 'expired-token');
    window.localStorage.setItem('edutrack.refreshToken', 'invalid-refresh-token');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { statusCode: 401, message: 'Unauthorized' } }), {
          status: 401,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { statusCode: 401, message: 'Sessão inválida' } }), {
          status: 401,
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/subjects');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(window.localStorage.getItem('edutrack.accessToken')).toBeNull();
    expect(window.localStorage.getItem('edutrack.refreshToken')).toBeNull();
    expect(window.dispatchEvent).toHaveBeenCalledWith(new Event(AUTH_SESSION_EXPIRED_EVENT));
  });

  it('does not refresh authentication endpoints after a 401', async () => {
    window.localStorage.setItem('edutrack.refreshToken', 'refresh-token');

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { statusCode: 401, message: 'Credenciais inválidas' } }), {
        status: 401,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/auth/login', { method: 'POST' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem('edutrack.refreshToken')).toBe('refresh-token');
  });

  it('posts a chat message to the real Agent endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            conversationId: 'conversation-123',
            response: { type: 'text', content: 'validated response' },
          },
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await chatWithAgent('How am I doing?', 'conversation-123');

    expect(result.data.conversationId).toBe('conversation-123');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/ai/chat',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'How am I doing?', conversationId: 'conversation-123' }),
      }),
    );
  });
});
