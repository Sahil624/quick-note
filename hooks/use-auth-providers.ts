'use client'

import { useEffect, useState } from 'react'
import {
  AuthProviderId,
  fetchEnabledAuthProviders,
  getEnabledAuthProvidersFromEnv,
} from '@/lib/auth-providers'
import { isRemoteConfigAuthEnabled } from '@/lib/remote-config'

export function useAuthProviders() {
  const useRemote = isRemoteConfigAuthEnabled()
  const [providers, setProviders] = useState<AuthProviderId[]>(() =>
    useRemote ? [] : getEnabledAuthProvidersFromEnv()
  )
  const [loading, setLoading] = useState(useRemote)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'env' | 'remote'>(useRemote ? 'remote' : 'env')

  useEffect(() => {
    let cancelled = false

    fetchEnabledAuthProviders()
      .then((list) => {
        if (cancelled) return
        setProviders(list)
        setSource(useRemote ? 'remote' : 'env')
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setProviders(getEnabledAuthProvidersFromEnv())
        setSource('env')
        setError(err instanceof Error ? err.message : 'Failed to load auth providers')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [useRemote])

  return {
    providers,
    loading,
    error,
    source,
    emailEnabled: providers.includes('password'),
    googleEnabled: providers.includes('google.com'),
    hasFederated: providers.some((p) => p !== 'password'),
  }
}
