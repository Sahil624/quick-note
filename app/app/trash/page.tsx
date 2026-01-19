"use client"

import { useState } from "react"
import { useNotes } from "@/lib/notes-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, RotateCcw, Search, FileText, GitBranch, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { useSearchParams } from "next/navigation"
import { Suspense } from 'react'

export default function TrashPage() {
  return (
    <Suspense fallback={null}>
      <TrashContent />
    </Suspense>
  )
}

function TrashContent() {
  const { user } = useAuth()
  const { notes, artifacts, restoreNote, permanentlyDeleteNote, restoreArtifact, permanentlyDeleteArtifact } = useNotes()
  const [search, setSearch] = useState("")
  const searchParams = useSearchParams()

  const trashedNotes = notes.filter(n => n.isDeleted)
  const trashedArtifacts = artifacts.filter(a => a.isDeleted)

  const filteredNotes = trashedNotes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.content.toLowerCase().includes(search.toLowerCase())
  )

  const filteredArtifacts = trashedArtifacts.filter(artifact =>
    artifact.title.toLowerCase().includes(search.toLowerCase()) ||
    artifact.content.toLowerCase().includes(search.toLowerCase())
  )

  const handleRestoreNote = async (id: string) => {
    await restoreNote(id)
  }

  const handleDeleteNote = async (id: string) => {
    await permanentlyDeleteNote(id)
  }

  const handleRestoreArtifact = async (id: string) => {
    await restoreArtifact(id)
  }

  const handleDeleteArtifact = async (id: string) => {
    await permanentlyDeleteArtifact(id)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              Login Required
            </CardTitle>
            <CardDescription>
              Trash is only available for logged-in users. Anonymous notes are stored locally and cannot be recovered once deleted.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Trash</h1>
        <p className="text-muted-foreground mt-1">
          Recover or permanently delete your items
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search trash..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredNotes.length === 0 && filteredArtifacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trash2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-center">
              {search ? "No items found matching your search" : "Trash is empty"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredNotes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes ({filteredNotes.length})
              </h2>
              <div className="grid gap-3">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="border-dashed">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {note.title || "Untitled Note"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Deleted {format(new Date(note.updatedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreNote(note.id)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This note will be permanently deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteNote(note.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredArtifacts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Artifacts ({filteredArtifacts.length})
              </h2>
              <div className="grid gap-3">
                {filteredArtifacts.map((artifact) => (
                  <Card key={artifact.id} className="border-dashed">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded capitalize">
                            {artifact.type}
                          </span>
                          <h3 className="font-medium text-foreground truncate">
                            {artifact.title || "Untitled Artifact"}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Deleted {format(new Date(artifact.updatedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreArtifact(artifact.id)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This artifact will be permanently deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteArtifact(artifact.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Loading() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

