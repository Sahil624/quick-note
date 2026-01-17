import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserNotes, createNewNote, deleteNote } from '../services/db'
import { formatDistanceToNow } from 'date-fns'

// --- Sub-Components ---

const Header = ({ onCreate }) => (
    <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Notes</h2>
        <button
            onClick={onCreate}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200"
            title="New Note"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
        </button>
    </div>
)

const SearchBar = ({ search, setSearch }) => (
    <div className="relative mb-8 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
        <input
            type="text"
            placeholder="Search notes"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-full text-sm text-gray-700 placeholder-gray-400 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-orange-200 focus:shadow-lg transition-all duration-300"
        />
    </div>
)

const NoteCard = ({ note, isActive }) => {
    // Styles based on the image: Active gets the orange accent, Inactive is white
    const baseClasses = "relative block p-6 rounded-[2rem] transition-all duration-300 group"

    const activeClasses = isActive
        ? "bg-[#F7B05B] text-white shadow-xl shadow-orange-200 scale-[1.02] z-10"
        : "bg-white text-gray-800 hover:shadow-lg hover:-translate-y-1 border border-transparent hover:border-gray-100"

    const titleColor = isActive ? "text-white" : "text-gray-900"
    const textColor = isActive ? "text-white/90" : "text-gray-500"
    const metaColor = isActive ? "text-white/80" : "text-orange-400"
    const dividerColor = isActive ? "border-white/20" : "border-gray-100"

    const handleDelete = (event, noteId) => {
        event.stopPropagation()
        event.preventDefault()

        console.log("Delete", noteId)

        deleteNote(noteId)
        // Autoselect first note
        if (notes.length > 1) {
            navigate(`/app/note/${notes[0].id}`)
        } else {
            navigate(`/app`)
        }
    }

    return (
        <Link to={`/app/note/${note.id}`} className={`${baseClasses} ${activeClasses}`}>
            {/* Top Row: Title & Status Dot */}
            <div className="flex justify-between items-start mb-3">
                <h3 className={`font-bold text-lg leading-tight truncate pr-4 ${titleColor}`}>
                    {note.title || 'Untitled'}
                </h3>

                {/* Delete Button */}
                <button
                    onClick={(event) => handleDelete(event, note.id)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>

                </button>

                {isActive && (
                    <div className="w-2 h-2 rounded-full bg-white opacity-75 mt-2" />
                )}
            </div>

            {/* Content Snippet */}
            <p className={`text-sm leading-relaxed mb-6 line-clamp-3 font-medium ${textColor}`}>
                {note.content.replace(/[#*`]/g, '').trim() || 'No additional text'}
            </p>

            {/* Footer: Date & Avatar placeholders (to match image vibe) */}
            <div className={`pt-4 border-t ${dividerColor} flex items-center justify-between`}>
                <span className={`text-xs font-semibold tracking-wide uppercase ${textColor}`}>
                    {/* {formatDistanceToNow(new Date(note.updatedAt))} */}
                    {String(note.updatedAt).split('T')[0]}
                </span>

                {/* Decorative Location/Tag text to match image style */}
                <span className={`text-xs font-bold ${metaColor}`}>
                    Note
                </span>
            </div>
        </Link>
    )
}

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center opacity-0 animate-fadeIn fill-mode-forwards" style={{ animationDelay: '100ms' }}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
        </div>
        <p className="text-gray-400 font-medium text-sm">No notes found</p>
    </div>
)

// --- Main Component ---

export default function NoteList() {
    const { user } = useAuth()
    const { id: activeNoteId } = useParams()
    const navigate = useNavigate()
    const [notes, setNotes] = useState([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function load() {
            const data = await getUserNotes(user?.uid)
            setNotes(data)
        }
        load()

        const interval = setInterval(load, 5000)
        return () => clearInterval(interval)
    }, [user])

    const handleCreate = async () => {
        try {
            const newNote = await createNewNote(user?.uid)
            setNotes(prev => [newNote, ...prev])
            navigate(`/app/note/${newNote.id}`)
        } catch (error) {
            console.error("Failed to create note", error)
        }
    }

    const filteredNotes = notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex flex-col w-[var(--notelist-width)] h-screen bg-[#FAFAFA] border-r border-gray-100/50 flex-shrink-0 font-sans">
            {/* Top Section */}
            <div className="px-8 pt-10 pb-2">
                <Header onCreate={handleCreate} />
                <SearchBar search={search} setSearch={setSearch} />
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar space-y-4">
                {filteredNotes.length === 0 ? (
                    <EmptyState />
                ) : (
                    filteredNotes.map(note => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            isActive={activeNoteId === note.id}
                        />
                    ))
                )}
            </div>
        </div>
    )
}