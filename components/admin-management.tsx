"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { promoteToAdmin, removeAdminPrivileges } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"
import { Shield, ShieldOff, Copy } from "lucide-react"

export function AdminManagement() {
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handlePromoteToAdmin = async () => {
    if (!userId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const success = await promoteToAdmin(userId.trim())

    if (success) {
      toast({
        title: "Success",
        description: "User promoted to admin successfully",
      })
      setUserId("")
    } else {
      toast({
        title: "Error",
        description: "Failed to promote user to admin",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleRemoveAdmin = async () => {
    if (!userId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const success = await removeAdminPrivileges(userId.trim())

    if (success) {
      toast({
        title: "Success",
        description: "Admin privileges removed successfully",
      })
      setUserId("")
    } else {
      toast({
        title: "Error",
        description: "Failed to remove admin privileges",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const copyUserId = () => {
    navigator.clipboard.writeText(userId)
    toast({
      title: "Copied",
      description: "User ID copied to clipboard",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Management
          </CardTitle>
          <CardDescription>
            Promote users to admin or remove admin privileges. You can find user IDs in the Users tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="userId" className="text-sm font-medium">
              User ID
            </label>
            <div className="flex gap-2">
              <Input
                id="userId"
                placeholder="Enter User ID (found in Users tab)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={copyUserId} disabled={!userId}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <Button onClick={handlePromoteToAdmin} disabled={loading || !userId.trim()} className="flex-1">
              <Shield className="h-4 w-4 mr-2" />
              {loading ? "Processing..." : "Promote to Admin"}
            </Button>
            <Button
              onClick={handleRemoveAdmin}
              disabled={loading || !userId.trim()}
              variant="destructive"
              className="flex-1"
            >
              <ShieldOff className="h-4 w-4 mr-2" />
              {loading ? "Processing..." : "Remove Admin"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Add Admins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium">Using User ID</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Go to the "Users" tab to find the user you want to promote</li>
              <li>Copy their User ID from the user list</li>
              <li>Paste the User ID in the field above and click "Promote to Admin"</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
