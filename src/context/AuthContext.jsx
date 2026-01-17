import { createContext, useContext, useState, useEffect } from 'react'
import {
    signInAnonymously,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    linkWithPopup
} from 'firebase/auth'
import { auth, hasValidConfig } from '../services/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!hasValidConfig || !auth) {
            setLoading(false)
            return
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user)
            setLoading(false)
        }, (error) => {
            console.error('Auth state change error:', error)
            setError(error.message)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // Sign in anonymously
    const signInAnon = async () => {
        if (!hasValidConfig || !auth) {
            console.warn('Firebase not configured')
            return null
        }

        try {
            setError(null)
            const result = await signInAnonymously(auth)
            return result.user
        } catch (error) {
            console.error('Anonymous sign in failed:', error)
            setError(error.message)
            throw error
        }
    }

    // Sign in with Google
    const signInWithGoogle = async () => {
        if (!hasValidConfig || !auth) {
            console.warn('Firebase not configured')
            return null
        }

        try {
            setError(null)
            const provider = new GoogleAuthProvider()

            // If user is anonymous, link the account instead
            if (user?.isAnonymous) {
                try {
                    const result = await linkWithPopup(user, provider)
                    return result.user
                } catch (linkError) {
                    // If linking fails (e.g., account already exists), sign in directly
                    if (linkError.code === 'auth/credential-already-in-use') {
                        const result = await signInWithPopup(auth, provider)
                        return result.user
                    }
                    throw linkError
                }
            }

            const result = await signInWithPopup(auth, provider)
            return result.user
        } catch (error) {
            console.error('Google sign in failed:', error)
            setError(error.message)
            throw error
        }
    }

    // Sign out
    const signOut = async () => {
        if (!hasValidConfig || !auth) {
            return
        }

        try {
            await firebaseSignOut(auth)
            setUser(null)
        } catch (error) {
            console.error('Sign out failed:', error)
            setError(error.message)
            throw error
        }
    }

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isAnonymous: user?.isAnonymous ?? true,
        signInAnon,
        signInWithGoogle,
        signOut,
        hasValidConfig,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
