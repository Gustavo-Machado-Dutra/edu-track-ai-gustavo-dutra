import type { ApiResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const ACCESS_TOKEN_KEY = 'edutrack.accessToken';
const REFRESH_TOKEN_KEY = 'edutrack.refreshToken';
export const AUTH_SESSION_EXPIRED_EVENT = 'edutrack:session-expired';

type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: unknown;
};

let refreshPromise: Promise<boolean> | null = null;

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function saveSession(tokens: { accessToken: string; refreshToken: string }) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearSession() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function getRefreshToken() {
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

function isAuthenticationPath(path: string) {
  return ['/auth/login', '/auth/register', '/auth/refresh'].includes(path);
}

function notifySessionExpired() {
  clearSession();
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const body = await response.text();

  if (!body.trim()) {
    return {
      error: {
        statusCode: response.status,
        message:
          response.status >= 500
            ? 'A API não respondeu. Confirme que o servidor está em execução.'
            : 'A API retornou uma resposta vazia.',
      },
    } as ApiResponse<T>;
  }

  try {
    return JSON.parse(body) as ApiResponse<T>;
  } catch {
    return {
      error: {
        statusCode: response.status,
        message: 'A API retornou uma resposta inválida.',
      },
    } as ApiResponse<T>;
  }
}

async function refreshSession() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const result = await parseResponse<AuthSession>(response);

    if (
      response.status < 200 ||
      response.status >= 300 ||
      result.error ||
      !result.data?.accessToken ||
      !result.data.refreshToken
    ) {
      return false;
    }

    saveSession(result.data);
    return true;
  } catch {
    return false;
  }
}

function refreshSessionOnce() {
  refreshPromise ??= refreshSession().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function request<T>(path: string, init: RequestInit, canRefresh: boolean): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Não foi possível conectar à API. Confirme que o servidor está em execução.');
    }

    throw error;
  }

  if (response.status === 401 && canRefresh && !isAuthenticationPath(path)) {
    if (await refreshSessionOnce()) {
      return request(path, init, false);
    }

    notifySessionExpired();
  }

  return parseResponse<T>(response);
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  return request(path, init, true);
}

export async function login(credentials: { email: string; password: string }) {
  const response = await apiRequest<{
    accessToken: string;
    refreshToken: string;
    user: unknown;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (!response.error) {
    saveSession(response.data);
  }

  return response;
}

export async function register(credentials: { name: string; email: string; password: string }) {
  const response = await apiRequest<{
    accessToken: string;
    refreshToken: string;
    user: unknown;
  }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (!response.error) {
    saveSession(response.data);
  }

  return response;
}
