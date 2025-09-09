"use client"

import type React from "react"

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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Download,
  FileText,
  CalendarIcon,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Eye,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"
import type { User as UserType } from "@/app/page"

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: "Dashboard" | "PA Tracking" | "EV Tracking" | "Queue Management" | "Financial" | "Operational"
  icon: React.ReactNode
  columns: string[]
  defaultColumns: string[]
  filters: ReportFilter[]
}

interface ReportFilter {
  id: string
  name: string
  type: "select" | "date" | "dateRange" | "text" | "number"
  options?: string[]
  required?: boolean
}

interface GeneratedReport {
  id: string
  name: string
  template: string
  generatedDate: string
  generatedBy: string
  status: "Generating" | "Ready" | "Failed"
  format: "Excel" | "PDF"
  size?: string
  downloadUrl?: string
}

interface ReportsProps {
  user: UserType
}

// Mock report templates
const reportTemplates: ReportTemplate[] = [
  {
    id: "dashboard-summary",
    name: "Dashboard Summary Report",
    description: "Comprehensive overview of all key metrics and KPIs",
    category: "Dashboard",
    icon: <BarChart3 className="h-5 w-5" />,
    columns: [
      "Date",
      "Total Queue Items",
      "Completed Tasks",
      "PA Requests",
      "PA Approval Rate",
      "EV Visits",
      "EV Completion Rate",
      "Revenue",
    ],
    defaultColumns: ["Date", "Total Queue Items", "PA Requests", "EV Visits"],
    filters: [
      { id: "dateRange", name: "Date Range", type: "dateRange", required: true },
      { id: "clinic", name: "Clinic", type: "select", options: ["All Clinics", "Downtown Medical", "Uptown Clinic"] },
    ],
  },
  {
    id: "pa-detailed",
    name: "Prior Authorization Detailed Report",
    description: "Detailed breakdown of all PA requests with outcomes and timelines",
    category: "PA Tracking",
    icon: <FileText className="h-5 w-5" />,
    columns: [
      "PA ID",
      "Patient Name",
      "Patient ID",
      "Account Number",
      "Procedure",
      "Payer",
      "Status",
      "Submission Date",
      "Response Date",
      "Denial Reason",
      "Provider",
      "Estimated Cost",
    ],
    defaultColumns: ["PA ID", "Patient Name", "Procedure", "Payer", "Status", "Submission Date", "Estimated Cost"],
    filters: [
      { id: "dateRange", name: "Date Range", type: "dateRange", required: true },
      {
        id: "status",
        name: "Status",
        type: "select",
        options: ["All", "Submitted", "Pending", "Approved", "Denied", "Under Review"],
      },
      {
        id: "payer",
        name: "Payer",
        type: "select",
        options: ["All", "Blue Cross Blue Shield", "Aetna", "United Healthcare", "Cigna", "Medicare", "Humana"],
      },
    ],
  },
  {
    id: "ev-summary",
    name: "Electronic Visits Summary",
    description: "Summary of all electronic visits with completion rates and outcomes",
    category: "EV Tracking",
    icon: <Users className="h-5 w-5" />,
    columns: [
      "Visit ID",
      "Patient Name",
      "Patient ID",
      "Visit Type",
      "Date",
      "Time",
      "Provider",
      "Status",
      "Duration",
      "Visit Reason",
      "Copay Amount",
      "Insurance Verified",
    ],
    defaultColumns: ["Visit ID", "Patient Name", "Visit Type", "Date", "Provider", "Status"],
    filters: [
      { id: "dateRange", name: "Date Range", type: "dateRange", required: true },
      {
        id: "status",
        name: "Status",
        type: "select",
        options: ["All", "Scheduled", "Completed", "Missed", "Pending Verification", "Cancelled"],
      },
      {
        id: "visitType",
        name: "Visit Type",
        type: "select",
        options: ["All", "Telehealth", "In-Person", "Phone Consultation", "Follow-up"],
      },
    ],
  },
  {
    id: "queue-performance",
    name: "Queue Performance Report",
    description: "Analysis of task queue performance and completion metrics",
    category: "Queue Management",
    icon: <Clock className="h-5 w-5" />,
    columns: [
      "Task ID",
      "Task Type",
      "Patient Name",
      "Patient ID",
      "Priority",
      "Status",
      "Assigned To",
      "Created Date",
      "Due Date",
      "Completion Date",
      "Time to Complete",
    ],
    defaultColumns: ["Task ID", "Task Type", "Priority", "Status", "Assigned To", "Due Date"],
    filters: [
      { id: "dateRange", name: "Date Range", type: "dateRange", required: true },
      {
        id: "status",
        name: "Status",
        type: "select",
        options: ["All", "Pending", "In Progress", "Completed", "On Hold"],
      },
      {
        id: "priority",
        name: "Priority",
        type: "select",
        options: ["All", "High", "Medium", "Low"],
      },
    ],
  },
  {
    id: "financial-summary",
    name: "Financial Summary Report",
    description: "Revenue analysis and financial performance metrics",
    category: "Financial",
    icon: <TrendingUp className="h-5 w-5" />,
    columns: [
      "Date",
      "Total Revenue",
      "Copays Collected",
      "Outstanding Copays",
      "Insurance Payments",
      "PA Approvals Value",
      "Visit Count",
      "Average Visit Value",
    ],
    defaultColumns: ["Date", "Total Revenue", "Copays Collected", "Visit Count"],
    filters: [
      { id: "dateRange", name: "Date Range", type: "dateRange", required: true },
      {
        id: "paymentType",
        name: "Payment Type",
        type: "select",
        options: ["All", "Copays", "Insurance", "Self-Pay"],
      },
    ],
  },
]

