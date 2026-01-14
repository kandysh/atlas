import { AppSidebar } from "@/src/components/layout";
import { SidebarProvider } from "@/src/components/ui/sidebar";
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
              <main className="flex-1 p-6 overflow-auto">{children}</main>
            </SidebarProvider>
          </WorkspaceProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
