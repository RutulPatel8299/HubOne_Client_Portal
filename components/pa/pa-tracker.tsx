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
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  FileText,
  CalendarIcon,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { format } from "date-fns"
import type { User as UserType } from "@/app/page"

interface PARequest {
  id: string
  patientName: string
  patientId: string
  accountNumber: string
  requestType: string
  procedure: string
  payer: string
  status: "Submitted" | "Pending" | "Approved" | "Denied" | "Under Review"
  submissionDate: string
  responseDate?: string
  denialReason?: string
  requestedBy: string
  urgency: "Routine" | "Urgent" | "STAT"
  estimatedCost: number
  notes: string
}

interface PATrackerProps {
  user: UserType
}

// Mock PA data
const mockPARequests: PARequest[] = [
  {
    id: "PA001",
    patientName: "John Smith",
    patientId: "P12345",
    accountNumber: "ACC001234",
    requestType: "Diagnostic Imaging",
    procedure: "MRI - Lower Back",
    payer: "Blue Cross Blue Shield",
    status: "Approved",
    submissionDate: "2024-01-08",
    responseDate: "2024-01-10",
    requestedBy: "Dr. Johnson",
    urgency: "Routine",
    estimatedCost: 2500,
    notes: "Patient experiencing chronic lower back pain for 6 months",
  },
  {
    id: "PA002",
    patientName: "Sarah Johnson",
    patientId: "P12346",
    accountNumber: "ACC001235",
    requestType: "Specialist Referral",
    procedure: "Cardiology Consultation",
    payer: "Aetna",
    status: "Denied",
    submissionDate: "2024-01-09",
    responseDate: "2024-01-12",
    denialReason:
      "Insufficient medical necessity documentation. Please provide additional clinical notes and test results.",
    requestedBy: "Dr. Smith",
    urgency: "Urgent",
    estimatedCost: 450,
    notes: "Patient has family history of heart disease, experiencing chest pain",
  },
  {
    id: "PA003",
    patientName: "Mike Davis",
    patientId: "P12347",
    accountNumber: "ACC001236",
    requestType: "Surgical Procedure",
    procedure: "Arthroscopic Knee Surgery",
    payer: "United Healthcare",
    status: "Pending",
    submissionDate: "2024-01-11",
    requestedBy: "Dr. Wilson",
    urgency: "Routine",
    estimatedCost: 8500,
    notes: "Failed conservative treatment, MRI shows meniscal tear",
  },
  {
    id: "PA004",
    patientName: "Emily Wilson",
    patientId: "P12348",
    accountNumber: "ACC001237",
    requestType: "Medication",
    procedure: "Specialty Medication - Humira",
    payer: "Cigna",
    status: "Under Review",
    submissionDate: "2024-01-12",
    requestedBy: "Dr. Brown",
    urgency: "Urgent",
    estimatedCost: 5200,
    notes: "Patient has rheumatoid arthritis, failed methotrexate therapy",
  },
  {
    id: "PA005",
    patientName: "Robert Brown",
    patientId: "P12349",
    accountNumber: "ACC001238",
    requestType: "Diagnostic Testing",
    procedure: "CT Scan - Chest",
    payer: "Medicare",
    status: "Approved",
    submissionDate: "2024-01-10",
    responseDate: "2024-01-11",
    requestedBy: "Dr. Davis",
    urgency: "STAT",
    estimatedCost: 1200,
    notes: "Suspected pulmonary embolism, patient in ER",
  },
  {
    id: "PA006",
    patientName: "Lisa Anderson",
    patientId: "P12350",
    accountNumber: "ACC001239",
    requestType: "Physical Therapy",
    procedure: "PT - Post-surgical rehabilitation",
    payer: "Humana",
    status: "Submitted",
    submissionDate: "2024-01-13",
    requestedBy: "Dr. Johnson",
    urgency: "Routine",
    estimatedCost: 1800,
    notes: "Post-operative care following shoulder surgery",
  },
  {
    id: "PA007",
    patientName: "David Miller",
    patientId: "P12351",
    accountNumber: "ACC001240",
    requestType: "Diagnostic Imaging",
    procedure: "PET Scan - Oncology",
    payer: "Blue Cross Blue Shield",
    status: "Denied",
    submissionDate: "2024-01-07",
    responseDate: "2024-01-09",
    denialReason: "Alternative imaging modalities not attempted. Please try CT scan first and provide results.",
    requestedBy: "Dr. Thompson",
    urgency: "Urgent",
    estimatedCost: 4500,
    notes: "Cancer staging evaluation, patient diagnosed with lung cancer",
  },
]

