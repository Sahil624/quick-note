"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useNotes } from "@/lib/notes-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
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
import { User, Moon, Sun, Trash2, Download, Upload } from "lucide-react"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { notes, artifacts } = useNotes()
  const [darkMode, setDarkMode] = useState(false)

  const handleExport = () => {
    const data = {
      notes: notes.filter(n => !n.isDeleted),
      artifacts: artifacts.filter(a => !a.isDeleted),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `quicknote-export-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account
          </CardTitle>
          <CardDescription>
            Your account information and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email || ""} disabled />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Account Status</p>
                  <p className="text-sm text-muted-foreground">
                    Full access to all features
                  </p>
                </div>
                <span className="px-2 py-1 bg-primary/10 text-primary text-sm rounded">
                  Logged In
                </span>
              </div>
              <Separator />
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Anonymous Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Notes saved locally. Limited features.
                  </p>
                </div>
                <span className="px-2 py-1 bg-muted text-muted-foreground text-sm rounded">
                  Anonymous
                </span>
              </div>
              <Separator />
              <Button asChild>
                <a href="/app/login">Sign In for Full Access</a>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how QuickNote looks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Dark Mode</p>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data
          </CardTitle>
          <CardDescription>
            Export or import your notes and artifacts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Export Data</p>
              <p className="text-sm text-muted-foreground">
                Download all your notes and artifacts as JSON
              </p>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Statistics</p>
              <p className="text-sm text-muted-foreground">
                {notes.filter(n => !n.isDeleted).length} notes, {artifacts.filter(a => !a.isDeleted).length} artifacts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {user && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  Delete All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your notes, 
                    artifacts, and folders from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
