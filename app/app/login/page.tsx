'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { useAuthProviders } from '@/hooks/use-auth-providers'
import { FederatedAuthButtons } from '@/components/federated-auth-buttons'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signInWithEmail, signInWithGoogle } = useAuth()
  const { providers, loading: providersLoading, emailEnabled, hasFederated } = useAuthProviders()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signInWithEmail(email, password)
      router.push('/app')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      await signInWithGoogle()
      router.push('/app')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const busy = loading || providersLoading

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">QuickNote</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Sign in to access your notes</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          {providersLoading && (
            <p className="text-sm text-muted-foreground text-center mb-4">Loading sign-in options…</p>
          )}

          {emailEnabled && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={busy}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={busy}
                />
              </div>

              <Button type="submit" className="w-full" disabled={busy}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          )}

          {emailEnabled && hasFederated && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">or continue with</span>
              </div>
            </div>
          )}

          {!providersLoading && providers && (
            <FederatedAuthButtons
              providers={providers}
              loading={busy}
              onGoogle={handleGoogleLogin}
            />
          )}

          {!providersLoading && providers && providers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              No sign-in providers are enabled for this Firebase project.
            </p>
          )}

          {emailEnabled && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/app/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          )}

          <p className={`text-center text-sm text-muted-foreground ${emailEnabled ? 'mt-2' : 'mt-6'}`}>
            <Link href="/app" className="text-primary hover:underline">
              Continue without account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
