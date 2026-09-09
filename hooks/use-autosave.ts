'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'quicknote:autosave'
export const AUTOSAVE_DELAY_MS = 2500

export type SaveReason = 'manual' | 'autosave'

export type SaveOptions = {
  reason?: SaveReason
}

export function useAutosavePreference() {
  const [enabled, setEnabledState] = useState(true)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '0') {
        setEnabledState(false)
      }
    } catch {
      // ignore
    }
  }, [])

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value)
    try {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
    } catch {
      // ignore
    }
  }, [])

  return [enabled, setEnabled] as const
}

type AutosaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

/**
 * Debounced autosave when `enabled` and `isDirty`.
 * Calls `save` with reason 'autosave'; skips overlapping saves.
 */
export function useAutosave(options: {
  enabled: boolean
  isDirty: boolean
  save: () => Promise<void>
  delayMs?: number
}) {
  const { enabled, isDirty, save, delayMs = AUTOSAVE_DELAY_MS } = options
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const saveRef = useRef(save)
  const inFlightRef = useRef(false)

  useEffect(() => {
    saveRef.current = save
  }, [save])

  useEffect(() => {
    if (!enabled) {
      setStatus(isDirty ? 'dirty' : 'idle')
      return
    }
    if (!isDirty) {
      setStatus((s) => (s === 'saving' ? s : 'idle'))
      return
    }

    setStatus('dirty')
    const timer = window.setTimeout(async () => {
      if (inFlightRef.current) return
      inFlightRef.current = true
      setStatus('saving')
      try {
        await saveRef.current()
        setStatus('saved')
      } catch {
        setStatus('error')
      } finally {
        inFlightRef.current = false
      }
    }, delayMs)

    return () => window.clearTimeout(timer)
  }, [enabled, isDirty, delayMs])

  return status
}

export function autosaveStatusLabel(status: AutosaveStatus, enabled: boolean): string {
  if (!enabled) return 'Autosave off'
  switch (status) {
    case 'dirty':
      return 'Unsaved changes'
    case 'saving':
      return 'Saving…'
    case 'saved':
      return 'Saved'
    case 'error':
      return 'Save failed'
    default:
      return 'Autosave on'
  }
}
