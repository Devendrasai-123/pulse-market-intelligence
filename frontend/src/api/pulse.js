import { apiGet, apiPost } from './client'

export async function fetchPrices({ limit = 100 } = {}) {
  return apiGet(`/api/prices?limit=${limit}`)
}

export async function fetchNews({ limit = 20 } = {}) {
  return apiGet(`/api/news?limit=${limit}`)
}

export async function fetchInsight() {
  return apiGet('/api/insight')
}

export async function selfHealPreflight() {
  return apiGet('/api/self-heal/preflight')
}

export async function selfHealDetect() {
  return apiPost('/api/self-heal/detect')
}

export async function triggerSelfHeal({ autoApprove = true } = {}) {
  const q = autoApprove ? '?auto_approve=true' : '?auto_approve=false'
  return apiPost(`/api/trigger-self-heal${q}`)
}

export async function selfHealStatus(jobId) {
  const q = jobId ? `?job_id=${encodeURIComponent(jobId)}` : ''
  return apiGet(`/api/self-heal/status${q}`)
}

export async function fetchActivity({ limit = 50 } = {}) {
  return apiGet(`/api/activity?limit=${limit}`)
}
