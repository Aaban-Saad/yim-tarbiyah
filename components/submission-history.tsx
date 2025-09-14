"use client"

import { calculateCompletionRate } from "@/lib/firestore"
import type { DailySubmission } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock } from "lucide-react"

interface SubmissionHistoryProps {
  submissions: DailySubmission[]
  loading: boolean
}

export function SubmissionHistory({ submissions, loading }: SubmissionHistoryProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>Your daily spiritual journey records</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No submissions yet. Start tracking your daily amal today!
          </p>
        </CardContent>
      </Card>
    )
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission History</CardTitle>
        <CardDescription>Your daily spiritual journey records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    {new Date(submission.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <p className="text-sm text-muted-foreground">Sleep time: {submission.sleepTime}</p>
                </div>
                <Badge variant="outline">{calculateCompletionRate(submission)}% Complete</Badge>
              </div>

              {/* Prayer Status */}
              <div>
                <h4 className="text-sm font-medium mb-2">Prayer Status</h4>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(submission.prayers).map(([prayer, status]) => (
                    <div key={prayer} className="flex items-center gap-1">
                      {getPrayerIcon(status)}
                      <span className="text-xs capitalize">{prayer}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Activities */}
              <div>
                <h4 className="text-sm font-medium mb-2">Other Activities</h4>
                <div className="flex flex-wrap gap-2">
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
              </div>

              {/* Comments */}
              {submission.comments && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Comments</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{submission.comments}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
