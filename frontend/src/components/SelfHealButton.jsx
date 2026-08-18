import { useRef, useState } from 'react'
import {
  selfHealDetect,
  selfHealStatus,
  triggerSelfHeal,
} from '../api/pulse'

const POLL_MS = 5000

/**
 * Unstyled self-heal control:
 * detect -> trigger-self-heal -> poll status (plain text).
 */
export default function SelfHealButton() {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('Not started')
  const [jobId, setJobId] = useState(null)
  const [raw, setRaw] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  function stopPolling() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  function applyJob(job) {
    setStatus(job.status || 'unknown')
    setMessage(job.message || '')
    setJobId(job.job_id || null)
    setRaw(job)
    if (job.status === 'repaired' || job.status === 'error' || job.status === 'healthy') {
      stopPolling()
      setBusy(false)
    }
  }

  function startPolling(id) {
    stopPolling()
    timerRef.current = setInterval(async () => {
      try {
        const job = await selfHealStatus(id)
        applyJob(job)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
        stopPolling()
        setBusy(false)
      }
    }, POLL_MS)
  }

  async function onClick() {
    stopPolling()
    setBusy(true)
    setError(null)
    setStatus('detecting')
    setMessage('Running POST /api/self-heal/detect ...')

    try {
      const detected = await selfHealDetect()
      applyJob(detected)

      if (detected.status === 'error') {
        setBusy(false)
        return
      }

      setBusy(true)
      setMessage(
        detected.status === 'healthy'
          ? 'Detect=healthy; still running real heal as exercise...'
          : 'Detect=failed; running POST /api/trigger-self-heal ...',
      )
      const started = await triggerSelfHeal({ autoApprove: true })
      applyJob(started)
      if (started.status === 'error') {
        setBusy(false)
        return
      }
      startPolling(started.job_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus('error')
      setBusy(false)
      stopPolling()
    }
  }

  return (
    <section>
      <h2>Self-Heal</h2>
      <button type="button" onClick={onClick} disabled={busy}>
        {busy ? 'Running…' : 'Trigger Self-Heal'}
      </button>
      <p>status: {status}</p>
      <p>message: {message}</p>
      <p>job_id: {jobId || '(none)'}</p>
      {error && <p>Error: {error}</p>}
      {raw && (
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
          {JSON.stringify(
            {
              status: raw.status,
              bright_data_status: raw.bright_data_status,
              detection_is_real_scrape: raw.detection_is_real_scrape,
              heal_is_real_cli: raw.heal_is_real_cli,
              repaired_from_bright_data_done: raw.repaired_from_bright_data_done,
              collector_id: raw.collector_id,
            },
            null,
            2,
          )}
        </pre>
      )}
    </section>
  )
}
