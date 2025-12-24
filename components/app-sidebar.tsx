import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  ListTodo,
  CheckCircle,
  FolderKanban,
  BarChart3,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";
import InsightsIcon from "./ui/icons/insights";

const sideBarItems = {
  tasks: {
    active: {
      label: "Active",
      icon: LayoutDashboard,
      href: "/tasks/active",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      href: "/tasks/completed",
    },
    label: "Tasks",
    icon: ListTodo,
  },
  insights: {
    label: "Insights",
    icon: InsightsIcon,
    href: "/insights",
  },
};

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarContent>
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <sideBarItems.tasks.icon className="h-4 w-4" />
              <span>{sideBarItems.tasks.label}</span>
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={sideBarItems.tasks.active.href}>
                    <sideBarItems.tasks.active.icon className="h-4 w-4" />
                    <span>{sideBarItems.tasks.active.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={sideBarItems.tasks.completed.href}>
                    <sideBarItems.tasks.completed.icon className="h-4 w-4" />
                    <span>{sideBarItems.tasks.completed.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarMenuItem className="mt-2">
            <SidebarMenuButton asChild>
              <Link href={sideBarItems.insights.href}>
                <sideBarItems.insights.icon className="h-4 w-4" />
                <span>{sideBarItems.insights.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="p-3 text-xs text-muted-foreground">
        Logged in as kandy
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
