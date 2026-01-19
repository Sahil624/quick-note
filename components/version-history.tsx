"use client"

import { useState } from "react"
import { Note, NoteVersion } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, ChevronRight, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import { MarkdownRenderer } from "./markdown-renderer"

interface VersionHistoryProps {
  note: Note
  onRestore: (version: NoteVersion) => void
}

export function VersionHistory({ note, onRestore }: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<NoteVersion | null>(null)
  const [open, setOpen] = useState(false)

  const versions = note.versions || []

  if (versions.length === 0) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          History ({versions.length})
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Version History</SheetTitle>
          <SheetDescription>
            View and restore previous versions of this note (last 3 versions)
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 flex gap-4 h-[calc(100vh-12rem)]">
          <div className="w-1/3 border-r pr-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Versions</h3>
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {versions.map((version, index) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersion(version)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedVersion?.id === version.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Version {versions.length - index}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(version.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="flex-1 flex flex-col">
            {selectedVersion ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-foreground">
                      {selectedVersion.title || "Untitled"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedVersion.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      onRestore(selectedVersion)
                      setOpen(false)
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore
                  </Button>
                </div>
                <ScrollArea className="flex-1 border rounded-lg p-4 bg-muted/30">
                  <MarkdownRenderer content={selectedVersion.content} />
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a version to preview
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
