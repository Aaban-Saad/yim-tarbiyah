"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useTodaySubmission, useUserSubmissions } from "@/lib/hooks/use-submissions"
import { calculateCompletionRate } from "@/lib/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DailySubmissionForm } from "@/components/daily-submission-form"
import { PersonalStats } from "@/components/personal-stats"
import { SubmissionHistory } from "@/components/submission-history"
import { Calendar, CheckCircle, Clock, TrendingUp, User, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function UserDashboard() {
  const { user, logout, isAdmin } = useAuth()
  const { submission: todaySubmission, hasSubmittedToday, loading: todayLoading } = useTodaySubmission()
  const { submissions, loading: historyLoading } = useUserSubmissions()
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)

  const todayCompletionRate = todaySubmission ? calculateCompletionRate(todaySubmission) : 0

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  if (todayLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" width={50} height={50} alt="logo" />
              <div>
                <h1 className="text-xl font-bold text-foreground">YIM Tarbiyah</h1>
                <p className="text-sm text-muted-foreground">Spiritual Journey Tracker</p>
              </div>
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-1 justify-end">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{user?.displayName}</span>
            {isAdmin && <Badge variant="secondary">Admin</Badge>}
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm mb-5 text-right">{user?.email}</div>
        {/* Today's Status */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Today's Progress
                  </CardTitle>
                  <CardDescription>
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </div>
                <div className="text-right">
                  {hasSubmittedToday ? (
                    <div className="flex items-center gap-2 text-primary">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Submitted</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-5 w-5" />
                      <span>Pending</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-sm font-bold">{todayCompletionRate}%</span>
                  </div>
                  <Progress value={todayCompletionRate} className="h-2" />
                </div>
                <div className="flex gap-2">
                  {hasSubmittedToday ? (
                    <Button onClick={() => setShowSubmissionForm(true)} variant="outline" size="sm">
                      Edit Today's Entry
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowSubmissionForm(true)}
                      className="bg-primary hover:bg-primary/90"
                      size="sm"
                    >
                      Submit Today's Amal
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{submissions.length}</div>
                  <p className="text-xs text-muted-foreground">Since joining the community</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {submissions.length > 0
                      ? Math.round(
                        submissions.reduce((acc, sub) => acc + calculateCompletionRate(sub), 0) / submissions.length,
                      )
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">Overall performance</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your last 7 submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : submissions.length > 0 ? (
                  <div className="space-y-3">
                    {submissions
                      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 7)
                      .map((submission) => (
                        <div key={submission.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div>
                            <p className="font-medium">{new Date(submission.date).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">{submission.comments || "No comments"}</p>
                          </div>
                          <Badge variant="outline">{calculateCompletionRate(submission)}%</Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No submissions yet. Start your spiritual journey today!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <SubmissionHistory submissions={submissions} loading={historyLoading} />
          </TabsContent>

          <TabsContent value="stats">
            <PersonalStats submissions={submissions} loading={historyLoading} />
          </TabsContent>
        </Tabs>

        {/* Daily Submission Form Modal */}
        {showSubmissionForm && (
          <DailySubmissionForm
            existingSubmission={todaySubmission}
            onClose={() => setShowSubmissionForm(false)}
            onSuccess={() => {
              setShowSubmissionForm(false)
              // Refresh data would happen automatically via hooks
            }}
          />
        )}

        {/* Admin Link */}
        {isAdmin && (
          <div className="fixed bottom-6 right-6">
            <Button asChild className="shadow-lg">
              <a href="/admin">Admin Dashboard</a>
            </Button>
          </div>
        )}
      </main>
      <p className="my-10 text-muted-foreground text-center opacity-50">Designed and developed by<br />
        <Link className="hover:underline font-bold" href="https://chatpoka.com" target="_blank">
          Chatpoka Technologies
        </Link>
      </p>
    </div>
  )
}
