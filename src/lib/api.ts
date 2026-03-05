const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getToken() {
  if (typeof window !== 'undefined') return localStorage.getItem('token');
  return null;
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  if (res.status === 204) return null;
  const data = await res.json();
  if (data.status === 'error') throw { message: data.message, errors: data.errors, status: res.status };
  return data.data;
}

export const api = {
  auth: {
    register: (body: { email: string; name: string; password: string; role: string }) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  },
  restaurants: {
    list: (params?: Record<string, string | number | boolean>) => {
      const q = params
        ? '?' + new URLSearchParams(
            Object.entries(params)
              .filter(([, v]) => v !== undefined && v !== '')
              .map(([k, v]) => [k, String(v)])
          ).toString()
        : '';
      return request(`/restaurants${q}`);
    },
    get: (id: string) => request(`/restaurants/${id}`),
    create: (body: object) => request('/restaurants', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: object) => request(`/restaurants/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request(`/restaurants/${id}`, { method: 'DELETE' }),
  },
  reviews: {
    create: (restaurantId: string, body: { rating: number; comment: string }) =>
      request(`/restaurants/${restaurantId}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
    delete: (restaurantId: string, reviewId: string) =>
      request(`/restaurants/${restaurantId}/reviews/${reviewId}`, { method: 'DELETE' }),
  },
  preferences: {
    get: () => request('/users/me/preferences'),
    update: (body: { sortBy?: string; sortOrder?: string }) =>
      request('/users/me/preferences', { method: 'PUT', body: JSON.stringify(body) }),
  },
};
