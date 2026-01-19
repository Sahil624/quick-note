"use client"

import React from "react"

import { useState } from "react"
import { useNotes } from "@/lib/notes-context"
import { Artifact } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Package, GitBranch, FileText, Plus } from "lucide-react"
import { format } from "date-fns"

interface ArtifactPickerProps {
  onSelect: (artifact: Artifact) => void
  children?: React.ReactNode
}

export function ArtifactPicker({ onSelect, children }: ArtifactPickerProps) {
  const { artifacts } = useNotes()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"all" | "diagram" | "note">("all")

  const activeArtifacts = artifacts.filter(a => !a.isDeleted)
  
  const filteredArtifacts = activeArtifacts.filter(artifact => {
    const matchesSearch = artifact.title.toLowerCase().includes(search.toLowerCase()) ||
      artifact.content.toLowerCase().includes(search.toLowerCase())
    const matchesType = tab === "all" || artifact.type === tab
    return matchesSearch && matchesType
  })

  const handleSelect = (artifact: Artifact) => {
    onSelect(artifact)
    setOpen(false)
    setSearch("")
  }

  const getArtifactIcon = (type: string) => {
    switch (type) {
      case "diagram":
        return <GitBranch className="h-4 w-4" />
      case "note":
        return <FileText className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Insert Artifact
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Insert Artifact</DialogTitle>
          <DialogDescription>
            Select an artifact to insert into your note. It will be embedded and stay in sync.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artifacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="diagram">Diagrams</TabsTrigger>
              <TabsTrigger value="note">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-4">
              <ScrollArea className="h-[300px]">
                {filteredArtifacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mb-2" />
                    <p>No artifacts found</p>
                    {activeArtifacts.length === 0 && (
                      <p className="text-sm mt-1">Create some artifacts first to use them here</p>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {filteredArtifacts.map((artifact) => (
                      <button
                        key={artifact.id}
                        onClick={() => handleSelect(artifact)}
                        className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            {getArtifactIcon(artifact.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">
                              {artifact.title || "Untitled"}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-1.5 py-0.5 bg-muted rounded capitalize">
                                {artifact.type}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(artifact.updatedAt), "MMM d, yyyy")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {artifact.content.substring(0, 100)}...
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
