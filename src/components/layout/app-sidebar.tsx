'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from '@/src/components/ui/sidebar';
import {
  CheckCircle2,
  LayoutDashboard,
  BarChart3,
  Moon,
  Sun,
} from 'lucide-react';
import { WorkspaceToggler } from './workspace-toggler';
import NavUser from './nav-user';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { useTheme } from 'next-themes';

const navigation = [
  {
    name: 'Active',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Completed',
    href: '/completed',
    icon: CheckCircle2,
  },
  {
    name: 'Insights',
    href: '/insights',
    icon: BarChart3,
  },
];

export function AppSidebar() {
  const currentPath = usePathname();
  const { state } = useSidebar();
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Workspace Header */}
      <SidebarHeader
        className={cn(
          'border-b border-border transition-all',
          state === 'collapsed' ? 'p-2' : 'p-4',
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <WorkspaceToggler />
          </div>
          {state !== 'collapsed' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 shrink-0"
            >
              <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
        </div>
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
                      'w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
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

        {/* Theme toggle for collapsed state */}
        {state === 'collapsed' && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full h-10"
            >
              <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        )}
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter
        className={cn(
          'border-t border-border transition-all',
          state === 'collapsed' ? 'p-2' : 'p-4',
        )}
      >
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
