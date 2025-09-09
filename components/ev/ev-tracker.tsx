"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Heart,
  CalendarIcon,
  Download,
  Eye,
  Video,
  Phone,
  MapPin,
  Stethoscope,
  Plus,
} from "lucide-react"
import { format } from "date-fns"
import type { User as UserType } from "@/app/page"

interface EVVisit {
  id: string
  patientName: string
  patientId: string
  visitType: "Telehealth" | "In-Person" | "Phone Consultation" | "Follow-up"
  appointmentDate: string
  appointmentTime: string
  duration: number // in minutes
  provider: string
  status: "Scheduled" | "Completed" | "Missed" | "Pending Verification" | "In Progress" | "Cancelled"
  visitReason: string
  notes: string
  vitals?: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    weight?: number
    height?: number
  }
  diagnosis?: string[]
  prescriptions?: string[]
  followUpRequired: boolean
  followUpDate?: string
  insuranceVerified: boolean
  copayCollected: boolean
  copayAmount?: number
}

interface EVTrackerProps {
  user: UserType
}

// Mock EV data
const mockEVVisits: EVVisit[] = [
  {
    id: "EV001",
    patientName: "John Smith",
    patientId: "P12345",
    visitType: "Telehealth",
    appointmentDate: "2024-01-15",
    appointmentTime: "09:00",
    duration: 30,
    provider: "Dr. Johnson",
    status: "Completed",
    visitReason: "Annual Physical Exam",
    notes: "Patient reports feeling well. No acute concerns. Discussed preventive care measures.",
    vitals: {
      bloodPressure: "120/80",
      heartRate: 72,
      temperature: 98.6,
      weight: 180,
      height: 70,
    },
    diagnosis: ["Z00.00 - Encounter for general adult medical examination without abnormal findings"],
    prescriptions: ["Multivitamin daily"],
    followUpRequired: true,
    followUpDate: "2024-07-15",
    insuranceVerified: true,
    copayCollected: true,
    copayAmount: 25,
  },
  {
    id: "EV002",
    patientName: "Sarah Johnson",
    patientId: "P12346",
    visitType: "In-Person",
    appointmentDate: "2024-01-15",
    appointmentTime: "10:30",
    duration: 45,
    provider: "Dr. Smith",
    status: "In Progress",
    visitReason: "Chest Pain Evaluation",
    notes: "Patient experiencing intermittent chest pain for 2 weeks. EKG ordered.",
    vitals: {
      bloodPressure: "140/90",
      heartRate: 88,
      temperature: 99.1,
    },
    diagnosis: [],
    prescriptions: [],
    followUpRequired: false,
    insuranceVerified: true,
    copayCollected: false,
    copayAmount: 40,
  },
  {
    id: "EV003",
    patientName: "Mike Davis",
    patientId: "P12347",
    visitType: "Phone Consultation",
    appointmentDate: "2024-01-15",
    appointmentTime: "14:00",
    duration: 15,
    provider: "Dr. Wilson",
    status: "Scheduled",
    visitReason: "Medication Review",
    notes: "",
    followUpRequired: false,
    insuranceVerified: true,
    copayCollected: false,
    copayAmount: 15,
  },
  {
    id: "EV004",
    patientName: "Emily Wilson",
    patientId: "P12348",
    visitType: "Telehealth",
    appointmentDate: "2024-01-14",
    appointmentTime: "11:00",
    duration: 30,
    provider: "Dr. Brown",
    status: "Missed",
    visitReason: "Diabetes Follow-up",
    notes: "Patient did not join telehealth session. Attempted to contact via phone.",
    followUpRequired: true,
    insuranceVerified: true,
    copayCollected: false,
    copayAmount: 30,
  },
  {
    id: "EV005",
    patientName: "Robert Brown",
    patientId: "P12349",
    visitType: "In-Person",
    appointmentDate: "2024-01-14",
    appointmentTime: "15:30",
    duration: 60,
    provider: "Dr. Davis",
    status: "Pending Verification",
    visitReason: "Post-operative Check",
    notes: "Patient recovering well from knee surgery. Wound healing appropriately.",
    vitals: {
      bloodPressure: "118/76",
      heartRate: 68,
      temperature: 98.4,
    },
    diagnosis: ["Z48.89 - Encounter for other specified surgical aftercare"],
    prescriptions: ["Ibuprofen 600mg TID", "Physical therapy referral"],
    followUpRequired: true,
    followUpDate: "2024-02-14",
    insuranceVerified: true,
    copayCollected: true,
    copayAmount: 35,
  },
  {
    id: "EV006",
    patientName: "Lisa Anderson",
    patientId: "P12350",
    visitType: "Follow-up",
    appointmentDate: "2024-01-16",
    appointmentTime: "08:30",
    duration: 20,
    provider: "Dr. Johnson",
    status: "Scheduled",
    visitReason: "Blood Pressure Check",
    notes: "",
    followUpRequired: false,
    insuranceVerified: true,
    copayCollected: false,
    copayAmount: 20,
  },
  {
    id: "EV007",
    patientName: "David Miller",
    patientId: "P12351",
    visitType: "Telehealth",
    appointmentDate: "2024-01-13",
    appointmentTime: "16:00",
    duration: 25,
    provider: "Dr. Thompson",
    status: "Cancelled",
    visitReason: "Mental Health Consultation",
    notes: "Patient cancelled due to scheduling conflict. Rescheduled for next week.",
    followUpRequired: false,
    insuranceVerified: false,
    copayCollected: false,
  },
]

