import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { selfHealDetect, selfHealStatus, triggerSelfHeal } from '../api/pulse'

const POLL_MS = 5000

export default function SelfHealButton() {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('Trigger a real Bright Data heal')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)
  const toastId = useRef(null)

  function stopPolling() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  function applyJob(job) {
    setStatus(job.status || 'unknown')
    setMessage(job.message || '')
    if (job.status === 'healing') {
      toast.loading(job.message || 'Healing…', { id: toastId.current })
    }
    if (job.status === 'repaired') {
      toast.success('Repaired — Bright Data status done', { id: toastId.current })
      stopPolling()
      setBusy(false)
    }
    if (job.status === 'healthy') {
      toast.message('Detect: healthy — still running a real heal', {
        id: toastId.current,
      })
    }
    if (job.status === 'failed') {
      toast.warning(job.message || 'Extraction looks failed', {
        id: toastId.current,
      })
    }
    if (job.status === 'error') {
      toast.error(job.message || 'Heal error', { id: toastId.current })
      stopPolling()
      setBusy(false)
    }
  }

  function startPolling(id) {
    stopPolling()
    timerRef.current = setInterval(async () => {
      try {
        applyJob(await selfHealStatus(id))
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg)
        toast.error(msg, { id: toastId.current })
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
    setMessage('Running live scraper detect…')
    toastId.current = toast.loading('Detecting with a live scraper run…')
    try {
      const detected = await selfHealDetect()
      applyJob(detected)
      if (detected.status === 'error') {
        setBusy(false)
        return
      }
      setBusy(true)
      toast.loading('Starting Bright Data heal…', { id: toastId.current })
      const started = await triggerSelfHeal({ autoApprove: true })
      applyJob(started)
      if (started.status === 'error') {
        setBusy(false)
        return
      }
      startPolling(started.job_id)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setStatus('error')
      toast.error(msg, { id: toastId.current })
      setBusy(false)
      stopPolling()
    }
  }

  return (
    <div className="heal-fab">
      {status !== 'idle' && (
        <div className="heal-chip">
          <strong>{status}</strong>
          <div className="muted">{message}</div>
          {error && <div className="err">{error}</div>}
        </div>
      )}
      <button type="button" onClick={onClick} disabled={busy}>
        {busy ? 'Healing…' : 'Trigger Self-Heal'}
      </button>
    </div>
  )
}
