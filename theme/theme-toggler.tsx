"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-9 w-9 hover:bg-accent transition-colors duration-200"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-muted-foreground transition-all duration-300 rotate-0" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground transition-all duration-300 rotate-180" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
