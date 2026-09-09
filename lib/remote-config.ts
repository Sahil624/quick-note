'use client'

import { fetchAndActivate, getValue } from 'firebase/remote-config'
import { getAppRemoteConfig } from '@/lib/firebase'

export const REMOTE_CONFIG_KEYS = {
  /** Comma-separated Auth provider ids, e.g. "google.com" or "password,google.com" */
  authProviders: 'auth_providers',
} as const

let activatePromise: Promise<boolean> | null = null

/**
 * Fetch + activate Remote Config once per session (shared across callers).
 * Returns false if Remote Config is unavailable or fetch fails.
 */
export async function ensureRemoteConfigActivated(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  if (!activatePromise) {
    activatePromise = (async () => {
      const remoteConfig = await getAppRemoteConfig()
      if (!remoteConfig) return false

      const envDefault = process.env.NEXT_PUBLIC_AUTH_PROVIDERS?.trim() || 'google.com'
      remoteConfig.defaultConfig = {
        [REMOTE_CONFIG_KEYS.authProviders]: envDefault,
      }

      try {
        await fetchAndActivate(remoteConfig)
        return true
      } catch (error) {
        console.warn('Remote Config fetch failed; using defaults/env.', error)
        return false
      }
    })()
  }

  return activatePromise
}

export async function getRemoteConfigString(
  key: string,
  fallback = ''
): Promise<string> {
  const ok = await ensureRemoteConfigActivated()
  if (!ok) return fallback

  const remoteConfig = await getAppRemoteConfig()
  if (!remoteConfig) return fallback

  const value = getValue(remoteConfig, key)
  const asString = value.asString()
  if (value.getSource() === 'static' && !asString) return fallback
  return asString || fallback
}

/** Remote Config is on by default; set NEXT_PUBLIC_USE_REMOTE_CONFIG=false to disable. */
export function isRemoteConfigAuthEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_USE_REMOTE_CONFIG?.trim().toLowerCase()
  if (flag === '0' || flag === 'false' || flag === 'no' || flag === 'off') {
    return false
  }
  return true
}