// Mock generated reports
const mockGeneratedReports: GeneratedReport[] = [
  {
    id: "RPT001",
    name: "Dashboard Summary - January 2024",
    template: "dashboard-summary",
    generatedDate: "2024-01-15T10:30:00Z",
    generatedBy: "admin@clinic1.com",
    status: "Ready",
    format: "Excel",
    size: "2.3 MB",
    downloadUrl: "#",
  },
  {
    id: "RPT002",
    name: "PA Detailed Report - Q4 2023",
    template: "pa-detailed",
    generatedDate: "2024-01-14T15:45:00Z",
    generatedBy: "staff@clinic1.com",
    status: "Ready",
    format: "PDF",
    size: "1.8 MB",
    downloadUrl: "#",
  },
  {
    id: "RPT003",
    name: "EV Summary - December 2023",
    template: "ev-summary",
    generatedDate: "2024-01-13T09:15:00Z",
    generatedBy: "admin@clinic1.com",
    status: "Generating",
    format: "Excel",
  },
]

export default function Reports({ user }: ReportsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>(mockGeneratedReports)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [reportFilters, setReportFilters] = useState<Record<string, any>>({})
  const [reportFormat, setReportFormat] = useState<"Excel" | "PDF">("Excel")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const filteredTemplates = reportTemplates.filter((template) => {
    if (categoryFilter === "all") return true
    return template.category === categoryFilter
  })

  const handleGenerateReport = () => {
    if (!selectedTemplate) return

    const newReport: GeneratedReport = {
      id: `RPT${String(generatedReports.length + 1).padStart(3, "0")}`,
      name: `${selectedTemplate.name} - ${format(new Date(), "MMM yyyy")}`,
      template: selectedTemplate.id,
      generatedDate: new Date().toISOString(),
      generatedBy: user.username,
      status: "Generating",
      format: reportFormat,
    }

    setGeneratedReports([newReport, ...generatedReports])
    setIsGenerateDialogOpen(false)

    // Simulate report generation
    setTimeout(() => {
      setGeneratedReports((reports) =>
        reports.map((report) =>
          report.id === newReport.id
            ? {
                ...report,
                status: "Ready" as const,
                size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
                downloadUrl: "#",
              }
            : report,
        ),
      )
    }, 3000)
  }

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    setSelectedColumns(template.defaultColumns)
    setReportFilters({})
    setIsGenerateDialogOpen(true)
  }

  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prev) => (prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Generating":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "Failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready":
        return "bg-green-100 text-green-800 border-green-200"
      case "Generating":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Dashboard":
        return <BarChart3 className="h-4 w-4" />
      case "PA Tracking":
        return <FileText className="h-4 w-4" />
      case "EV Tracking":
        return <Users className="h-4 w-4" />
      case "Queue Management":
        return <Clock className="h-4 w-4" />
      case "Financial":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and download comprehensive reports</p>
        </div>
        <Button>
          <Mail className="h-4 w-4 mr-2" />
          Schedule Reports
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Templates</p>
                <p className="text-2xl font-bold">{reportTemplates.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Generated This Month</p>
                <p className="text-2xl font-bold">{generatedReports.length}</p>
              </div>
              <Download className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ready for Download</p>
                <p className="text-2xl font-bold text-green-600">
                  {generatedReports.filter((r) => r.status === "Ready").length}
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
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-blue-600">
                  {generatedReports.filter((r) => r.status === "Generating").length}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="generated">Generated Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Category Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filter Templates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Dashboard">Dashboard</SelectItem>
                  <SelectItem value="PA Tracking">PA Tracking</SelectItem>
                  <SelectItem value="EV Tracking">EV Tracking</SelectItem>
                  <SelectItem value="Queue Management">Queue Management</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Operational">Operational</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Report Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {template.icon}
                    <span className="text-lg">{template.name}</span>
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(template.category)}
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{template.columns.length} available columns</p>
                    <div className="flex flex-wrap gap-1">
                      {template.defaultColumns.slice(0, 3).map((column) => (
                        <Badge key={column} variant="secondary" className="text-xs">
                          {column}
                        </Badge>
                      ))}
                      {template.defaultColumns.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.defaultColumns.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => handleTemplateSelect(template)}>
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="generated" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>View and download your generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generatedReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No reports generated yet</p>
                  </div>
                ) : (
                  generatedReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-foreground">{report.name}</h3>
                          <Badge className={`text-xs ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1">{report.status}</span>
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {report.format}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Generated: {new Date(report.generatedDate).toLocaleDateString()}</span>
                          <span>By: {report.generatedBy}</span>
                          {report.size && <span>Size: {report.size}</span>}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {report.status === "Ready" && (
                          <>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            <Button size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </>
                        )}
                        {report.status === "Generating" && (
                          <Button variant="outline" size="sm" disabled>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Report Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {selectedTemplate.icon}
                  <span>Generate {selectedTemplate.name}</span>
                </DialogTitle>
                <DialogDescription>{selectedTemplate.description}</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="columns" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="columns">Columns</TabsTrigger>
                  <TabsTrigger value="filters">Filters</TabsTrigger>
                  <TabsTrigger value="format">Format & Options</TabsTrigger>
                </TabsList>

                <TabsContent value="columns" className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Select Columns to Include</Label>
                    <p className="text-sm text-muted-foreground mb-4">Choose which columns to include in your report</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedTemplate.columns.map((column) => (
                        <div key={column} className="flex items-center space-x-2">
                          <Checkbox
                            id={column}
                            checked={selectedColumns.includes(column)}
                            onCheckedChange={() => handleColumnToggle(column)}
                          />
                          <Label htmlFor={column} className="text-sm">
                            {column}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="filters" className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Report Filters</Label>
                    <p className="text-sm text-muted-foreground mb-4">Configure filters for your report data</p>
                    <div className="space-y-4">
                      {selectedTemplate.filters.map((filter) => (
                        <div key={filter.id}>
                          <Label className="text-sm font-medium">
                            {filter.name} {filter.required && <span className="text-red-500">*</span>}
                          </Label>
                          {filter.type === "dateRange" && (
                            <div className="mt-2">
                              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="justify-start text-left font-normal bg-transparent"
                                  >
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
                                      "Select date range"
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
                          )}
                          {filter.type === "select" && filter.options && (
                            <Select
                              value={reportFilters[filter.id] || ""}
                              onValueChange={(value) => setReportFilters((prev) => ({ ...prev, [filter.id]: value }))}
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder={`Select ${filter.name.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {filter.options.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {filter.type === "text" && (
                            <Input
                              className="mt-2"
                              placeholder={`Enter ${filter.name.toLowerCase()}`}
                              value={reportFilters[filter.id] || ""}
                              onChange={(e) => setReportFilters((prev) => ({ ...prev, [filter.id]: e.target.value }))}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="format" className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Export Format</Label>
                    <p className="text-sm text-muted-foreground mb-4">Choose your preferred export format</p>
                    <Select value={reportFormat} onValueChange={(value: "Excel" | "PDF") => setReportFormat(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excel">Excel (.xlsx)</SelectItem>
                        <SelectItem value="PDF">PDF (.pdf)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Report Summary</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Template: {selectedTemplate.name}</p>
                      <p>Columns: {selectedColumns.length} selected</p>
                      <p>Format: {reportFormat}</p>
                      <p>
                        Date Range:{" "}
                        {dateRange.from && dateRange.to
                          ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                          : "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleGenerateReport} disabled={selectedColumns.length === 0}>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
