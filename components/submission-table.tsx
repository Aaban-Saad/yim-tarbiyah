"use client"

import { calculateCompletionRate } from "@/lib/firestore"
import type { DailySubmission, UserProfile } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface SubmissionTableProps {
  submissions: DailySubmission[]
  users: UserProfile[]
}

export function SubmissionTable({ submissions, users }: SubmissionTableProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<DailySubmission | null>(null)

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user?.displayName || user?.email || "Unknown User"
  }

  const getPrayerIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "masbuq":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>Community daily amal submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No submissions found for the selected criteria.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Submissions ({submissions.length})</CardTitle>
          <CardDescription>Community daily amal submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{getUserName(submission.userId)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(submission.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {" • "}
                      Sleep: {submission.sleepTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{calculateCompletionRate(submission)}% Complete</Badge>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedSubmission(submission)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Prayer Status Summary */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Prayers:</span>
                  {Object.entries(submission.prayers).map(([prayer, status]) => (
                    <div key={prayer} className="flex flex-col md:flex-row items-center gap-1">
                      {getPrayerIcon(status)}
                      <span className="text-xs capitalize">{prayer}</span>
                    </div>
                  ))}
                </div>

                {/* Activities Summary */}
                <div className="flex flex-wrap gap-1">
                  {submission.tilawat && (
                    <Badge variant="secondary" className="text-xs">
                      Tilawat
                    </Badge>
                  )}
                  {submission.dua && (
                    <Badge variant="secondary" className="text-xs">
                      Dua
                    </Badge>
                  )}
                  {submission.sadaqah && (
                    <Badge variant="secondary" className="text-xs">
                      Sadaqah
                    </Badge>
                  )}
                  {submission.zikr && (
                    <Badge variant="secondary" className="text-xs">
                      Zikr
                    </Badge>
                  )}
                  {submission.masnunDua && (
                    <Badge variant="secondary" className="text-xs">
                      Masnun Dua
                    </Badge>
                  )}
                  {submission.bookReading && (
                    <Badge variant="secondary" className="text-xs">
                      Book Reading
                    </Badge>
                  )}
                </div>

                {/* Comments Preview */}
                {submission.comments && (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded truncate">
                    {submission.comments}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <Dialog open={true} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{getUserName(selectedSubmission.userId)}'s Submission</DialogTitle>
              <DialogDescription>
                {new Date(selectedSubmission.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Prayer Details */}
              <div>
                <h4 className="font-medium mb-2">Prayer Status</h4>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(selectedSubmission.prayers).map(([prayer, status]) => (
                    <div key={prayer} className="flex flex-col items-center gap-1 p-2 rounded bg-muted/50">
                      {getPrayerIcon(status)}
                      <span className="text-xs capitalize font-medium">{prayer}</span>
                      <span className="text-xs text-muted-foreground capitalize">{status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div>
                <h4 className="font-medium mb-2">Spiritual Activities</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    {selectedSubmission.tilawat ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Quran Recitation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedSubmission.dua ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Supplication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedSubmission.sadaqah ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Charity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedSubmission.zikr ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Dhikr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedSubmission.masnunDua ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Sunnah Prayers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedSubmission.bookReading ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Book Reading</span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Sleep Time: </span>
                  <span>{selectedSubmission.sleepTime}</span>
                </div>
                <div>
                  <span className="font-medium">Completion Rate: </span>
                  <Badge variant="outline">{calculateCompletionRate(selectedSubmission)}%</Badge>
                </div>
              </div>

              {/* Comments */}
              {selectedSubmission.comments && (
                <div>
                  <h4 className="font-medium mb-2">Comments</h4>
                  <p className="text-sm bg-muted/50 p-3 rounded">{selectedSubmission.comments}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
