import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import NoteList from './NoteList'

export default function MainLayout() {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
                <div className="animate-spin w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
            </div>
        )
    }

    // Optional: Protect route
    // if (!user) return <Navigate to="/" />

    // Check if we are in "mobile view" logic or handling responsive later
    // For now, assuming desktop-first 3-column

    return (
        <div className="flex min-h-screen bg-[var(--color-bg-primary)] overflow-hidden">
            <Sidebar />

            <NoteList />

            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--color-bg-secondary)] relative">
                <Outlet />
            </main>
        </div>
    )
}
