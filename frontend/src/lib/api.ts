export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{ path?: string; message: string }>;
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly errors?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

export const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return 'https://craftywrap.onrender.com/api';
    }
  }
  return 'http://localhost:5000/api';
};

export const getAppUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return envUrl.replace(/\/+$/, '');
};

function parseResponseBody(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string; cartToken?: string } = {},
): Promise<T> {
  const { token, cartToken, headers, body, ...requestOptions } = options;
  const isFormData = body instanceof FormData;
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${baseUrl}${normalizedPath}`;

  try {
    const response = await fetch(fullUrl, {
      ...requestOptions,
      body,
      credentials: 'include',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(cartToken ? { 'X-Cart-Token': cartToken } : {}),
        ...headers,
      },
    });
    const rawBody = await response.text();
    const parsed = parseResponseBody(rawBody) as Partial<ApiResponse<T>> | undefined;
    if (!response.ok || !parsed?.success) {
      throw new ApiError(response.status, parsed?.message ?? 'Unable to complete the request.', parsed?.errors);
    }
    return parsed.data as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`[API Request Error] Failed to fetch ${fullUrl}:`, error);
    throw new ApiError(
      0,
      `Network error: Unable to connect to CraftyWrap server. Please check network or CORS settings. (${error?.message || 'Failed to fetch'})`,
    );
  }
}

export function getStoredAccessToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem('craftywrap_access_token') ?? undefined;
}

export function setStoredAccessToken(token: string): void {
  window.localStorage.setItem('craftywrap_access_token', token);
}

export function clearStoredAccessToken(): void {
  window.localStorage.removeItem('craftywrap_access_token');
}

export function getOrCreateCartToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const storageKey = 'craftywrap_cart_token';
  const storedToken = window.localStorage.getItem(storageKey);
  if (storedToken) return storedToken;
  const token = typeof crypto?.randomUUID === 'function'
    ? crypto.randomUUID().replace(/-/g, '')
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`.padEnd(32, '0');
  window.localStorage.setItem(storageKey, token);
  return token;
}

export function resetCartToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  window.localStorage.removeItem('craftywrap_cart_token');
  return getOrCreateCartToken();
}
