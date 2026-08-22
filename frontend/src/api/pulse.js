import { apiGet, apiPost } from './client'

/** GET flattened CoinGecko listings from Supabase via FastAPI. */
export async function fetchPrices({ limit = 100 } = {}) {
  return apiGet(`/api/prices?limit=${limit}`)
}

/** GET CoinDesk headlines stored in `news`. */
export async function fetchNews({ limit = 20 } = {}) {
  return apiGet(`/api/news?limit=${limit}`)
}

/** GET CrewAI + NVIDIA NIM brief built from the same tables. */
export async function fetchInsight() {
  return apiGet('/api/insight')
}

/** Check Bright Data CLI + collector env before a demo heal. */
export async function selfHealPreflight() {
  return apiGet('/api/self-heal/preflight')
}

/** Live `brightdata scraper run` + JSON inspect. Returns failed | healthy | error. */
export async function selfHealDetect() {
  return apiPost('/api/self-heal/detect')
}

/**
 * Start real `brightdata scraper heal` on PRICE_COLLECTOR_ID.
 * @param {{ autoApprove?: boolean }} [opts]
 */
export async function triggerSelfHeal({ autoApprove = true } = {}) {
  const q = autoApprove ? '?auto_approve=true' : '?auto_approve=false'
  return apiPost(`/api/trigger-self-heal${q}`)
}

/** Poll the in-memory heal job until Bright Data returns status done. */
export async function selfHealStatus(jobId) {
  const q = jobId ? `?job_id=${encodeURIComponent(jobId)}` : ''
  return apiGet(`/api/self-heal/status${q}`)
}

/** GET scrape/heal events for the Logs page. */
export async function fetchActivity({ limit = 50 } = {}) {
  return apiGet(`/api/activity?limit=${limit}`)
}
