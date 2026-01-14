import { AppSidebar } from "@/src/components/layout";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/src/components/ui/sidebar";
import { Separator } from "@/src/components/ui/separator";
import ReactQueryProvider from "@/src/providers/react-query-provider";
import { WorkspaceProvider } from "@/src/providers/workspace-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atlas - Task Management",
  description: "Multi-tenant task management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <WorkspaceProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">Atlas</span>
                  </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                  {children}
                </main>
              </SidebarInset>
            </SidebarProvider>
          </WorkspaceProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
