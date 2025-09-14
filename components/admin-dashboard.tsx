"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAllSubmissions, getAllUsers, getSubmissionsByDate, calculateCompletionRate } from "@/lib/firestore"
import type { DailySubmission, UserProfile } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CommunityStats } from "@/components/community-stats"
import { SubmissionTable } from "@/components/submission-table"
import { UserManagement } from "@/components/user-management"
import { Calendar, Users, TrendingUp, Activity, ArrowLeft, Search, Filter, BarChart3 } from "lucide-react"
import { AdminManagement } from "@/components/admin-management"
import Image from "next/image"
import Link from "next/link"

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const [submissions, setSubmissions] = useState<DailySubmission[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [allSubmissions, allUsers] = await Promise.all([getAllSubmissions(200), getAllUsers()])
        setSubmissions(allSubmissions)
        setUsers(allUsers)
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDateFilter = async (date: string) => {
    setSelectedDate(date)
    try {
      const dateSubmissions = await getSubmissionsByDate(date)
      setSubmissions(dateSubmissions)
    } catch (error) {
      console.error("Error filtering by date:", error)
    }
  }

  const handleShowAll = async () => {
    try {
      const allSubmissions = await getAllSubmissions(200)
      setSubmissions(allSubmissions)
      setSelectedDate("")
    } catch (error) {
      console.error("Error fetching all submissions:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Calculate community stats
  const communityStats = {
    totalMembers: users.length,
    activeToday: submissions.filter((s) => s.date === new Date().toISOString().split("T")[0]).length,
    averageCompletion: submissions.length
      ? Math.round(submissions.reduce((acc, sub) => acc + calculateCompletionRate(sub), 0) / submissions.length)
      : 0,
    totalSubmissions: submissions.length,
  }

  const filteredSubmissions = submissions.filter((submission) => {
    if (!searchTerm) return true
    const user = users.find((u) => u.id === submission.userId)
    return (
      user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.comments?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (loading) {
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
            <div className="flex items-center gap-4">
              <Image src="/logo.png" width={50} height={50} alt="logo" />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">YIM Tarbiyat Community Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">Admin</Badge>
              <span className="hidden md:block text-sm font-medium">{user?.displayName}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Community Overview Cards */}

        <Button className="mb-10" variant="ghost" size="sm" asChild>
          <a href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </a>
        </Button>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communityStats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communityStats.activeToday}</div>
              <p className="text-xs text-muted-foreground">Submitted today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communityStats.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communityStats.averageCompletion}%</div>
              <p className="text-xs text-muted-foreground">Community average</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Submissions</CardTitle>
                <CardDescription>Filter and search through community submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search by user or comments</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search users or comments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2">
                    <div>
                      <Label htmlFor="date">Filter by date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateFilter(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button variant="outline" onClick={handleShowAll}>
                        <Filter className="h-4 w-4 mr-2" />
                        Show All
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submissions Table */}
            <SubmissionTable submissions={filteredSubmissions} users={users} />
          </TabsContent>

          <TabsContent value="analytics">
            <CommunityStats submissions={submissions} users={users} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement users={users} submissions={submissions} />
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <div className="grid gap-6">
              <AdminManagement />

              <Card>
                <CardHeader>
                  <CardTitle>Current Admins</CardTitle>
                  <CardDescription>List of users with admin privileges</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {users
                      .filter((user) => user.isAdmin)
                      .map((admin) => (
                        <div key={admin.id} className="flex flex-col md:flex-row gap-1 items-start justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{admin.displayName}</p>
                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                            <p className="text-xs text-muted-foreground">ID: {admin.id}</p>
                          </div>
                          <Badge variant="secondary">Admin</Badge>
                        </div>
                      ))}
                    {users.filter((user) => user.isAdmin).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No admin users found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <p className="my-10 text-muted-foreground text-center opacity-50">Designed and developed by<br />
        <Link className="hover:underline font-bold" href="https://chatpoka.com" target="_blank">
          Chatpoka Technologies
        </Link>
      </p>
    </div>
  )
}
