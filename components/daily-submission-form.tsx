"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTodaySubmission } from "@/lib/hooks/use-submissions"
import type { DailySubmission, PrayerStatus } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Save, X, Hourglass } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface DailySubmissionFormProps {
  existingSubmission?: DailySubmission | null
  onClose: () => void
  onSuccess: () => void
}

export function DailySubmissionForm({ existingSubmission, onClose, onSuccess }: DailySubmissionFormProps) {
  const { submit, update } = useTodaySubmission()
  const [loading, setLoading] = useState(false)

  // Form state
  const [prayers, setPrayers] = useState<PrayerStatus>({
    fajr: "munfarid",
    zuhr: "munfarid",
    asr: "munfarid",
    maghrib: "munfarid",
    isha: "munfarid",
  })

  const [activities, setActivities] = useState({
    tilawat: false,
    dua: false,
    sadaqah: false,
    zikr: false,
    masnunDua: false,
    bookReading: false,
  })

  const [activityComments, setActivityComments] = useState({
    tilawat: "",
    dua: "",
    sadaqah: "",
    zikr: "",
    masnunDua: "",
    bookReading: "",
  })

  const [sleepTime, setSleepTime] = useState("")
  const [comments, setComments] = useState("")

  // Initialize form with existing data
  useEffect(() => {
    if (existingSubmission) {
      setPrayers(existingSubmission.prayers)
      setActivities({
        tilawat: existingSubmission.tilawat,
        dua: existingSubmission.dua,
        sadaqah: existingSubmission.sadaqah,
        zikr: existingSubmission.zikr,
        masnunDua: existingSubmission.masnunDua,
        bookReading: existingSubmission.bookReading,
      })
      setActivityComments({
        tilawat: existingSubmission.tilawatComment,
        dua: existingSubmission.duaComment,
        sadaqah: existingSubmission.sadaqahComment,
        zikr: existingSubmission.zikrComment,
        masnunDua: existingSubmission.masnunDuaComment,
        bookReading: existingSubmission.bookReadingComment,
      })
      setSleepTime(existingSubmission.sleepTime)
      setComments(existingSubmission.comments)
    }
  }, [existingSubmission])

  const handlePrayerChange = (prayer: keyof PrayerStatus, status: "completed" | "munfarid" | "masbuq") => {
    setPrayers((prev) => ({ ...prev, [prayer]: status }))
  }

  const handleActivityChange = (activity: keyof typeof activities, checked: boolean) => {
    setActivities((prev) => ({ ...prev, [activity]: checked }))
  }

  const handleActivityCommentChange = (activity: keyof typeof activityComments, comment: string) => {
    setActivityComments((prev) => ({ ...prev, [activity]: comment }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submissionData = {
        prayers,
        tilawat: activities.tilawat,
        dua: activities.dua,
        sadaqah: activities.sadaqah,
        zikr: activities.zikr,
        masnunDua: activities.masnunDua,
        bookReading: activities.bookReading,
        tilawatComment: activityComments.tilawat,
        duaComment: activityComments.dua,
        sadaqahComment: activityComments.sadaqah,
        zikrComment: activityComments.zikr,
        masnunDuaComment: activityComments.masnunDua,
        bookReadingComment: activityComments.bookReading,
        sleepTime,
        comments,
      }

      if (existingSubmission) {
        await update(submissionData, new Date().toISOString().split("T")[0])
        toast({
          title: "Updated successfully",
          description: "Your daily amal has been updated.",
        })
      } else {
        await submit(submissionData, new Date().toISOString().split("T")[0])
        toast({
          title: "Submitted successfully",
          description: "Your daily amal has been recorded.",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "Failed to submit your daily amal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setTimeout(function () {
        window.location.reload();
      }, 100);
    }
  }

  const prayerNames = {
    fajr: "ফজরের জামাত (Fajr Jamaat)",
    zuhr: "যোহরের জামাত (Zuhr Jamaat)",
    asr: "আসরের জামাত (Asr Jamaat)",
    maghrib: "মাগরিবের জামাত (Maghrib Jamaat)",
    isha: "ইশার জামাত (Isha Jamaat)",
  }

  const activityNames = {
    tilawat: "তিলাওয়াত (Quran Recitation)",
    dua: "দোয়া করেছি (Supplication)",
    sadaqah: "সদাকাহ করেছি (Charity)",
    zikr: "জিকির করেছি (Dhikr / Remembrance of Allah)",
    masnunDua: "মাসনুন দোয়া করেছি (Sunnah Prayers)",
    bookReading: "বই পড়েছি(নির্ধারিত অংশ) (Read a book - assigned portion)",
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "masbuq":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "masbuq":
        return "text-yellow-600"
      default:
        return "text-red-600"
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[96vw] max-w-2xl max-h-[80vh] overflow-y-auto py-14 md:py-10 px-4 md:px-10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">YT</span>
            </div>
            {existingSubmission ? "Edit Today's Amal" : "Submit Today's Amal"}
          </DialogTitle>
          <DialogDescription className="text-start">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prayer Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Prayers</CardTitle>
              <CardDescription>Select the status for each prayer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(prayerNames).map(([prayer, name]) => (
                <div key={prayer} className="space-y-2">
                  <Label className="text-sm font-medium">{name}</Label>
                  <RadioGroup
                    value={prayers[prayer as keyof PrayerStatus]}
                    onValueChange={(value) =>
                      handlePrayerChange(prayer as keyof PrayerStatus, value as "completed" | "munfarid" | "masbuq")
                    }
                    className="flex flex-col md:flex-row gap-2 md:gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="completed" id={`${prayer}-completed`} />
                      <Label htmlFor={`${prayer}-completed`} className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Completed
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="masbuq" id={`${prayer}-masbuq`} />
                      <Label htmlFor={`${prayer}-masbuq`} className="flex items-center gap-1 text-yellow-600">
                        <Clock className="h-4 w-4" />
                        Masbuq
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="munfarid" id={`${prayer}-munfarid`} />
                      <Label htmlFor={`${prayer}-munfarid`} className="flex items-center gap-1 text-red-600">
                        <Hourglass className="h-4 w-4" />
                        Munfarid
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activities Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Spiritual Activities</CardTitle>
              <CardDescription>Check the activities you completed today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(activityNames).map(([activity, name]) => (
                <div className="flex flex-col items-start gap-2 border-t-2">
                  <div key={activity} className="flex items-center space-x-2 mt-3">
                    <Checkbox
                      id={activity}
                      checked={activities[activity as keyof typeof activities]}
                      onCheckedChange={(checked) =>
                        handleActivityChange(activity as keyof typeof activities, checked as boolean)
                      }
                    />
                    <Label htmlFor={activity} className="text-sm">
                      {name}
                    </Label>
                  </div>
                  <Input value={activityComments[activity as keyof typeof activityComments]} placeholder="Comment" onChange={(e) => handleActivityCommentChange(activity as keyof typeof activityComments, e.target.value)} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sleep Time and Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sleepTime">ঘুমিয়েছি (Sleep Time)</Label>
                <Input
                  id="sleepTime"
                  placeholder="e.g., 10 PM"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">মন্তব্য (Comments)</Label>
                <Textarea
                  id="comments"
                  placeholder="Any additional thoughts or reflections..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Prayer Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(prayers).map(([prayer, status]) => (
                      <Badge key={prayer} variant="outline" className="flex items-center gap-1">
                        {getStatusIcon(status)}
                        <span className="capitalize">{prayer}</span>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Completed Activities</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(activities)
                      .filter(([, completed]) => completed)
                      .map(([activity]) => (
                        <Badge key={activity} variant="secondary" className="text-xs">
                          {activity.charAt(0).toUpperCase() + activity.slice(1)}
                        </Badge>
                      ))}
                    {Object.values(activities).every((v) => !v) && (
                      <span className="text-sm text-muted-foreground">No activities completed</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col md:flex-row gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {existingSubmission ? "Update" : "Submit"} Amal
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