export default function PATracker({ user }: PATrackerProps) {
  const [paRequests, setPARequests] = useState<PARequest[]>(mockPARequests)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [payerFilter, setPayerFilter] = useState<string>("all")
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")
  const [selectedPA, setSelectedPA] = useState<PARequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Filter PA requests
  const filteredRequests = paRequests.filter((request) => {
    // Search filter
    if (
      searchTerm &&
      !request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !request.patientId.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !request.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !request.procedure.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    // Status filter
    if (statusFilter !== "all" && request.status !== statusFilter) {
      return false
    }

    // Payer filter
    if (payerFilter !== "all" && request.payer !== payerFilter) {
      return false
    }

    // Urgency filter
    if (urgencyFilter !== "all" && request.urgency !== urgencyFilter) {
      return false
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      const submissionDate = new Date(request.submissionDate)
      if (dateRange.from && submissionDate < dateRange.from) return false
      if (dateRange.to && submissionDate > dateRange.to) return false
    }

    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Denied":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "Under Review":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "Pending":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "Denied":
        return "bg-red-100 text-red-800 border-red-200"
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Pending":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "STAT":
        return "bg-red-100 text-red-800 border-red-200"
      case "Urgent":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSubmissionSummary = () => {
    const total = filteredRequests.length
    const approved = filteredRequests.filter((r) => r.status === "Approved").length
    const denied = filteredRequests.filter((r) => r.status === "Denied").length
    const pending = filteredRequests.filter((r) => r.status === "Pending" || r.status === "Under Review").length
    const submitted = filteredRequests.filter((r) => r.status === "Submitted").length

    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0
    const denialRate = total > 0 ? Math.round((denied / total) * 100) : 0

    return { total, approved, denied, pending, submitted, approvalRate, denialRate }
  }

  const summary = getSubmissionSummary()

  const uniquePayers = Array.from(new Set(paRequests.map((r) => r.payer)))

  const handlePAClick = (pa: PARequest) => {
    setSelectedPA(pa)
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
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{summary.approved}</p>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {summary.approvalRate}% rate
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Denied</p>
                <p className="text-2xl font-bold text-red-600">{summary.denied}</p>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {summary.denialRate}% rate
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-blue-600">{summary.pending + summary.submitted}</p>
                <p className="text-xs text-muted-foreground">Awaiting response</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>PA Request Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, ID, account..."
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
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Denied">Denied</SelectItem>
              </SelectContent>
            </Select>

            <Select value={payerFilter} onValueChange={setPayerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Payers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payers</SelectItem>
                {uniquePayers.map((payer) => (
                  <SelectItem key={payer} value={payer}>
                    {payer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="Routine">Routine</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="STAT">STAT</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* PA Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Prior Authorization Requests ({filteredRequests.length})</span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
          <CardDescription>Track and manage all prior authorization requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No PA requests found matching your criteria</p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => handlePAClick(request)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-foreground">{request.procedure}</h3>
                        <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status}</span>
                        </Badge>
                        {request.urgency !== "Routine" && (
                          <Badge className={`text-xs ${getUrgencyColor(request.urgency)}`}>{request.urgency}</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Patient</p>
                          <p className="font-medium">
                            {request.patientName} ({request.patientId})
                          </p>
                          <p className="text-xs text-muted-foreground">Acc: {request.accountNumber}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Payer</p>
                          <p className="font-medium">{request.payer}</p>
                          <p className="text-xs text-muted-foreground">Requested by: {request.requestedBy}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Submission Date</p>
                          <p className="font-medium">{new Date(request.submissionDate).toLocaleDateString()}</p>
                          {request.responseDate && (
                            <p className="text-xs text-muted-foreground">
                              Response: {new Date(request.responseDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground">Estimated Cost</p>
                          <p className="font-medium">${request.estimatedCost.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{request.requestType}</p>
                        </div>
                      </div>

                      {request.denialReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800">
                            <strong>Denial Reason:</strong> {request.denialReason}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button variant="ghost" size="sm" className="ml-4">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* PA Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedPA && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>PA Request Details - {selectedPA.id}</span>
                </DialogTitle>
                <DialogDescription>
                  {selectedPA.procedure} for {selectedPA.patientName}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="clinical">Clinical Info</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Patient Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Patient Name</Label>
                          <p className="text-sm">{selectedPA.patientName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Patient ID</Label>
                          <p className="text-sm">{selectedPA.patientId}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Account Number</Label>
                          <p className="text-sm">{selectedPA.accountNumber}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Request Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Status</Label>
                          <div className="mt-1">
                            <Badge className={`${getStatusColor(selectedPA.status)}`}>
                              {getStatusIcon(selectedPA.status)}
                              <span className="ml-1">{selectedPA.status}</span>
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Urgency</Label>
                          <div className="mt-1">
                            <Badge className={`${getUrgencyColor(selectedPA.urgency)}`}>{selectedPA.urgency}</Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Estimated Cost</Label>
                          <p className="text-sm font-semibold">${selectedPA.estimatedCost.toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Authorization Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Request Type</Label>
                          <p className="text-sm">{selectedPA.requestType}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Procedure</Label>
                          <p className="text-sm">{selectedPA.procedure}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Payer</Label>
                          <p className="text-sm">{selectedPA.payer}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Requested By</Label>
                          <p className="text-sm">{selectedPA.requestedBy}</p>
                        </div>
                      </div>

                      {selectedPA.denialReason && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <Label className="text-sm font-medium text-red-800">Denial Reason</Label>
                          <p className="text-sm text-red-700 mt-1">{selectedPA.denialReason}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="clinical" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Clinical Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedPA.notes}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Supporting Documentation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">Clinical Notes.pdf</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">Lab Results.pdf</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Request Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium">Request Submitted</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(selectedPA.submissionDate).toLocaleDateString()} - Initial PA request submitted
                              to {selectedPA.payer}
                            </p>
                          </div>
                        </div>

                        {selectedPA.status === "Under Review" && (
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                            <div>
                              <p className="text-sm font-medium">Under Review</p>
                              <p className="text-xs text-muted-foreground">
                                Request is currently being reviewed by the payer
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedPA.responseDate && (
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${
                                selectedPA.status === "Approved" ? "bg-green-500" : "bg-red-500"
                              }`}
                            ></div>
                            <div>
                              <p className="text-sm font-medium">Response Received</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(selectedPA.responseDate).toLocaleDateString()} - Request{" "}
                                {selectedPA.status.toLowerCase()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
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
