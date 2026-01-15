import { AppSidebar, WorkspaceLoader } from "@/src/components/layout";
import { SidebarProvider, SidebarInset } from "@/src/components/ui/sidebar";
import ReactQueryProvider from "@/src/providers/react-query-provider";
import { WorkspaceProvider } from "@/src/providers/workspace-provider";
import { ThemeProvider } from "@/src/providers/theme-provider";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <WorkspaceProvider>
              <WorkspaceLoader>
                <SidebarProvider defaultOpen={true}>
                  <AppSidebar />
                  <SidebarInset>
                    <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                      {children}
                    </main>
                  </SidebarInset>
                </SidebarProvider>
              </WorkspaceLoader>
            </WorkspaceProvider>
            <Toaster
              richColors
              position="bottom-left"
              toastOptions={{
                duration: 3000,
              }}
            />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
