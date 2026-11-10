// Centralized API client with automatic token attachment and response unwrapping

const BASE_URL = '';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  user?: any;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: any;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('pitcharena_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await response.json();

    if (response.status === 401) {
      // If token expired, clear auth
      if (data.code === 'TOKEN_EXPIRED') {
        localStorage.removeItem('pitcharena_token');
        localStorage.removeItem('pitcharena_user');
        window.dispatchEvent(new Event('auth_state_changed'));
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error ${response.status}`,
        message: data.message
      };
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network communication error'
    };
  }
}

export const api = {
  get: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' })
};
