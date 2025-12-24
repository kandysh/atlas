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
  SidebarRail,
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

export function AppSidebar() {
  const [tasksExpanded, setTasksExpanded] = useState(true);

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold">Workspace</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Project Management
        </p>
      </div>

      <SidebarContent>
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel
              onClick={() => setTasksExpanded(!tasksExpanded)}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              {tasksExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <ListTodo className="h-4 w-4" />
              <span>Tasks</span>
            </SidebarGroupLabel>

            {tasksExpanded && (
              <SidebarGroupContent className="ml-2 mt-1 animate-in slide-in-from-top-2 duration-200">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/tasks/active">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Active Board</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/tasks/completed">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Completed</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarGroupContent>
            )}
          </SidebarGroup>

          <SidebarMenuItem className="ml-2 mt-2">
            <SidebarMenuButton asChild>
              <Link href="/insights">
                <InsightsIcon className="h-4 w-4" />
                <span>Insights</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
