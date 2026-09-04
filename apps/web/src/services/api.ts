import type { ApiResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3333/api/v1';
const ACCESS_TOKEN_KEY = 'edutrack.accessToken';
const REFRESH_TOKEN_KEY = 'edutrack.refreshToken';

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

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  return response.json();
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
