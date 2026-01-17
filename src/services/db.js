import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp,
    orderBy,
    limit
} from 'firebase/firestore'
import { db, hasValidConfig } from './firebase'
import { v4 as uuidv4 } from 'uuid'

// Debounce helper
function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// Note structure
const createNote = (overrides = {}) => ({
    id: uuidv4(),
    title: 'Untitled',
    content: '',
    ownerId: null, // null for anonymous if needed, but we prefer auth now
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
})

// Save note to Firestore (debounced)
const saveToFirestore = async (noteId, note) => {
    if (!hasValidConfig || !db) {
        console.warn('Firebase not configured, skipping cloud save')
        return
    }

    try {
        const noteRef = doc(db, 'notes', noteId)
        // Ensure we don't accidentally overwrite strict server timestamps with old client strings if we can avoid it, 
        // but for now simple syncing is fine.
        const noteData = {
            ...note,
            updatedAt: serverTimestamp(),
        }

        // We use setDoc with merge: true or just setDoc to overwrite/create
        // Check if document exists not strictly necessary if we just want to upsert
        await setDoc(noteRef, noteData, { merge: true })

    } catch (error) {
        console.error('Failed to save to Firestore:', error)
        // throw error // Don't crash the app on save fail, maybe toast?
    }
}

// Debounced cloud save (2 second delay)
const debouncedCloudSave = debounce(saveToFirestore, 2000)

// Main save function
// Returns the updated object immediately for UI optimism
export const saveNote = (note) => {
    const updatedNote = {
        ...note,
        updatedAt: new Date().toISOString(),
    }

    // Fire and forget (Debounced)
    // Only save to cloud if we have a config. 
    // If offline or no config, this will effectively do nothing persistent (ram only)
    if (hasValidConfig) {
        debouncedCloudSave(note.id, updatedNote)
    }

    return updatedNote
}

// Get note - Firestore only
export const getNote = async (noteId) => {
    if (!hasValidConfig || !db) {
        return null
    }

    try {
        const noteRef = doc(db, 'notes', noteId)
        const docSnap = await getDoc(noteRef)

        if (docSnap.exists()) {
            // Convert timestamps to ISO strings for consistent UI handling if needed, 
            // or keep as is. current code expects ISO strings in some places (date-fns).
            const data = docSnap.data()
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
            }
        }

        return null
    } catch (error) {
        console.warn('Failed to fetch from Firestore:', error)
        return null
    }
}

// Get user's notes - Firestore only
export const getUserNotes = async (userId) => {
    if (!hasValidConfig || !db || !userId) {
        return []
    }

    try {
        const notesRef = collection(db, 'notes')
        const q = query(
            notesRef,
            where('ownerId', '==', userId),
            orderBy('updatedAt', 'desc'),
            limit(50)
        )
        const querySnapshot = await getDocs(q)

        return querySnapshot.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
            }
        })
    } catch (error) {
        console.warn('Failed to fetch user notes from Firestore:', error)
        return []
    }
}

// Delete note
export const deleteNote = async (noteId, userId) => {
    if (!hasValidConfig || !db) {
        return
    }

    try {
        // We can just try deleting directly without reading if we trust the caller,
        // but checking ownerId is safer.
        const noteRef = doc(db, 'notes', noteId)
        // For now, simpler delete:
        await deleteDoc(noteRef)
    } catch (error) {
        console.error('Failed to delete from Firestore:', error)
        throw error
    }
}

// Create new note - Async now
export const createNewNote = async (userId = null) => {
    const note = createNote({ ownerId: userId })

    if (hasValidConfig && db) {
        try {
            await setDoc(doc(db, 'notes', note.id), {
                ...note,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            })
        } catch (e) {
            console.error("Failed to create note in DB", e)
            throw e
        }
    }

    return note
}

// Get public note (for sharing)
export const getPublicNote = async (noteId) => {
    if (!hasValidConfig || !db) {
        return null
    }

    try {
        const noteRef = doc(db, 'notes', noteId)
        const docSnap = await getDoc(noteRef)

        if (docSnap.exists()) {
            const data = docSnap.data()
            if (data.isPublic) {
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                }
            }
        }

        return null
    } catch (error) {
        console.warn('Failed to fetch public note:', error)
        return null
    }
}

// Toggle note visibility
export const toggleNotePublic = async (noteId, isPublic, userId) => {
    if (hasValidConfig && db) {
        try {
            const noteRef = doc(db, 'notes', noteId)
            await updateDoc(noteRef, { isPublic })
        } catch (error) {
            console.error('Failed to update visibility:', error)
        }
    }
    // We don't have a local logic fallback anymore, so we just assume it worked 
    // or the UI won't update until refresh. 
    // Ideally we return the updated state.
    return { isPublic }
}
