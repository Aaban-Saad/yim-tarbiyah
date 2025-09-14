"use client"

import { calculateCompletionRate } from "@/lib/firestore"
import type { DailySubmission, UserProfile } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { User, Calendar, TrendingUp } from "lucide-react"

interface UserManagementProps {
  users: UserProfile[]
  submissions: DailySubmission[]
}

export function UserManagement({ users, submissions }: UserManagementProps) {
  const getUserStats = (userId: string) => {
    const userSubmissions = submissions.filter((s) => s.userId === userId)
    const totalSubmissions = userSubmissions.length
    const averageCompletion = totalSubmissions
      ? Math.round(userSubmissions.reduce((acc, sub) => acc + calculateCompletionRate(sub), 0) / totalSubmissions)
      : 0

    // Calculate streak (simplified - consecutive days from most recent)
    const sortedSubmissions = userSubmissions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    let currentDate = new Date()

    for (const submission of sortedSubmissions) {
      const submissionDate = new Date(submission.date)
      const daysDiff = Math.floor((currentDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24))

      // if (daysDiff === currentStreak) {
      //   currentStreak++
      //   currentDate = submissionDate
      // } else {
      //   break
      // }
    }

    return {
      totalSubmissions,
      averageCompletion,
      lastSubmission: sortedSubmissions[0]?.date || null,
    }
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Community member overview</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No users found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management ({users.length})</CardTitle>
        <CardDescription>Community member overview and statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => {
            const stats = getUserStats(user.id)
            return (
              <div key={user.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.displayName}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                  <div className="flex items-center gap-2">
                    {user.isAdmin && <Badge variant="secondary">Admin</Badge>}
                    <Badge variant="outline">
                      Joined {new Date(user.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </Badge>
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{stats.totalSubmissions} Submissions</p>
                      <p className="text-xs text-muted-foreground">
                        Last: {stats.lastSubmission ? new Date(stats.lastSubmission).toLocaleDateString() : "Never"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">Avg Completion</p>
                      <p className="text-sm font-bold">{stats.averageCompletion}%</p>
                    </div>
                    <Progress value={stats.averageCompletion} className="h-2" />
                  </div>
                </div>

                {/* Performance Indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Performance:</span>
                  {stats.averageCompletion >= 80 ? (
                    <Badge className="bg-green-100 text-emerald-500 hover:bg-green-100">Excellent</Badge>
                  ) : stats.averageCompletion >= 60 ? (
                    <Badge className="bg-yellow-100 text-yellow-500 hover:bg-yellow-100">Good</Badge>
                  ) : stats.averageCompletion >= 40 ? (
                    <Badge className="bg-orange-100 text-orange-500 hover:bg-orange-100">Needs Improvement</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-500 hover:bg-red-100">Bad</Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
