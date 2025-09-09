"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
  Filter,
  Search,
  RefreshCw,
  Plus,
  FileText,
  Phone,
  CreditCard,
  UserCheck,
} from "lucide-react"
import type { User as UserType } from "@/app/page"

interface QueueItem {
  id: string
  taskType:
    | "Insurance Verification"
    | "Prior Authorization"
    | "Claims Processing"
    | "Patient Follow-up"
    | "Eligibility Check"
    | "Payment Processing"
  patientName: string
  patientId: string
  priority: "High" | "Medium" | "Low"
  status: "Pending" | "In Progress" | "Completed" | "On Hold"
  assignedTo: string
  dueDate: string
  createdDate: string
  description: string
  notes: string[]
  estimatedTime: number // in minutes
  provider: string
  portfolio: string
  program: string
  queue: string
  disposition: string
  insurance: string
  insuranceType: string
}

interface QueueManagementProps {
  user: UserType
}

// Mock queue data
const mockQueueItems: QueueItem[] = [
  {
    id: "Q001",
    taskType: "Insurance Verification",
    patientName: "John Smith",
    patientId: "P12345",
    priority: "High",
    status: "Pending",
    assignedTo: "staff@clinic1.com",
    dueDate: "2024-01-15",
    createdDate: "2024-01-10",
    description: "Verify insurance coverage for upcoming procedure",
    notes: ["Patient called to confirm insurance details", "Waiting for insurance company response"],
    estimatedTime: 30,
    provider: "Dr. Johnson",
    portfolio: "ChiroHD",
    program: "Authorization",
    queue: "Audit Required",
    disposition: "Pending response from Insurance",
    insurance: "Blue Cross Blue Shield",
    insuranceType: "Primary",
  },
  {
    id: "Q002",
    taskType: "Prior Authorization",
    patientName: "Sarah Johnson",
    patientId: "P12346",
    priority: "High",
    status: "In Progress",
    assignedTo: "staff@clinic1.com",
    dueDate: "2024-01-14",
    createdDate: "2024-01-08",
    description: "Submit PA for MRI scan - lower back pain",
    notes: ["Initial submission completed", "Awaiting additional documentation from physician"],
    estimatedTime: 45,
    provider: "Dr. Smith",
    portfolio: "ChiroOne",
    program: "Verification",
    queue: "Authorization",
    disposition: "EV Received",
    insurance: "Aetna",
    insuranceType: "Primary",
  },
  {
    id: "Q003",
    taskType: "Claims Processing",
    patientName: "Mike Davis",
    patientId: "P12347",
    priority: "Medium",
    status: "Pending",
    assignedTo: "admin@clinic1.com",
    dueDate: "2024-01-16",
    createdDate: "2024-01-11",
    description: "Process claim for office visit and lab work",
    notes: [],
    estimatedTime: 20,
    provider: "Dr. Wilson",
    portfolio: "ChiroHD",
    program: "Personal Injury",
    queue: "Audit Required",
    disposition: "Pending response from Insurance",
    insurance: "United Healthcare",
    insuranceType: "Secondary",
  },
  {
    id: "Q004",
    taskType: "Patient Follow-up",
    patientName: "Emily Wilson",
    patientId: "P12348",
    priority: "Low",
    status: "Completed",
    assignedTo: "staff@clinic1.com",
    dueDate: "2024-01-12",
    createdDate: "2024-01-09",
    description: "Follow up on test results and schedule next appointment",
    notes: ["Patient contacted successfully", "Next appointment scheduled for 2024-01-20"],
    estimatedTime: 15,
    provider: "Dr. Brown",
    portfolio: "ChiroOne",
    program: "Billing Programs",
    queue: "Authorization",
    disposition: "EV Received",
    insurance: "Cigna",
    insuranceType: "Primary",
  },
  {
    id: "Q005",
    taskType: "Eligibility Check",
    patientName: "Robert Brown",
    patientId: "P12349",
    priority: "Medium",
    status: "On Hold",
    assignedTo: "staff@clinic1.com",
    dueDate: "2024-01-17",
    createdDate: "2024-01-12",
    description: "Check eligibility for new patient registration",
    notes: ["Waiting for patient to provide additional documentation"],
    estimatedTime: 25,
    provider: "Dr. Davis",
    portfolio: "ChiroHD",
    program: "Authorization",
    queue: "Audit Required",
    disposition: "Pending response from Insurance",
    insurance: "Humana",
    insuranceType: "Primary",
  },
  {
    id: "Q006",
    taskType: "Payment Processing",
    patientName: "Lisa Anderson",
    patientId: "P12350",
    priority: "High",
    status: "Pending",
    assignedTo: "admin@clinic1.com",
    dueDate: "2024-01-15",
    createdDate: "2024-01-13",
    description: "Process payment for outstanding balance",
    notes: ["Patient payment plan needs to be set up"],
    estimatedTime: 35,
    provider: "Dr. Johnson",
    portfolio: "ChiroOne",
    program: "Billing Programs",
    queue: "Authorization",
    disposition: "EV Received",
    insurance: "Medicare",
    insuranceType: "Primary",
  },
]

