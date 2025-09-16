"use client"

import { useMemo } from "react"
import { calculateCompletionRate } from "@/lib/firestore"
import type { DailySubmission } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface PersonalStatsProps {
  submissions: DailySubmission[]
  loading: boolean
}

export function PersonalStats({ submissions, loading }: PersonalStatsProps) {
  const stats = useMemo(() => {
    if (submissions.length === 0) {
      return {
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

      // Count activities
      if (submission.tilawat) activityStats.tilawat++
      if (submission.dua) activityStats.dua++
      if (submission.sadaqah) activityStats.sadaqah++
      if (submission.dhikr) activityStats.dhikr++
      if (submission.masnunDua) activityStats.masnunDua++
      if (submission.bookReading) activityStats.bookReading++

      totalCompletion += calculateCompletionRate(submission)
    })

    Object.keys(activityStats).forEach((activity) => {
      activityStats[activity as keyof typeof activityStats] = Math.round(
        (activityStats[activity as keyof typeof activityStats] / totalDays) * 100,
      )
    })

    return {
      activityStats,
      averageCompletion: Math.round(totalCompletion / totalDays),
      totalDays,
    }
  }, [submissions])

  const chartData = useMemo(() => {
    if (submissions.length === 0) return { dailyTrends: [], prayerStats: [], completionDistribution: [] }

    // Daily trends - submissions per day
    const dailySubmissions = submissions.reduce(
      (acc, submission) => {
        const date = submission.date
        if (!acc[date]) {
          acc[date] = { date, count: 0, avgCompletion: 0, totalCompletion: 0 }
        }
        acc[date].count++
        acc[date].totalCompletion += calculateCompletionRate(submission)
        acc[date].avgCompletion = Math.round(acc[date].totalCompletion / acc[date].count)
        return acc
      },
      {} as Record<string, { date: string; count: number; avgCompletion: number; totalCompletion: number }>,
    )

    const dailyTrends = Object.values(dailySubmissions)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30) // Last 30 days

    // Prayer statistics - completion rates for each prayer
    const prayerCounts = {
      fajr: { completed: 0, masbuq: 0, munfarid: 0 },
      zuhr: { completed: 0, masbuq: 0, munfarid: 0 },
      asr: { completed: 0, masbuq: 0, munfarid: 0 },
      maghrib: { completed: 0, masbuq: 0, munfarid: 0 },
      isha: { completed: 0, masbuq: 0, munfarid: 0 },
    }

    submissions.forEach((submission) => {
      Object.entries(submission.prayers).forEach(([prayer, status]) => {
        // Assert that status is a valid key of the inner object
        prayerCounts[prayer as keyof typeof prayerCounts][status as 'completed' | 'masbuq' | 'munfarid']++
      })
    })

    const prayerStats = Object.entries(prayerCounts).map(([prayer, counts]) => {
      const total = counts.completed + counts.masbuq + counts.munfarid
      return {
        prayer: prayer.charAt(0).toUpperCase() + prayer.slice(1),
        completed: total ? Math.round((counts.completed / total) * 100) : 0,
        masbuq: total ? Math.round((counts.masbuq / total) * 100) : 0,
        munfarid: total ? Math.round((counts.munfarid / total) * 100) : 0,
      }
    })

    // Completion rate distribution
    const completionRanges = { "0-20%": 0, "21-40%": 0, "41-60%": 0, "61-80%": 0, "81-100%": 0 }
    submissions.forEach((submission) => {
      const rate = calculateCompletionRate(submission)
      if (rate <= 20) completionRanges["0-20%"]++
      else if (rate <= 40) completionRanges["21-40%"]++
      else if (rate <= 60) completionRanges["41-60%"]++
      else if (rate <= 80) completionRanges["61-80%"]++
      else completionRanges["81-100%"]++
    })

    const completionDistribution = Object.entries(completionRanges).map(([range, count]) => ({
      range,
      count,
      percentage: submissions.length ? Math.round((count / submissions.length) * 100) : 0,
    }))

    return { dailyTrends, prayerStats, completionDistribution }
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

  const activityNames = {
    tilawat: "Quran Recitation",
    dua: "Dua",
    sadaqah: "Charity",
    dhikr: "Dhikr",
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

      {/* Daily Activity Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity Trends</CardTitle>
          <CardDescription>Your submissions and average completion rates over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Submissions",
                color: "orange",
              },
              avgCompletion: {
                label: "Avg Completion %",
                color: "blue",
              },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  }
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  strokeWidth={2}
                  name="Submissions"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgCompletion"
                  stroke="var(--color-avgCompletion)"
                  strokeWidth={2}
                  name="Avg Completion %"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Prayer Statistics */}

      <Card>
        <CardHeader>
          <CardTitle>Prayer Completion Statistics</CardTitle>
          <CardDescription>Your prayer completion rates by prayer time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              completed: {
                label: "Completed",
                color: "green",
              },
              masbuq: {
                label: "Masbuq",
                color: "orange",
              },
              munfarid: {
                label: "Munfarid",
                color: "red",
              },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.prayerStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="prayer" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="var(--color-completed)" name="Completed" />
                <Bar dataKey="masbuq" stackId="a" fill="var(--color-masbuq)" name="Masbuq" />
                <Bar dataKey="munfarid" stackId="a" fill="var(--color-munfarid)" name="Munfarid" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
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