export default function EVTracker({ user }: EVTrackerProps) {
  const [evVisits, setEVVisits] = useState<EVVisit[]>(mockEVVisits)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [providerFilter, setProviderFilter] = useState<string>("all")
  const [visitTypeFilter, setVisitTypeFilter] = useState<string>("all")
  const [selectedVisit, setSelectedVisit] = useState<EVVisit | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [newNote, setNewNote] = useState("")

  // Filter EV visits
  const filteredVisits = evVisits.filter((visit) => {
    // Search filter
    if (
      searchTerm &&
      !visit.patientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !visit.patientId.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !visit.provider.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !visit.visitReason.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    // Status filter
    if (statusFilter !== "all" && visit.status !== statusFilter) {
      return false
    }

    // Provider filter
    if (providerFilter !== "all" && visit.provider !== providerFilter) {
      return false
    }

    // Visit type filter
    if (visitTypeFilter !== "all" && visit.visitType !== visitTypeFilter) {
      return false
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      const visitDate = new Date(visit.appointmentDate)
      if (dateRange.from && visitDate < dateRange.from) return false
      if (dateRange.to && visitDate > dateRange.to) return false
    }

    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "Missed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "Pending Verification":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "Cancelled":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Missed":
        return "bg-red-100 text-red-800 border-red-200"
      case "Pending Verification":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-purple-100 text-purple-800 border-purple-200"
    }
  }

  const getVisitTypeIcon = (visitType: string) => {
    switch (visitType) {
      case "Telehealth":
        return <Video className="h-4 w-4" />
      case "Phone Consultation":
        return <Phone className="h-4 w-4" />
      case "In-Person":
        return <MapPin className="h-4 w-4" />
      default:
        return <Heart className="h-4 w-4" />
    }
  }

  const getVisitSummary = () => {
    const total = filteredVisits.length
    const completed = filteredVisits.filter((v) => v.status === "Completed").length
    const scheduled = filteredVisits.filter((v) => v.status === "Scheduled").length
    const inProgress = filteredVisits.filter((v) => v.status === "In Progress").length
    const missed = filteredVisits.filter((v) => v.status === "Missed").length
    const pendingVerification = filteredVisits.filter((v) => v.status === "Pending Verification").length

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const missedRate = total > 0 ? Math.round((missed / total) * 100) : 0

    return { total, completed, scheduled, inProgress, missed, pendingVerification, completionRate, missedRate }
  }

  const summary = getVisitSummary()
  const uniqueProviders = Array.from(new Set(evVisits.map((v) => v.provider)))

  const updateVisitStatus = (visitId: string, newStatus: EVVisit["status"]) => {
    setEVVisits((visits) => visits.map((visit) => (visit.id === visitId ? { ...visit, status: newStatus } : visit)))
  }

  const handleVisitClick = (visit: EVVisit) => {
    setSelectedVisit(visit)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{summary.completed}</p>
                <p className="text-xs text-muted-foreground">{summary.completionRate}% completion rate</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{summary.scheduled + summary.inProgress}</p>
                <p className="text-xs text-muted-foreground">Upcoming & active</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Missed</p>
                <p className="text-2xl font-bold text-red-600">{summary.missed}</p>
                <p className="text-xs text-muted-foreground">{summary.missedRate}% missed rate</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Visit Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Missed">Missed</SelectItem>
                <SelectItem value="Pending Verification">Pending Verification</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value="providerFilter" onValueChange={setProviderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {uniqueProviders.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={visitTypeFilter} onValueChange={setVisitTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Visit Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visit Types</SelectItem>
                <SelectItem value="Telehealth">Telehealth</SelectItem>
                <SelectItem value="In-Person">In-Person</SelectItem>
                <SelectItem value="Phone Consultation">Phone Consultation</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
              </SelectContent>
            </Select>

            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Date Range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="default">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* EV Visits List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Electronic Visits ({filteredVisits.length})</span>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Visit
            </Button>
          </CardTitle>
          <CardDescription>Track and manage all electronic visits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredVisits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No visits found matching your criteria</p>
              </div>
            ) : (
              filteredVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => handleVisitClick(visit)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-foreground">{visit.visitReason}</h3>
                        <Badge className={`text-xs ${getStatusColor(visit.status)}`}>
                          {getStatusIcon(visit.status)}
                          <span className="ml-1">{visit.status}</span>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getVisitTypeIcon(visit.visitType)}
                          <span className="ml-1">{visit.visitType}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Patient</p>
                          <p className="font-medium">
                            {visit.patientName} ({visit.patientId})
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Provider</p>
                          <p className="font-medium">{visit.provider}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date & Time</p>
                          <p className="font-medium">
                            {new Date(visit.appointmentDate).toLocaleDateString()} at {visit.appointmentTime}
                          </p>
                          <p className="text-xs text-muted-foreground">{visit.duration} minutes</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Insurance & Payment</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant={visit.insuranceVerified ? "default" : "destructive"} className="text-xs">
                              {visit.insuranceVerified ? "Verified" : "Not Verified"}
                            </Badge>
                            {visit.copayAmount && (
                              <Badge variant={visit.copayCollected ? "default" : "secondary"} className="text-xs">
                                ${visit.copayAmount} {visit.copayCollected ? "Collected" : "Due"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {visit.followUpRequired && (
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm text-blue-800">
                            <strong>Follow-up Required:</strong>{" "}
                            {visit.followUpDate ? new Date(visit.followUpDate).toLocaleDateString() : "TBD"}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      {visit.status === "Scheduled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateVisitStatus(visit.id, "In Progress")
                          }}
                        >
                          Start Visit
                        </Button>
                      )}
                      {visit.status === "In Progress" && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateVisitStatus(visit.id, "Completed")
                          }}
                        >
                          Complete
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visit Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedVisit && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {getVisitTypeIcon(selectedVisit.visitType)}
                  <span>Visit Details - {selectedVisit.id}</span>
                </DialogTitle>
                <DialogDescription>
                  {selectedVisit.visitReason} - {selectedVisit.patientName}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="clinical">Clinical</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Visit Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Status</Label>
                          <div className="mt-1">
                            <Badge className={`${getStatusColor(selectedVisit.status)}`}>
                              {getStatusIcon(selectedVisit.status)}
                              <span className="ml-1">{selectedVisit.status}</span>
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Visit Type</Label>
                          <div className="mt-1 flex items-center space-x-2">
                            {getVisitTypeIcon(selectedVisit.visitType)}
                            <span className="text-sm">{selectedVisit.visitType}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Date & Time</Label>
                          <p className="text-sm">
                            {new Date(selectedVisit.appointmentDate).toLocaleDateString()} at{" "}
                            {selectedVisit.appointmentTime}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Duration</Label>
                          <p className="text-sm">{selectedVisit.duration} minutes</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Patient & Provider</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Patient</Label>
                          <p className="text-sm">
                            {selectedVisit.patientName} ({selectedVisit.patientId})
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Provider</Label>
                          <p className="text-sm">{selectedVisit.provider}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Visit Reason</Label>
                          <p className="text-sm">{selectedVisit.visitReason}</p>
                        </div>
                        {selectedVisit.followUpRequired && (
                          <div>
                            <Label className="text-sm font-medium">Follow-up</Label>
                            <p className="text-sm text-blue-600">
                              Required{" "}
                              {selectedVisit.followUpDate
                                ? `on ${new Date(selectedVisit.followUpDate).toLocaleDateString()}`
                                : "(Date TBD)"}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="clinical" className="space-y-6">
                  {selectedVisit.vitals && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Stethoscope className="h-5 w-5" />
                          <span>Vital Signs</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedVisit.vitals.bloodPressure && (
                            <div>
                              <Label className="text-sm font-medium">Blood Pressure</Label>
                              <p className="text-sm">{selectedVisit.vitals.bloodPressure} mmHg</p>
                            </div>
                          )}
                          {selectedVisit.vitals.heartRate && (
                            <div>
                              <Label className="text-sm font-medium">Heart Rate</Label>
                              <p className="text-sm">{selectedVisit.vitals.heartRate} bpm</p>
                            </div>
                          )}
                          {selectedVisit.vitals.temperature && (
                            <div>
                              <Label className="text-sm font-medium">Temperature</Label>
                              <p className="text-sm">{selectedVisit.vitals.temperature}°F</p>
                            </div>
                          )}
                          {selectedVisit.vitals.weight && (
                            <div>
                              <Label className="text-sm font-medium">Weight</Label>
                              <p className="text-sm">{selectedVisit.vitals.weight} lbs</p>
                            </div>
                          )}
                          {selectedVisit.vitals.height && (
                            <div>
                              <Label className="text-sm font-medium">Height</Label>
                              <p className="text-sm">{selectedVisit.vitals.height} inches</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedVisit.diagnosis && selectedVisit.diagnosis.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Diagnosis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedVisit.diagnosis.map((dx, index) => (
                            <div key={index} className="p-2 bg-muted/30 rounded-md">
                              <p className="text-sm">{dx}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedVisit.prescriptions && selectedVisit.prescriptions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Prescriptions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedVisit.prescriptions.map((rx, index) => (
                            <div key={index} className="p-2 bg-muted/30 rounded-md">
                              <p className="text-sm">{rx}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="billing" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Insurance & Payment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Insurance Status</Label>
                          <div className="mt-1">
                            <Badge variant={selectedVisit.insuranceVerified ? "default" : "destructive"}>
                              {selectedVisit.insuranceVerified ? "Verified" : "Not Verified"}
                            </Badge>
                          </div>
                        </div>
                        {selectedVisit.copayAmount && (
                          <div>
                            <Label className="text-sm font-medium">Copay</Label>
                            <div className="mt-1 flex items-center space-x-2">
                              <span className="text-sm font-semibold">${selectedVisit.copayAmount}</span>
                              <Badge variant={selectedVisit.copayCollected ? "default" : "secondary"}>
                                {selectedVisit.copayCollected ? "Collected" : "Due"}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Visit Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedVisit.notes ? (
                        <p className="text-sm">{selectedVisit.notes}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No notes recorded for this visit</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Add Note</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        placeholder="Enter additional notes..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={4}
                      />
                      <Button disabled={!newNote.trim()} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
