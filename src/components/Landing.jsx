import { Link } from 'react-router-dom'
import Navbar from './Navbar'

export default function Landing() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)]">
            <Navbar />

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 pt-16">
                <div className="max-w-3xl mx-auto text-center space-y-12">

                    {/* Minimalist Title */}
                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[var(--color-text-primary)]">
                            Write at the speed of <br />
                            <span className="text-indigo-500">thought</span>.
                        </h1>
                        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto font-light leading-relaxed">
                            A minimalist, distraction-free markdown editor for developers.
                            Built with native support for Mermaid diagrams and LaTeX math.
                        </p>
                    </div>

                    {/* Clean CTA */}
                    <div className="flex items-center justify-center gap-6">
                        <Link
                            to="/app"
                            className="px-8 py-3 text-base font-medium bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] rounded-full hover:bg-[var(--color-text-secondary)] transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            Start Writing
                        </Link>
                    </div>

                    {/* Minimal Feature List */}
                    <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="space-y-2">
                            <div className="text-2xl">📝</div>
                            <h3 className="font-medium text-[var(--color-text-primary)]">Markdown First</h3>
                            <p className="text-sm text-[var(--color-text-secondary)]">GFM compliant styling</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-2xl">📊</div>
                            <h3 className="font-medium text-[var(--color-text-primary)]">Mermaid Diagrams</h3>
                            <p className="text-sm text-[var(--color-text-secondary)]">Flowcharts & sequences</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-2xl">∑</div>
                            <h3 className="font-medium text-[var(--color-text-primary)]">Math Equations</h3>
                            <p className="text-sm text-[var(--color-text-secondary)]">KaTeX rendering</p>
                        </div>
                    </div>

                </div>
            </main>

            {/* Simple Footer */}
            <footer className="py-6 text-center text-xs text-[var(--color-text-secondary)] opacity-50">
                <p>No signup required for local use. Cloud sync available.</p>
            </footer>
        </div>
    )
}
