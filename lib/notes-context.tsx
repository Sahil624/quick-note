'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  getDoc,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from './auth-context'
import { Artifact, Note, Diagram, Folder, LocalNote, NoteVersion } from './types'
import { nanoid } from 'nanoid'

interface NotesContextType {
  notes: Note[]
  diagrams: Diagram[]
  artifacts: Artifact[]
  folders: Folder[]
  localNotes: LocalNote[]
  loading: boolean
  trashedItems: Artifact[]
  
  // Note operations
  createNote: (title: string, content: string, folderId?: string | null, tags?: string[], linkedArtifacts?: string[]) => Promise<string>
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
  deleteNote: (id: string, permanent?: boolean) => Promise<void>
  restoreNote: (id: string) => Promise<void>
  permanentlyDeleteNote: (id: string) => Promise<void>
  
  // Diagram operations
  createDiagram: (title: string, content: string, folderId?: string | null, tags?: string[]) => Promise<string>
  updateDiagram: (id: string, updates: Partial<Diagram>) => Promise<void>
  deleteDiagram: (id: string, permanent?: boolean) => Promise<void>
  restoreDiagram: (id: string) => Promise<void>
  
  // Artifact operations (generic)
  restoreArtifact: (id: string) => Promise<void>
  permanentlyDeleteArtifact: (id: string) => Promise<void>
  
  // Folder operations
  createFolder: (name: string, parentId?: string | null) => Promise<string>
  updateFolder: (id: string, name: string) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  
  // Local note operations (anonymous)
  createLocalNote: (title: string, content: string) => string
  updateLocalNote: (id: string, updates: Partial<LocalNote>) => void
  deleteLocalNote: (id: string) => void
  shareLocalNote: (id: string) => Promise<string>
  
  // Public note operations
  getPublicNote: (publicId: string) => Promise<Artifact | null>
  makePublic: (id: string, type: 'note' | 'diagram') => Promise<string>
  makePrivate: (id: string, type: 'note' | 'diagram') => Promise<void>
  
  // Version history
  getNoteVersions: (noteId: string) => NoteVersion[]
  restoreVersion: (noteId: string, versionId: string) => Promise<void>
  
