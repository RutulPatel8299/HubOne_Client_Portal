"use client"

import type React from "react"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Activity,
  BarChart3,
  CheckSquare,
  FileText,
  Heart,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import type { User } from "@/app/page"

interface LayoutProps {
  children: React.ReactNode
  user: User
  onLogout: () => void
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Queue Management", href: "/queue", icon: CheckSquare },
  { name: "PA Tracker", href: "/pa-tracker", icon: FileText },
  { name: "EV Tracker", href: "/ev-tracker", icon: Heart },
  { name: "Reports", href: "/reports", icon: Users },
]

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const location = useLocation()

  const getRoleColor = (role: string) => {
    switch (role) {
      case "System Admin":
        return "bg-destructive text-destructive-foreground"
      case "Admin":
        return "bg-accent text-accent-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 group
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${sidebarCollapsed ? "lg:w-16 lg:hover:w-64" : "lg:w-64"}
        w-64
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-accent rounded-md flex-shrink-0">
                <Activity className="h-5 w-5 text-accent-foreground" />
              </div>
              <span
                className={`font-semibold text-sidebar-foreground transition-all duration-300 whitespace-nowrap ${
                  sidebarCollapsed
                    ? "lg:opacity-0 lg:w-0 lg:group-hover:opacity-100 lg:group-hover:w-auto"
                    : "opacity-100 w-auto"
                }`}
              >
                mySage Portal
              </span>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className={`hidden lg:flex transition-all duration-300 ${
                  sidebarCollapsed ? "lg:opacity-0 lg:group-hover:opacity-100" : "opacity-100"
                }`}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center h-10 px-3 text-sm font-medium rounded-md transition-all duration-300 relative group/item
                    ${sidebarCollapsed ? "lg:justify-center lg:group-hover:justify-start" : "justify-start"}
                    ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0 min-w-[20px]" />
                  <span
                    className={`ml-3 transition-all duration-300 whitespace-nowrap ${
                      sidebarCollapsed
                        ? "lg:opacity-0 lg:w-0 lg:group-hover:opacity-100 lg:group-hover:w-auto"
                        : "opacity-100 w-auto"
                    }`}
                  >
                    {item.name}
                  </span>
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 hidden lg:block">
                      {item.name}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full p-2 h-auto justify-start hover:bg-sidebar-accent">
                  <div className="flex items-center space-x-3 w-full">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex-1 min-w-0 text-left transition-all duration-300 ${
                        sidebarCollapsed
                          ? "lg:opacity-0 lg:w-0 lg:group-hover:opacity-100 lg:group-hover:w-auto"
                          : "opacity-100 w-auto"
                      }`}
                    >
                      <p className="text-sm font-medium text-sidebar-foreground truncate">{user.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.clinicName}</p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 mb-2">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Badge
              className={`mt-2 text-xs transition-all duration-300 ${
                sidebarCollapsed ? "lg:opacity-0 lg:group-hover:opacity-100" : "opacity-100"
              } ${getRoleColor(user.role)}`}
            >
              {user.role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-card-foreground">
              {navigation.find((item) => item.href === location.pathname)?.name || "Dashboard"}
            </h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-accent border border-transparent hover:border-border"
              >
                <Avatar className="h-7 w-7 mr-2">
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{user.username}</div>
                  <div className="text-xs text-muted-foreground">{user.role}</div>
                </div>
                <ChevronRight className="h-3 w-3 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <div className="font-medium">{user.username}</div>
                  <div className="text-xs text-muted-foreground">{user.clinicName}</div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
