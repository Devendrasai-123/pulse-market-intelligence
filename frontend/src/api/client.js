/** Shared API base for Pulse backend. */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${path} failed (${res.status}): ${text}`)
  }
  return res.json()
}

export async function apiPost(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST' })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${path} failed (${res.status}): ${text}`)
  }
  return res.json()
}
