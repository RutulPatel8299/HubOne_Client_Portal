"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, AlertCircle, CheckCircle, Clock, FileText, Heart, TrendingUp, Users, XCircle } from "lucide-react"
import type { User } from "@/app/page"

interface DashboardProps {
  user: User
}

// Mock data for dashboard widgets
const mockData = {
  queueItems: {
    pending: 23,
    inProgress: 8,
    completed: 156,
  },
  paRequests: {
    submitted: 45,
    approved: 32,
    denied: 8,
    pending: 5,
  },
  evStatus: {
    scheduled: 18,
    completed: 142,
    missed: 3,
    pendingVerification: 7,
  },
  recentActivity: [
    { id: 1, type: "PA Approved", patient: "John Smith", time: "2 hours ago", status: "success" },
    { id: 2, type: "Queue Updated", task: "Insurance Verification", time: "3 hours ago", status: "info" },
    { id: 3, type: "PA Denied", patient: "Sarah Johnson", time: "5 hours ago", status: "error" },
    { id: 4, type: "EV Completed", patient: "Mike Davis", time: "1 day ago", status: "success" },
  ],
}

export default function Dashboard({ user }: DashboardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg p-6 border border-accent/20">
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back, {user.username.split("@")[0]}!</h1>
        <p className="text-muted-foreground">Here's what's happening at {user.clinicName} today.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Queue Items</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockData.queueItems.pending}</div>
            <p className="text-xs text-muted-foreground">{mockData.queueItems.inProgress} in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PA Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockData.paRequests.submitted}</div>
            <p className="text-xs text-muted-foreground">
              {mockData.paRequests.approved} approved, {mockData.paRequests.denied} denied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Electronic Visits</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockData.evStatus.scheduled}</div>
            <p className="text-xs text-muted-foreground">{mockData.evStatus.completed} completed this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Math.round((mockData.paRequests.approved / mockData.paRequests.submitted) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                {getStatusIcon(activity.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.patient || activity.task} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              View My Queue ({mockData.queueItems.pending} items)
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Submit New PA Request
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Schedule Electronic Visit
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Generate Monthly Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Status Overview</CardTitle>
          <CardDescription>Current status of all integrated systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200">
              <div>
                <p className="font-medium text-green-900">mySage Integration</p>
                <p className="text-sm text-green-700">All systems operational</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div>
                <p className="font-medium text-blue-900">PA Processing</p>
                <p className="text-sm text-blue-700">Normal processing times</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div>
                <p className="font-medium text-purple-900">EV System</p>
                <p className="text-sm text-purple-700">Ready for scheduling</p>
              </div>
              <Badge className="bg-purple-100 text-purple-800">Ready</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