export default function QueueManagement({ user }: QueueManagementProps) {
  const [queueItems, setQueueItems] = useState<QueueItem[]>(mockQueueItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [providerFilter, setProviderFilter] = useState<string>("all")
  const [portfolioFilter, setPortfolioFilter] = useState<string>("all")
  const [programFilter, setProgramFilter] = useState<string>("all")
  const [queueFilter, setQueueFilter] = useState<string>("all")
  const [dispositionFilter, setDispositionFilter] = useState<string>("all")
  const [insuranceFilter, setInsuranceFilter] = useState<string>("all")
  const [insuranceTypeFilter, setInsuranceTypeFilter] = useState<string>("all")
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState("")

  const getUniqueValues = (field: keyof QueueItem) => {
    return Array.from(new Set(queueItems.map((item) => item[field] as string))).sort()
  }

  const filteredItems = queueItems.filter((item) => {
    if (user.role === "Staff" && item.assignedTo !== user.username) {
      return false
    }

    if (
      searchTerm &&
      !item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.patientId.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.taskType.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false
    }

    if (priorityFilter !== "all" && item.priority !== priorityFilter) {
      return false
    }

    if (providerFilter !== "all" && item.provider !== providerFilter) {
      return false
    }

    if (portfolioFilter !== "all" && item.portfolio !== portfolioFilter) {
      return false
    }

    if (programFilter !== "all" && item.program !== programFilter) {
      return false
    }

    if (queueFilter !== "all" && item.queue !== queueFilter) {
      return false
    }

    if (dispositionFilter !== "all" && item.disposition !== dispositionFilter) {
      return false
    }

    if (insuranceFilter !== "all" && item.insurance !== insuranceFilter) {
      return false
    }

    if (insuranceTypeFilter !== "all" && item.insuranceType !== insuranceTypeFilter) {
      return false
    }

    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "In Progress":
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      case "On Hold":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case "Insurance Verification":
        return <UserCheck className="h-4 w-4" />
      case "Prior Authorization":
        return <FileText className="h-4 w-4" />
      case "Claims Processing":
        return <CreditCard className="h-4 w-4" />
      case "Patient Follow-up":
        return <Phone className="h-4 w-4" />
      case "Eligibility Check":
        return <User className="h-4 w-4" />
      case "Payment Processing":
        return <CreditCard className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "On Hold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const updateItemStatus = (itemId: string, newStatus: QueueItem["status"]) => {
    setQueueItems((items) => items.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item)))
  }

  const addNote = (itemId: string, note: string) => {
    if (!note.trim()) return

    setQueueItems((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, notes: [...item.notes, `${new Date().toLocaleString()}: ${note}`] } : item,
      ),
    )
    setNewNote("")
  }

  const handleItemClick = (item: QueueItem) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{filteredItems.filter((item) => item.status === "Pending").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold">
                  {filteredItems.filter((item) => item.status === "In Progress").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">
                  {filteredItems.filter((item) => item.status === "Completed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">On Hold</p>
                <p className="text-2xl font-bold">{filteredItems.filter((item) => item.status === "On Hold").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Queue Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, ID, or task type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High Priority</SelectItem>
                  <SelectItem value="Medium">Medium Priority</SelectItem>
                  <SelectItem value="Low">Low Priority</SelectItem>
                </SelectContent>
              </Select>

              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {getUniqueValues("provider").map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={portfolioFilter} onValueChange={setPortfolioFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by portfolio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Portfolios</SelectItem>
                  {getUniqueValues("portfolio").map((portfolio) => (
                    <SelectItem key={portfolio} value={portfolio}>
                      {portfolio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {getUniqueValues("program").map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={queueFilter} onValueChange={setQueueFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by queue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Queues</SelectItem>
                  {getUniqueValues("queue").map((queue) => (
                    <SelectItem key={queue} value={queue}>
                      {queue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dispositionFilter} onValueChange={setDispositionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by disposition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dispositions</SelectItem>
                  {getUniqueValues("disposition").map((disposition) => (
                    <SelectItem key={disposition} value={disposition}>
                      {disposition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={insuranceFilter} onValueChange={setInsuranceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by insurance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Insurance</SelectItem>
                  {getUniqueValues("insurance").map((insurance) => (
                    <SelectItem key={insurance} value={insurance}>
                      {insurance}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={insuranceTypeFilter} onValueChange={setInsuranceTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by insurance type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Insurance Types</SelectItem>
                  {getUniqueValues("insuranceType").map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Queue</CardTitle>
          <CardDescription>
            {user.role === "Staff" ? "Your assigned tasks" : "All clinic tasks"} ({filteredItems.length} items)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tasks found matching your criteria</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">{getTaskIcon(item.taskType)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-foreground">{item.taskType}</h3>
                          <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>{item.priority}</Badge>
                          <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">{item.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>
                              {item.patientName} ({item.patientId})
                            </span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.estimatedTime} min</span>
                          </span>
                          {item.notes.length > 0 && (
                            <span className="flex items-center space-x-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{item.notes.length} notes</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span>Provider: {item.provider}</span>
                          <span>Portfolio: {item.portfolio}</span>
                          <span>Program: {item.program}</span>
                          <span>
                            Insurance: {item.insurance} ({item.insuranceType})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {item.status !== "Completed" && (
                        <>
                          {item.status === "Pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateItemStatus(item.id, "In Progress")
                              }}
                            >
                              Start
                            </Button>
                          )}
                          {item.status === "In Progress" && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateItemStatus(item.id, "Completed")
                              }}
                            >
                              Complete
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {getTaskIcon(selectedItem.taskType)}
                  <span>{selectedItem.taskType}</span>
                </DialogTitle>
                <DialogDescription>
                  Task ID: {selectedItem.id} • Patient: {selectedItem.patientName} ({selectedItem.patientId})
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="notes">Notes ({selectedItem.notes.length})</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        <Badge className={`${getStatusColor(selectedItem.status)}`}>
                          {getStatusIcon(selectedItem.status)}
                          <span className="ml-1">{selectedItem.status}</span>
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Priority</Label>
                      <div className="mt-1">
                        <Badge className={`${getPriorityColor(selectedItem.priority)}`}>{selectedItem.priority}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Assigned To</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedItem.assignedTo}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Estimated Time</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedItem.estimatedTime} minutes</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Created Date</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(selectedItem.createdDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Due Date</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(selectedItem.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedItem.description}</p>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <div className="space-y-3">
                    {selectedItem.notes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
                    ) : (
                      selectedItem.notes.map((note, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm">{note}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-note">Add Note</Label>
                    <Textarea
                      id="new-note"
                      placeholder="Enter your note here..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={() => addNote(selectedItem.id, newNote)} disabled={!newNote.trim()} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Update Status</Label>
                      <div className="flex space-x-2">
                        {selectedItem.status !== "In Progress" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemStatus(selectedItem.id, "In Progress")}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Start Task
                          </Button>
                        )}
                        {selectedItem.status !== "Completed" && (
                          <Button size="sm" onClick={() => updateItemStatus(selectedItem.id, "Completed")}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                        )}
                        {selectedItem.status !== "On Hold" && selectedItem.status !== "Completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemStatus(selectedItem.id, "On Hold")}
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Put On Hold
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        Status updates will automatically sync with mySage system
                      </p>
                    </div>
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
