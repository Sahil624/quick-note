'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FileText, 
  GitBranch, 
  FolderOpen, 
  Search, 
  Settings, 
  Plus, 
  Trash2, 
  ChevronRight,
  LogOut,
  User,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth-context'
import { useNotes } from '@/lib/notes-context'
import { Folder } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  onNewNote?: () => void
  onNewDiagram?: () => void
}

export function AppSidebar({ onNewNote, onNewDiagram }: AppSidebarProps) {
  const pathname = usePathname()
  const { user, signOut, isAnonymous } = useAuth()
  const { folders, notes, diagrams, trashedItems } = useNotes()
  const [searchQuery, setSearchQuery] = useState('')
  const [foldersOpen, setFoldersOpen] = useState(true)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="w-64 h-full flex flex-col border-r border-border bg-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">QuickNote</span>
        </Link>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-sidebar-border">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-sidebar-accent/50 border-sidebar-border"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 space-y-1">
        {!isAnonymous && (
          <>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-9 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={onNewNote}
            >
              <Plus className="w-4 h-4" />
              New Note
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-9 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={onNewDiagram}
            >
              <GitBranch className="w-4 h-4" />
              New Diagram
            </Button>
          </>
        )}
        {isAnonymous && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={onNewNote}
          >
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <Link href="/app">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 h-9 text-sidebar-foreground",
              pathname === '/app' && "bg-sidebar-accent"
            )}
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
        </Link>

        {!isAnonymous && (
          <>
            <Link href="/app/notes">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 h-9 text-sidebar-foreground",
                  pathname === '/app/notes' && "bg-sidebar-accent"
                )}
              >
                <FileText className="w-4 h-4" />
                All Notes
                <span className="ml-auto text-xs text-muted-foreground">{notes.length}</span>
              </Button>
            </Link>

            <Link href="/app/diagrams">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 h-9 text-sidebar-foreground",
                  pathname === '/app/diagrams' && "bg-sidebar-accent"
                )}
              >
                <GitBranch className="w-4 h-4" />
                Diagrams
                <span className="ml-auto text-xs text-muted-foreground">{diagrams.length}</span>
              </Button>
            </Link>

            {/* Folders */}
            <Collapsible open={foldersOpen} onOpenChange={setFoldersOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-9 text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <ChevronRight className={cn("w-4 h-4 transition-transform", foldersOpen && "rotate-90")} />
                  <FolderOpen className="w-4 h-4" />
                  Folders
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 space-y-1 mt-1">
                {folders.map((folder: Folder) => (
                  <Link key={folder.id} href={`/app/folder/${folder.id}`}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-2 h-8 text-sm text-sidebar-foreground",
                        pathname === `/app/folder/${folder.id}` && "bg-sidebar-accent"
                      )}
                    >
                      <FolderOpen className="w-3 h-3" />
                      {folder.name}
                    </Button>
                  </Link>
                ))}
                {folders.length === 0 && (
                  <p className="text-xs text-muted-foreground py-2 px-2">No folders yet</p>
                )}
              </CollapsibleContent>
            </Collapsible>

            <Link href="/app/trash">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 h-9 text-sidebar-foreground",
                  pathname === '/app/trash' && "bg-sidebar-accent"
                )}
              >
                <Trash2 className="w-4 h-4" />
                Trash
                {trashedItems.length > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground">{trashedItems.length}</span>
                )}
              </Button>
            </Link>
          </>
        )}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border">
        {isAnonymous ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground px-2">
              Sign in for full features
            </p>
            <Link href="/app/login">
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 h-10">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  {user?.photoURL ? (
                    <img src={user.photoURL || "/placeholder.svg"} alt="" className="w-7 h-7 rounded-full" />
                  ) : (
                    <User className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/app/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
