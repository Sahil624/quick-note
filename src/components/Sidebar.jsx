import { Link, useLocation } from 'react-router-dom'
import { memo } from 'react'
import { useAuth } from '../context/AuthContext'

function SidebarItem({ icon, label, to, active }) {
    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    )
}

function SectionLabel({ label }) {
    return (
        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            {label}
        </div>
    )
}

function Sidebar() {
    const location = useLocation()
    const { user } = useAuth()

    return (
        <aside className="flex flex-col w-[var(--sidebar-width)] h-screen bg-[var(--color-bg-primary)] border-r border-[var(--color-border)] py-6 flex-shrink-0">
            {/* Logo */}
            <div className="px-6 mb-8 flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--color-accent)] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    Q
                </div>
                <span className="font-bold text-xl text-[var(--color-text-primary)]">Quick Note</span>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar">
                <SidebarItem
                    to="/app"
                    active={location.pathname === '/app' || location.pathname.startsWith('/app/note')}
                    label="Notes"
                    icon={(
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    )}
                />

                <SidebarItem
                    to="#"
                    label="Templates"
                    icon={(
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                    )}
                />
                <SidebarItem
                    to="#"
                    label="Import"
                    icon={(
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    )}
                />
                <SidebarItem
                    to="#"
                    label="Trash"
                    icon={(
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    )}
                />

                <SectionLabel label="Workspace" />

                <SidebarItem
                    to="#"
                    label="Tasks"
                    icon={(
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    )}
                />
                <SidebarItem
                    to="#"
                    label="Announcements"
                    icon={(
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                    )}
                />
            </nav>

            {/* Profile / Settings */}
            <div className="px-4 pt-4 border-t border-[var(--color-border)]">
                <Link to="/" className="flex items-center gap-3 p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" onerror="this.onerror=null; this.src='https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740&q=80';" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                        <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user?.displayName || 'User'}</div>
                        <div className="text-xs text-[var(--color-text-secondary)]">Settings</div>
                    </div>
                </Link>
            </div>
        </aside>
    )
}

export default memo(Sidebar)
