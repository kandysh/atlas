"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  ListTodo,
} from "lucide-react";
import InsightsIcon from "../ui/icons/insights";
import NavUser from "./nav-user";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const [tasksExpanded, setTasksExpanded] = useState(true);
  const currentPath = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col"
    >
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Workspace</h2>
        <p className="text-xs text-muted-foreground mt-1">Project Management</p>
      </div>

      <SidebarContent className="flex-1 p-4 px-2 space-y-1">
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel
              onClick={() => setTasksExpanded(!tasksExpanded)}
              className="w-full flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors duration-200"
            >
              {tasksExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <ListTodo className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Tasks</span>
            </SidebarGroupLabel>

            {tasksExpanded && (
              <SidebarGroupContent className="ml-1 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      href="/tasks/active"
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                        currentPath === "/tasks/active"
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Active Board</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="mt-2">
                  <SidebarMenuButton asChild>
                    <Link
                      href="/tasks/completed"
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                        currentPath === "/tasks/completed"
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Completed</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarGroupContent>
            )}
          </SidebarGroup>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href="/insights"
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  currentPath === "/insights"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <InsightsIcon className="h-4 w-4" />
                <span>Insights</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
