'use client'

import {
  getRemoteConfigString,
  isRemoteConfigAuthEnabled,
  REMOTE_CONFIG_KEYS,
} from '@/lib/remote-config'

export type AuthProviderId =
  | 'password'
  | 'google.com'
  | 'github.com'
  | 'apple.com'
  | 'microsoft.com'
  | 'twitter.com'
  | 'facebook.com'

const KNOWN_PROVIDERS = new Set<string>([
  'password',
  'google.com',
  'github.com',
  'apple.com',
  'microsoft.com',
  'twitter.com',
  'facebook.com',
])

function parseProviders(raw: string | undefined | null): AuthProviderId[] {
  if (!raw?.trim()) return []
  return raw
    .split(',')
    .map((p) => p.trim())
    .filter((p): p is AuthProviderId => KNOWN_PROVIDERS.has(p))
}

/**
 * Env fallback. Keep in sync with Firebase Console → Authentication → Sign-in method
 * when not using Remote Config.
 *
 * Example: NEXT_PUBLIC_AUTH_PROVIDERS=google.com
 */
export function getEnabledAuthProvidersFromEnv(): AuthProviderId[] {
  const parsed = parseProviders(process.env.NEXT_PUBLIC_AUTH_PROVIDERS)
  return parsed.length > 0 ? parsed : ['google.com']
}

export function getEnabledAuthProviders(): AuthProviderId[] {
  return getEnabledAuthProvidersFromEnv()
}

/**
 * Resolves providers from Firebase Remote Config by default.
 * Set NEXT_PUBLIC_USE_REMOTE_CONFIG=false to use env only.
 *
 * Remote Config parameter: `auth_providers` (String)
 * Value example: `google.com` or `password,google.com,github.com`
 *
 * Env fallback: NEXT_PUBLIC_AUTH_PROVIDERS
 */
export async function fetchEnabledAuthProviders(): Promise<AuthProviderId[]> {
  const envProviders = getEnabledAuthProvidersFromEnv()

  if (!isRemoteConfigAuthEnabled()) {
    return envProviders
  }

  try {
    const remote = await getRemoteConfigString(
      REMOTE_CONFIG_KEYS.authProviders,
      envProviders.join(',')
    )
    const parsed = parseProviders(remote)
    return parsed.length > 0 ? parsed : envProviders
  } catch (error) {
    console.warn('Failed to read auth providers from Remote Config', error)
    return envProviders
  }
}

export function providerLabel(id: AuthProviderId): string {
  switch (id) {
    case 'password':
      return 'Email'
    case 'google.com':
      return 'Google'
    case 'github.com':
      return 'GitHub'
    case 'apple.com':
      return 'Apple'
    case 'microsoft.com':
      return 'Microsoft'
    case 'twitter.com':
      return 'X'
    case 'facebook.com':
      return 'Facebook'
    default:
      return id
  }
}
