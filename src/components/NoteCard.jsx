import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

export default function NoteCard({ note, onDelete }) {
    // simple content preview (strip markdown symbols roughly)
    const preview = note.content
        .replace(/[#*`]/g, '')
        .slice(0, 100)
        .trim() || 'Empty note...'

    const handleDelete = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (window.confirm('Delete this note permanent?')) {
            onDelete(note.id)
        }
    }

    return (
        <Link
            to={`/note/${note.id}`}
            className="group block p-5 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors truncate pr-4">
                    {note.title || 'Untitled Note'}
                </h3>
                <button
                    onClick={handleDelete}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                    title="Delete note"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 h-10 mb-4">
                {preview}
            </p>

            <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>

                {note.isPublic && (
                    <span className="flex items-center gap-1 text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Public
                    </span>
                )}
            </div>
        </Link>
    )
}
