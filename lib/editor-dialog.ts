export const EDITOR_DIALOG_CONTENT_CLASS =
  'flex flex-col overflow-hidden p-0 gap-0 w-[min(96vw,80rem)] max-w-none sm:max-w-none h-[90vh] max-h-[90vh]'

export type NoteEditorDraft = {
  title: string
  content: string
  tags: string[]
  folderId: string | null
  linkedArtifacts: string[]
  noteId?: string | null
  local?: boolean
}

export type DiagramEditorDraft = {
  title: string
  content: string
  tags: string[]
  folderId: string | null
  diagramId?: string | null
}

const NOTE_DRAFT_KEY = 'quicknote:note-draft'
const DIAGRAM_DRAFT_KEY = 'quicknote:diagram-draft'

export function stashNoteDraft(draft: NoteEditorDraft) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(NOTE_DRAFT_KEY, JSON.stringify(draft))
}

export function takeNoteDraft(): NoteEditorDraft | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(NOTE_DRAFT_KEY)
  if (!raw) return null
  sessionStorage.removeItem(NOTE_DRAFT_KEY)
  try {
    return JSON.parse(raw) as NoteEditorDraft
  } catch {
    return null
  }
}

export function stashDiagramDraft(draft: DiagramEditorDraft) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(DIAGRAM_DRAFT_KEY, JSON.stringify(draft))
}

export function takeDiagramDraft(): DiagramEditorDraft | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(DIAGRAM_DRAFT_KEY)
  if (!raw) return null
  sessionStorage.removeItem(DIAGRAM_DRAFT_KEY)
  try {
    return JSON.parse(raw) as DiagramEditorDraft
  } catch {
    return null
  }
}

export function noteEditorHref(options?: { id?: string | null; local?: boolean }) {
  if (options?.local) {
    return options.id
      ? `/app/local-notes/edit?id=${encodeURIComponent(options.id)}`
      : '/app/local-notes/new'
  }
  return options?.id
    ? `/app/notes/edit?id=${encodeURIComponent(options.id)}`
    : '/app/notes/new'
}

export function diagramEditorHref(options?: { id?: string | null }) {
  return options?.id
    ? `/app/diagrams/edit?id=${encodeURIComponent(options.id)}`
    : '/app/diagrams/new'
}
