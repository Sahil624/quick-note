import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import { useState, useRef, useEffect } from 'react'

export default function Navbar() {
    const { user, signInWithGoogle, signOut, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef(null)

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSignOut = async () => {
        try {
            await signOut()
            setShowMenu(false)
            navigate('/')
        } catch (error) {
            console.error('Failed to sign out', error)
        }
    }

    const handleSignIn = async () => {
        try {
            await signInWithGoogle()
        } catch (error) {
            console.error('Failed to sign in', error)
        }
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg-primary)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                        Quick Notes
                    </Link>

                    {/* Right side actions */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        {isAuthenticated ? (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="flex items-center gap-2 focus:outline-none"
                                >
                                    {user?.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full border border-[var(--color-border)]"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                            {user?.email?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                {showMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg shadow-xl py-1 transform origin-top-right transition-all">
                                        <div className="px-4 py-2 border-b border-[var(--color-border)]">
                                            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                                {user?.displayName || 'User'}
                                            </p>
                                            <p className="text-xs text-[var(--color-text-secondary)] truncate">
                                                {user?.email}
                                            </p>
                                        </div>

                                        <Link
                                            to="/app"
                                            className="block px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                                            onClick={() => setShowMenu(false)}
                                        >
                                            Dashboard
                                        </Link>

                                        <button
                                            onClick={handleSignOut}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[var(--color-bg-tertiary)] transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={handleSignIn}
                                className="px-4 py-2 text-sm font-medium bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-accent)] text-[var(--color-text-primary)] rounded-lg transition-colors border border-[var(--color-border)] hover:border-transparent"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
