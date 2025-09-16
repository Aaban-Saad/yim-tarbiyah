"use client"

import { useMemo } from "react"
import { calculateCompletionRate } from "@/lib/firestore"
import type { DailySubmission } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface PersonalStatsProps {
  submissions: DailySubmission[]
  loading: boolean
}

export function PersonalStats({ submissions, loading }: PersonalStatsProps) {
  const stats = useMemo(() => {
    if (submissions.length === 0) {
      return {
        prayerStats: {
          fajr: 0,
          zuhr: 0,
          asr: 0,
          maghrib: 0,
          isha: 0,
        },
        activityStats: {
          tilawat: 0,
          dua: 0,
          sadaqah: 0,
          zikr: 0,
          masnunDua: 0,
          bookReading: 0,
        },
        averageCompletion: 0,
        totalDays: 0,
      }
    }

    const totalDays = submissions.length
    const prayerStats = {
      fajr: 0,
      zuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    }
    const activityStats = {
      tilawat: 0,
      dua: 0,
      sadaqah: 0,
      dhikr: 0,
      masnunDua: 0,
      bookReading: 0,
    }

    let totalCompletion = 0

    submissions.forEach((submission) => {
      // Count completed prayers
      Object.entries(submission.prayers).forEach(([prayer, status]) => {
        if (status === "completed") {
          prayerStats[prayer as keyof typeof prayerStats]++
        }
      })

      // Count activities
      if (submission.tilawat) activityStats.tilawat++
      if (submission.dua) activityStats.dua++
      if (submission.sadaqah) activityStats.sadaqah++
      if (submission.dhikr) activityStats.dhikr++
      if (submission.masnunDua) activityStats.masnunDua++
      if (submission.bookReading) activityStats.bookReading++

      totalCompletion += calculateCompletionRate(submission)
    })

    // Convert to percentages
    Object.keys(prayerStats).forEach((prayer) => {
      prayerStats[prayer as keyof typeof prayerStats] = Math.round(
        (prayerStats[prayer as keyof typeof prayerStats] / totalDays) * 100,
      )
    })

    Object.keys(activityStats).forEach((activity) => {
      activityStats[activity as keyof typeof activityStats] = Math.round(
        (activityStats[activity as keyof typeof activityStats] / totalDays) * 100,
      )
    })

    return {
      prayerStats,
      activityStats,
      averageCompletion: Math.round(totalCompletion / totalDays),
      totalDays,
    }
  }, [submissions])

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
          <CardTitle>Personal Statistics</CardTitle>
          <CardDescription>Your spiritual journey analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No data available yet. Submit your first daily amal to see statistics!
          </p>
        </CardContent>
      </Card>
    )
  }

  const prayerNames = {
    fajr: "Fajr",
    zuhr: "Zuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
  }

  const activityNames = {
    tilawat: "Quran Recitation",
    dua: "Dua",
    sadaqah: "Charity",
    dhikr : "Dhikr",
    masnunDua: "Masnun Dua",
    bookReading: "Book Reading",
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
          <CardDescription>Based on {stats.totalDays} submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Average Completion Rate</span>
                <span className="text-sm font-bold">{stats.averageCompletion}%</span>
              </div>
              <Progress value={stats.averageCompletion} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prayer Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Prayer Consistency</CardTitle>
          <CardDescription>Percentage of days each prayer was completed with jamaat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.prayerStats).map(([prayer, percentage]) => (
              <div key={prayer}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{prayerNames[prayer as keyof typeof prayerNames]}</span>
                  <span className="text-sm font-bold">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Spiritual Activities</CardTitle>
          <CardDescription>Percentage of days each activity was completed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.activityStats).map(([activity, percentage]) => (
              <div key={activity}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{activityNames[activity as keyof typeof activityNames]}</span>
                  <span className="text-sm font-bold">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
