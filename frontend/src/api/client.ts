const API_BASE = '/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  return localStorage.getItem('contractiq_token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.detail || data.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: { email: string; password: string; full_name: string }) =>
    request<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getMe: () => request<any>('/auth/me'),

  // Contracts
  uploadText: (body: { title: string; content: string }) =>
    request<any>('/contracts/upload/text', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  uploadPdf: (formData: FormData) =>
    request<any>('/contracts/upload/pdf', {
      method: 'POST',
      body: formData,
    }),

  listContracts: (skip = 0, limit = 50) =>
    request<any[]>(`/contracts/?skip=${skip}&limit=${limit}`),

  getContract: (id: number) => request<any>(`/contracts/${id}`),

  analyzeContract: (id: number) =>
    request<any>(`/contracts/${id}/analyze`, {
      method: 'POST',
    }),

  deleteContract: (id: number) =>
    request<void>(`/contracts/${id}`, {
      method: 'DELETE',
    }),

  // Health
  checkHealth: () => request<any>('/health'),
  checkAiHealth: () => request<any>('/health/ai'),
};

export { ApiError };
