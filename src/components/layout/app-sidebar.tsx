"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/src/components/ui/sidebar";
import {
  CheckCircle2,
  LayoutDashboard,
  BarChart3,
} from "lucide-react";
import { WorkspaceToggler } from "./workspace-toggler";
import NavUser from "./nav-user";
import { cn } from "@/src/lib/utils";

const navigation = [
  {
    name: "Active",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Completed",
    href: "/completed",
    icon: CheckCircle2,
  },
  {
    name: "Insights",
    href: "/insights",
    icon: BarChart3,
  },
];

export function AppSidebar() {
  const currentPath = usePathname();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Workspace Header */}
      <SidebarHeader className={cn(
        "border-b border-border transition-all",
        state === "collapsed" ? "p-2" : "p-4"
      )}>
        <WorkspaceToggler />
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="flex-1 p-4 px-3">
        <SidebarMenu className="space-y-1">
          {navigation.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link
                    href={item.href}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter className="p-4 border-t border-border">
        <NavUser />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
