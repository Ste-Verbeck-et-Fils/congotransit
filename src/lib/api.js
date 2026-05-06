import { getAccessToken } from './authSession';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export async function apiRequest(path, options = {}) {
  const accessToken = getAccessToken();

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? 'Une erreur est survenue.');
  }

  return data;
}
