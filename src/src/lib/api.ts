const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function getAuthHeader() {
  const { data } = await import('./supabase').then(m => m.supabase.auth.getSession())
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// Ready-to-use API calls
export const api = {
  getDashboard: () => apiFetch('/api/dashboard'),
  getProfile: () => apiFetch('/api/profile'),
  updateProfile: (data: unknown) => apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify(data) }),
  scanUrl: (url: string) => apiFetch('/api/scan/url', { method: 'POST', body: JSON.stringify({ url }) }),
  scanEmail: (email: string) => apiFetch('/api/scan/email', { method: 'POST', body: JSON.stringify({ email }) }),
  awardBadge: (badge_id: string) => apiFetch('/api/badges/award', { method: 'POST', body: JSON.stringify({ badge_id }) }),
  updateScore: (score: number) => apiFetch('/api/user/update-score', { method: 'POST', body: JSON.stringify({ score }) }),
}