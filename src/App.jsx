import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Landing from './components/Landing'
import MainLayout from './components/MainLayout'

// Lazy load the Editor component to avoid loading heavy libs on landing page
const Editor = lazy(() => import('./components/Editor'))

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--color-text-secondary)]">Loading editor...</p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)]">
      <div className="text-6xl mb-4 opacity-50">✨</div>
      <h2 className="text-xl font-medium text-[var(--color-text-primary)]">Select a note to view</h2>
      <p className="max-w-xs text-center mt-2">
        Choose a note from the list on the left, or create a new one to get started.
      </p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Main App Routes */}
        <Route path="/app" element={<MainLayout />}>
          <Route index element={<EmptyState />} />
          <Route
            path="note/:id"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Editor />
              </Suspense>
            }
          />
        </Route>

        {/* Redirect legacy routes */}
        <Route path="/new" element={<Navigate to="/app" />} />
        <Route path="/dashboard" element={<Navigate to="/app" />} />
        <Route path="/note/:id" element={<Navigate to="/app" />} /> { }
      </Routes>
    </BrowserRouter>
  )
}

export default App
