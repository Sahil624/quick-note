"use client"

import { useEffect, useState, use } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Note } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { FileText, ArrowLeft, Calendar, Tag } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { redirect } from "next/navigation"

interface SharePageProps {
    params: Promise<{ id: string }>
}

export default function ShareClient({ params }: SharePageProps) {
    const resolvedParams = use(params)
    const [note, setNote] = useState<Note | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchNote() {
            try {
                // Redirect to home if no id
                if (!resolvedParams.id) {
                    redirect("/")
                }
                const noteDoc = await getDoc(doc(db, "publicNotes", resolvedParams.id))
                if (noteDoc.exists()) {
                    const data = noteDoc.data()
                    setNote({ id: noteDoc.id, ...data } as Note)
                } else {
                    setError("Note not found")
                }
            } catch {
                setError("Failed to load note")
            } finally {
                setLoading(false)
            }
        }

        fetchNote()
    }, [resolvedParams.id])

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Loading...
                </div>
            </div>
        )
    }

    if (error || !note) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h2 className="text-lg font-medium text-foreground mb-2">
                            {error || "Note not found"}
                        </h2>
                        <p className="text-muted-foreground text-center mb-4">
                            This note may have been deleted or is no longer public.
                        </p>
                        <Link href="/">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Go to QuickNote
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="font-semibold">QuickNote</span>
                    </Link>
                    <Link href="/app">
                        <Button size="sm">Open App</Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <Card>
                    <CardHeader className="border-b">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">
                                    {note.title || "Untitled Note"}
                                </CardTitle>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {format(new Date(note.createdAt), "MMMM d, yyyy")}
                                    </span>
                                    {note.tags && note.tags.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Tag className="h-4 w-4" />
                                            {note.tags.join(", ")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <MarkdownRenderer content={note.content} />
                    </CardContent>
                </Card>
            </main>

            <footer className="border-t border-border mt-12">
                <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
                    Shared via{" "}
                    <Link href="/" className="text-primary hover:underline">
                        QuickNote
                    </Link>
                </div>
            </footer>
        </div>
    )
}
