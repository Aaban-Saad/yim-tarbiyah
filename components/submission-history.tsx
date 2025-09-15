"use client"

import { calculateCompletionRate } from "@/lib/firestore"
import type { DailySubmission } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Hourglass } from "lucide-react"
import { Button } from "./ui/button"
import { useState } from "react"
import { PastSubmissionForm } from "./past-submission-form"

interface SubmissionHistoryProps {
  submissions: DailySubmission[]
  loading: boolean
}

export function SubmissionHistory({ submissions, loading }: SubmissionHistoryProps) {
  const [submissionIndex, setSubmissionsIndex] = useState<number>(0)
  const [showSubmissionForm, setShowSubmissionForm] = useState<boolean>(false)
  const [showNewPastSubmissionForm, setShowNewPastSubmissionForm] = useState<boolean>(false)

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
        return <Hourglass className="h-4 w-4 text-red-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission History</CardTitle>
        <CardDescription>Your daily spiritual journey records</CardDescription>
        <Button className="w-fit" variant={'link'} onClick={() => setShowNewPastSubmissionForm(true)}>Submit Previous Amal</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {submissions.map((submission, index) => (
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
                <div className="flex flex-col md:flex-row gap-2">
                  <Button className="hover:cursor-pointer" variant={'secondary'} onClick={() => {
                    setSubmissionsIndex(index)
                    setShowSubmissionForm(true)
                  }}>Edit</Button>
                  <Badge variant="outline">{calculateCompletionRate(submission)}% Complete</Badge>
                </div>
              </div>

              {/* Prayer Status */}
              <div>
                <h4 className="text-sm font-medium mb-2">Prayer Status</h4>
                <div className="grid grid-cols-5 gap-2">

                  <div className="flex flex-col items-center gap-1">
                    {getPrayerIcon(submission.prayers.fajr)}
                    <span className="text-xs md:text-sm capitalize">Fajr</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    {getPrayerIcon(submission.prayers.zuhr)}
                    <span className="text-xs md:text-sm capitalize">Zuhr</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    {getPrayerIcon(submission.prayers.asr)}
                    <span className="text-xs md:text-sm capitalize">Asr</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    {getPrayerIcon(submission.prayers.maghrib)}
                    <span className="text-xs md:text-sm capitalize">Maghrib</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    {getPrayerIcon(submission.prayers.isha)}
                    <span className="text-xs md:text-sm capitalize">Isha</span>
                  </div>
                </div>
              </div>

              {/* Other Activities */}
              <div>
                <h4 className="text-sm font-medium mb-2">Other Activities</h4>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Badge variant={submission.tilawat ? "default" : "destructive"} className="text-xs w-22">
                      Tilawat
                    </Badge>
                    <p>{submission.tilawatComment}</p>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant={submission.dua ? "default" : "destructive"} className="text-xs w-22">
                      Dua
                    </Badge>
                    <p>{submission.duaComment}</p>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant={submission.sadaqah ? "default" : "destructive"} className="text-xs w-22">
                      Sadaqah
                    </Badge>
                    <p>{submission.sadaqahComment}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={submission.zikr ? "default" : "destructive"} className="text-xs w-22">
                      Zirk
                    </Badge>
                    <p>{submission.zikrComment}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={submission.masnunDua ? "default" : "destructive"} className="text-xs w-22">
                      Masnun Dua
                    </Badge>
                    <p>{submission.masnunDuaComment}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={submission.bookReading ? "default" : "destructive"} className="text-xs w-22">
                      Book Reading
                    </Badge>
                    <p>{submission.bookReadingComment}</p>
                  </div>
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


      {showSubmissionForm && (
        <PastSubmissionForm
          existingSubmission={submissions[submissionIndex]}
          onClose={() => setShowSubmissionForm(false)}
          onSuccess={() => {
            setShowSubmissionForm(false)
            // Refresh data would happen automatically via hooks
          }}
          date = {submissions[submissionIndex].date}
          newEntry = {false}
        />
      )}

      {showNewPastSubmissionForm && (
        <PastSubmissionForm
          onClose={() => {
            setShowNewPastSubmissionForm(false)
          }}
          onSuccess={() => {
            setShowNewPastSubmissionForm(false)
          }}
          newEntry = {true}
        />
      )}

    </Card>
  )
}
