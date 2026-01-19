import React from "react"
import Link from 'next/link'
import { FileText, GitBranch, Calculator, Folder, Search, Share2, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
// import { Suspense } from 'react'
// import Loading from './loading'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">QuickNote</span>
          </Link>
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Minimal Note-Taking with
            <span className="text-primary"> Powerful Features</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Create notes with Markdown, Mermaid diagrams, and Math equations.
            Organize with folders and tags. Reuse artifacts across your notes.
          </p>
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
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-center mb-12 text-foreground">
            Everything you need, nothing you don&apos;t
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<FileText className="w-5 h-5" />}
              title="Rich Formatting"
              description="Markdown support with headings, bold, italic, code blocks, and more."
            />
            <FeatureCard
              icon={<GitBranch className="w-5 h-5" />}
              title="Mermaid Diagrams"
              description="Create flowcharts, sequence diagrams, and more with Mermaid syntax."
            />
            <FeatureCard
              icon={<Calculator className="w-5 h-5" />}
              title="Math Equations"
              description="Write beautiful math equations using LaTeX syntax."
            />
            <FeatureCard
              icon={<Folder className="w-5 h-5" />}
              title="Organize"
              description="Folders and tags to keep your notes structured and findable."
            />
            <FeatureCard
              icon={<Search className="w-5 h-5" />}
              title="Search"
              description="Full-text search across all your notes and diagrams."
            />
            <FeatureCard
              icon={<Share2 className="w-5 h-5" />}
              title="Share"
              description="Generate public links to share your notes with anyone."
            />
            <FeatureCard
              icon={<Clock className="w-5 h-5" />}
              title="Version History"
              description="Keep track of changes with automatic version history."
            />
            <FeatureCard
              icon={<Trash2 className="w-5 h-5" />}
              title="Trash & Recovery"
              description="Deleted items go to trash first. Recover anytime."
            />
          </div>
        </div>
      </section>

      {/* Artifacts Section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Reusable Artifacts
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create diagrams and equations once, use them everywhere.
              Link artifacts across multiple notes for consistency and efficiency.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground">Diagram Manager</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                A dedicated space to create, manage, and export your Mermaid diagrams.
                Export in high resolution or copy directly to clipboard.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs text-muted-foreground">
                <pre>{`graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]`}</pre>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground">Math Support</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Write complex mathematical equations using LaTeX syntax.
                Perfect for technical documentation and academic notes.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <span className="text-lg text-foreground">$$E = mc^2$$</span>
                <br />
                <span className="text-sm text-muted-foreground mt-2 block">$$\int_0^\infty e^{'{-x^2}'} dx = \frac{'{\\sqrt{\\pi}}'}{'{2}'}$$</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Anonymous vs Logged In */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold text-center mb-12 text-foreground">
            Choose Your Experience
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Anonymous Mode</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">{"•"}</span>
                  <span>Notes saved locally in your browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">{"•"}</span>
                  <span>Basic note creation with formatting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">{"•"}</span>
                  <span>Share individual notes via public link</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">{"•"}</span>
                  <span>No account required</span>
                </li>
              </ul>
              <Link href="/app" className="block mt-6">
                <Button variant="outline" className="w-full bg-transparent">Try Anonymous</Button>
              </Link>
            </div>
            <div className="bg-card border-2 border-primary rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Full Experience</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">{"•"}</span>
                  <span>Cloud sync across all devices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">{"•"}</span>
                  <span>Reusable artifacts (diagrams, math)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">{"•"}</span>
                  <span>Folders, tags, and advanced search</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">{"•"}</span>
                  <span>Version history and trash recovery</span>
                </li>
              </ul>
              <Link href="/app/signup" className="block mt-6">
                <Button className="w-full">Create Free Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <FileText className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">QuickNote</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Fast, minimal, and focused on what matters.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-colors">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
        {icon}
      </div>
      <h3 className="font-medium text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export const unstable_getServerSession = async () => {
  return null
}