  // Empty trash
  emptyTrash: () => Promise<void>
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

const LOCAL_STORAGE_KEY = 'quicknote_local_notes'

export function NotesProvider({ children }: { children: ReactNode }) {
  const { user, isAnonymous } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [diagrams, setDiagrams] = useState<Diagram[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [localNotes, setLocalNotes] = useState<LocalNote[]>([])
  const [loading, setLoading] = useState(true)

  // Load local notes from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setLocalNotes(parsed.map((n: LocalNote) => ({
            ...n,
            createdAt: new Date(n.createdAt),
            updatedAt: new Date(n.updatedAt),
          })))
        } catch (e) {
          console.error('Error parsing local notes:', e)
        }
      }
    }
  }, [])

  // Save local notes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localNotes))
    }
  }, [localNotes])

  // Subscribe to Firestore data when user is logged in
  useEffect(() => {
    if (!user) {
      setNotes([])
      setDiagrams([])
      setFolders([])
      setLoading(false)
      return
    }

    setLoading(true)

    // Subscribe to notes
    const notesQuery = query(
      collection(db, 'artifacts'),
      where('userId', '==', user.uid),
      where('type', '==', 'note'),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
      const notesData: Note[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
          deletedAt: data.deletedAt ? (data.deletedAt as Timestamp).toDate() : null,
          versions: data.versions || [],
        } as Note
      })
      setNotes(notesData)
    })

    // Subscribe to diagrams
    const diagramsQuery = query(
      collection(db, 'artifacts'),
      where('userId', '==', user.uid),
      where('type', '==', 'diagram'),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribeDiagrams = onSnapshot(diagramsQuery, (snapshot) => {
      const diagramsData: Diagram[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
          deletedAt: data.deletedAt ? (data.deletedAt as Timestamp).toDate() : null,
        } as Diagram
      })
      setDiagrams(diagramsData)
    })

    // Subscribe to folders
    const foldersQuery = query(
      collection(db, 'folders'),
      where('userId', '==', user.uid),
      orderBy('name', 'asc')
    )

    const unsubscribeFolders = onSnapshot(foldersQuery, (snapshot) => {
      const foldersData: Folder[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
        } as Folder
      })
      setFolders(foldersData)
      setLoading(false)
    })

    return () => {
      unsubscribeNotes()
      unsubscribeDiagrams()
      unsubscribeFolders()
    }
  }, [user])

  // Note operations
  const createNote = async (
    title: string,
    content: string,
    folderId: string | null = null,
    tags: string[] = [],
    linkedArtifacts: string[] = []
  ): Promise<string> => {
    if (!user) throw new Error('Must be logged in to create notes')

    const noteData = {
      type: 'note',
      title,
      content,
      tags,
      folderId,
      linkedArtifacts,
      userId: user.uid,
      isPublic: false,
      publicId: null,
      isDeleted: false,
      deletedAt: null,
      versions: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, 'artifacts'), noteData)
    return docRef.id
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    if (!user) throw new Error('Must be logged in')

    const noteRef = doc(db, 'artifacts', id)
    const noteDoc = await getDoc(noteRef)
    
    if (!noteDoc.exists()) throw new Error('Note not found')
    
    const currentData = noteDoc.data() as Note
    
    // Create version history if content changed
    let versions = currentData.versions || []
    if (updates.content && updates.content !== currentData.content) {
      const newVersion: NoteVersion = {
        id: nanoid(),
        noteId: id,
        title: currentData.title || 'Untitled',
        content: currentData.content,
        createdAt: new Date(),
        versionNumber: versions.length + 1,
      }
      versions = [newVersion, ...versions].slice(0, 3) // Keep only last 3 versions
    }

    await updateDoc(noteRef, {
      ...updates,
      versions,
      updatedAt: serverTimestamp(),
    })
  }

  const deleteNote = async (id: string, permanent = false) => {
    if (!user) throw new Error('Must be logged in')
    
    const noteRef = doc(db, 'artifacts', id)
    
    if (permanent) {
      await deleteDoc(noteRef)
    } else {
      await updateDoc(noteRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
      })
    }
  }

  const restoreNote = async (id: string) => {
    if (!user) throw new Error('Must be logged in')
    
    const noteRef = doc(db, 'artifacts', id)
    await updateDoc(noteRef, {
      isDeleted: false,
      deletedAt: null,
    })
  }

  const permanentlyDeleteNote = async (id: string) => {
    if (!user) throw new Error('Must be logged in')
    const noteRef = doc(db, 'artifacts', id)
    await deleteDoc(noteRef)
  }

  // Diagram operations
  const createDiagram = async (
    title: string,
    content: string,
    folderId: string | null = null,
    tags: string[] = []
  ): Promise<string> => {
    if (!user) throw new Error('Must be logged in to create diagrams')

    const diagramData = {
      type: 'diagram',
      diagramType: 'mermaid',
      title,
      content,
      tags,
      folderId,
      userId: user.uid,
      isPublic: false,
      publicId: null,
      isDeleted: false,
      deletedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, 'artifacts'), diagramData)
    return docRef.id
  }

  const updateDiagram = async (id: string, updates: Partial<Diagram>) => {
    if (!user) throw new Error('Must be logged in')

    const diagramRef = doc(db, 'artifacts', id)
    await updateDoc(diagramRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  }

  const deleteDiagram = async (id: string, permanent = false) => {
    if (!user) throw new Error('Must be logged in')
    
    const diagramRef = doc(db, 'artifacts', id)
    
    if (permanent) {
      await deleteDoc(diagramRef)
    } else {
      await updateDoc(diagramRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
      })
    }
  }

  const restoreDiagram = async (id: string) => {
    if (!user) throw new Error('Must be logged in')
    
    const diagramRef = doc(db, 'artifacts', id)
    await updateDoc(diagramRef, {
      isDeleted: false,
      deletedAt: null,
    })
  }

  // Generic artifact operations
  const restoreArtifact = async (id: string) => {
    if (!user) throw new Error('Must be logged in')
    const artifactRef = doc(db, 'artifacts', id)
    await updateDoc(artifactRef, {
      isDeleted: false,
      deletedAt: null,
    })
  }

  const permanentlyDeleteArtifact = async (id: string) => {
    if (!user) throw new Error('Must be logged in')
    const artifactRef = doc(db, 'artifacts', id)
    await deleteDoc(artifactRef)
  }

  // Folder operations
  const createFolder = async (name: string, parentId: string | null = null): Promise<string> => {
    if (!user) throw new Error('Must be logged in')

    const folderData = {
      name,
      parentId,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, 'folders'), folderData)
    return docRef.id
  }

  const updateFolder = async (id: string, name: string) => {
    if (!user) throw new Error('Must be logged in')

    const folderRef = doc(db, 'folders', id)
    await updateDoc(folderRef, {
      name,
      updatedAt: serverTimestamp(),
    })
  }

  const deleteFolder = async (id: string) => {
    if (!user) throw new Error('Must be logged in')
    
    // Move all items in folder to root
    const batch = writeBatch(db)
    
    const itemsInFolder = [...notes, ...diagrams].filter(item => item.folderId === id)
    itemsInFolder.forEach(item => {
      const itemRef = doc(db, 'artifacts', item.id)
      batch.update(itemRef, { folderId: null })
    })
    
    const folderRef = doc(db, 'folders', id)
    batch.delete(folderRef)
    
    await batch.commit()
  }

  // Local note operations
  const createLocalNote = (title: string, content: string): string => {
    const id = nanoid()
    const newNote: LocalNote = {
      id,
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
      publicId: null,
    }
    setLocalNotes(prev => [newNote, ...prev])
    return id
  }

  const updateLocalNote = (id: string, updates: Partial<LocalNote>) => {
    setLocalNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      )
    )
  }

  const deleteLocalNote = (id: string) => {
    setLocalNotes(prev => prev.filter(note => note.id !== id))
  }

  const shareLocalNote = async (id: string): Promise<string> => {
    const note = localNotes.find(n => n.id === id)
    if (!note) throw new Error('Note not found')

    const publicId = nanoid(10)
    
    // Save to Firestore as public note
    await setDoc(doc(db, 'publicNotes', publicId), {
      title: note.title,
      content: note.content,
      publicId,
      createdAt: serverTimestamp(),
      type: 'note',
    })

    updateLocalNote(id, { isPublic: true, publicId })
    
    return publicId
  }

  // Public note operations
  const getPublicNote = async (publicId: string): Promise<Artifact | null> => {
    const docRef = doc(db, 'publicNotes', publicId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
    } as Artifact
  }

  const makePublic = async (id: string, type: 'note' | 'diagram'): Promise<string> => {
    if (!user) throw new Error('Must be logged in')

    const publicId = nanoid(10)
    const artifactRef = doc(db, 'artifacts', id)
    const artifactDoc = await getDoc(artifactRef)
    
    if (!artifactDoc.exists()) throw new Error('Artifact not found')
    
    const data = artifactDoc.data()
    
    // Save to public collection
    await setDoc(doc(db, 'publicNotes', publicId), {
      title: data.title,
      content: data.content,
      publicId,
      type,
      createdAt: serverTimestamp(),
    })

    // Update original document
    await updateDoc(artifactRef, {
      isPublic: true,
      publicId,
    })

    return publicId
  }

  const makePrivate = async (id: string, type: 'note' | 'diagram') => {
    if (!user) throw new Error('Must be logged in')

    const artifactRef = doc(db, 'artifacts', id)
    const artifactDoc = await getDoc(artifactRef)
    
    if (!artifactDoc.exists()) throw new Error('Artifact not found')
    
    const data = artifactDoc.data()
    
    if (data.publicId) {
      await deleteDoc(doc(db, 'publicNotes', data.publicId))
    }

    await updateDoc(artifactRef, {
      isPublic: false,
      publicId: null,
    })
  }

  // Version history
  const getNoteVersions = useCallback((noteId: string): NoteVersion[] => {
    const note = notes.find(n => n.id === noteId)
    return note?.versions || []
  }, [notes])

  const restoreVersion = async (noteId: string, versionId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (!note) throw new Error('Note not found')

    const version = note.versions.find(v => v.id === versionId)
    if (!version) throw new Error('Version not found')

    await updateNote(noteId, { content: version.content })
  }

  // Trash
  const trashedItems = [...notes, ...diagrams].filter(item => item.isDeleted)

  const emptyTrash = async () => {
    if (!user) throw new Error('Must be logged in')

    const batch = writeBatch(db)
    trashedItems.forEach(item => {
      const itemRef = doc(db, 'artifacts', item.id)
      batch.delete(itemRef)
    })
    await batch.commit()
  }

  const allArtifacts = [...notes, ...diagrams]

  return (
    <NotesContext.Provider
      value={{
        notes: notes.filter(n => !n.isDeleted),
        diagrams: diagrams.filter(d => !d.isDeleted),
        artifacts: allArtifacts,
        folders,
        localNotes,
        loading,
        trashedItems,
        createNote,
        updateNote,
        deleteNote,
        restoreNote,
        permanentlyDeleteNote,
        createDiagram,
        updateDiagram,
        deleteDiagram,
        restoreDiagram,
        restoreArtifact,
        permanentlyDeleteArtifact,
        createFolder,
        updateFolder,
        deleteFolder,
        createLocalNote,
        updateLocalNote,
        deleteLocalNote,
        shareLocalNote,
        getPublicNote,
        makePublic,
        makePrivate,
        getNoteVersions,
        restoreVersion,
        emptyTrash,
      }}
    >
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider')
  }
  return context
}
