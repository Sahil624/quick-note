export type ArtifactType = 'note' | 'diagram' | 'math'

export interface Artifact {
  id: string
  type: ArtifactType
  title: string
  content: string
  tags: string[]
  folderId: string | null
  createdAt: Date
  updatedAt: Date
  userId: string | null
  isPublic: boolean
  publicId: string | null
  isDeleted: boolean
  deletedAt: Date | null
}

export interface NoteVersion {
  id: string
  noteId: string
  title: string
  content: string
  createdAt: Date
  versionNumber: number
}

export interface Note extends Artifact {
  type: 'note'
  linkedArtifacts: string[] // IDs of linked artifacts
  versions: NoteVersion[]
}

export interface Diagram extends Artifact {
  type: 'diagram'
  diagramType: 'mermaid'
}

export interface MathArtifact extends Artifact {
  type: 'math'
}

export interface Folder {
  id: string
  name: string
  parentId: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export interface LocalNote {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  publicId: string | null
}

export type FilterType = 'all' | 'notes' | 'diagrams' | 'math'
export type SortType = 'newest' | 'oldest' | 'title' | 'updated'
