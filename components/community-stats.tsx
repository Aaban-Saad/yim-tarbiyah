"use client"

import { useMemo } from "react"
import { calculateCompletionRate } from "@/lib/firestore"
import type { DailySubmission, UserProfile } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface CommunityStatsProps {
  submissions: DailySubmission[]
  users: UserProfile[]
}

export function CommunityStats({ submissions, users }: CommunityStatsProps) {
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

  const COLORS = ["#22c55e", "#eab308", "#ef4444", "#3b82f6", "#8b5cf6"]

  if (submissions.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Community Analytics</CardTitle>
            <CardDescription>Data visualizations and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              No submission data available yet. Analytics will appear once community members start submitting their
              daily amal.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Daily Activity Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity Trends</CardTitle>
          <CardDescription>Community submissions and average completion rates over time</CardDescription>
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

      {/* Prayer Completion Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Prayer Completion Statistics</CardTitle>
          <CardDescription>Community-wide prayer completion rates by prayer time</CardDescription>
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

      {/* Completion Rate Distribution */}

      {/* <Card>
          <CardHeader>
            <CardTitle>Completion Rate Distribution</CardTitle>
            <CardDescription>How community members are performing overall</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Submissions",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.completionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, percentage }) => `${range}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {chartData.completionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card> */}

      {/* Community Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Community Summary</CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{users.length}</div>
              <div className="text-sm text-muted-foreground">Total Members</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{submissions.length}</div>
              <div className="text-sm text-muted-foreground">Total Submissions</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {submissions.length
                  ? Math.round(
                    submissions.reduce((acc, sub) => acc + calculateCompletionRate(sub), 0) / submissions.length,
                  )
                  : 0}
                %
              </div>
              <div className="text-sm text-muted-foreground">Avg Completion</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {submissions.filter((s) => s.date === new Date().toISOString().split("T")[0]).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Today</div>
            </div>
          </div>

          {/* Top Performers */}
          <div>
            <h4 className="font-medium mb-2">Top Performers This Month</h4>
            <div className="space-y-2">
              {users
                .map((user) => {
                  const userSubmissions = submissions.filter((s) => s.userId === user.id)
                  const avgCompletion = userSubmissions.length
                    ? Math.round(
                      userSubmissions.reduce((acc, sub) => acc + calculateCompletionRate(sub), 0) /
                      userSubmissions.length,
                    )
                    : 0
                  return { ...user, avgCompletion, submissionCount: userSubmissions.length }
                })
                .filter((user) => user.submissionCount > 0)
                .sort((a, b) => b.avgCompletion - a.avgCompletion)
                .slice(0, 3)
                .map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <span className="text-sm">{user.displayName}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{user.avgCompletion}%</span>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

  )
}
