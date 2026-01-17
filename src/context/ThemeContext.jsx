import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first
        const saved = localStorage.getItem('quick-notes-theme')
        if (saved) return saved

        // Default to dark theme
        return 'dark'
    })

    useEffect(() => {
        // Apply theme to document
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light')
        } else {
            document.documentElement.removeAttribute('data-theme')
        }

        // Save preference
        localStorage.setItem('quick-notes-theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    }

    const value = {
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
