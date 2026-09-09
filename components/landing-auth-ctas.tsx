'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

export function LandingHeaderNav() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="h-8 w-40" aria-hidden />
  }

  if (user) {
    return (
      <nav className="flex items-center gap-4">
        <Link href="/app">
          <Button size="sm">Open App</Button>
        </Link>
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-4">
      <Link href="/app" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
        Try Anonymous
      </Link>
      <Link href="/app/login">
        <Button variant="outline" size="sm">Sign In</Button>
      </Link>
      <Link href="/app/signup">
        <Button size="sm">Get Started</Button>
      </Link>
    </nav>
  )
}

export function LandingHeroCtas() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="h-11" aria-hidden />
  }

  if (user) {
    return (
      <div className="flex justify-center">
        <Link href="/app">
          <Button size="lg">Go to your notes</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link href="/app">
        <Button size="lg" className="w-full sm:w-auto">
          Start Writing
        </Button>
      </Link>
      <Link href="/app/login">
        <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
          Sign In for Full Features
        </Button>
      </Link>
    </div>
  )
}

export function LandingAnonymousCta() {
  const { user, loading } = useAuth()
  if (loading) return <div className="mt-6 h-9" aria-hidden />
  if (user) {
    return (
      <Link href="/app" className="block mt-6">
        <Button variant="outline" className="w-full bg-transparent">Open App</Button>
      </Link>
    )
  }
  return (
    <Link href="/app" className="block mt-6">
      <Button variant="outline" className="w-full bg-transparent">Try Anonymous</Button>
    </Link>
  )
}

export function LandingFullCta() {
  const { user, loading } = useAuth()
  if (loading) return <div className="mt-6 h-9" aria-hidden />
  if (user) {
    return (
      <Link href="/app" className="block mt-6">
        <Button className="w-full">Go to your notes</Button>
      </Link>
    )
  }
  return (
    <Link href="/app/signup" className="block mt-6">
      <Button className="w-full">Create Free Account</Button>
    </Link>
  )
}
