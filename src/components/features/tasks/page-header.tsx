'use client';

import { useState, useCallback, useMemo } from 'react';
import { ExternalLink, Settings, X, Check } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  workspaceId: string;
}

const DASHBOARD_LINK_KEY = 'processes-dashboard-link';

// Validate URL is well-formed and uses safe protocols (http/https)
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function getStoredLink(workspaceId: string): string {
  if (typeof window === 'undefined') return '';
  const storageKey = `${DASHBOARD_LINK_KEY}-${workspaceId}`;
  const stored = localStorage.getItem(storageKey) || '';
  // Only return if it's a valid URL
  return isValidUrl(stored) ? stored : '';
}

export function PageHeader({ title, subtitle, workspaceId }: PageHeaderProps) {
  const storageKey = useMemo(
    () => `${DASHBOARD_LINK_KEY}-${workspaceId}`,
    [workspaceId],
  );

  const [dashboardLink, setDashboardLink] = useState<string>(() =>
    getStoredLink(workspaceId),
  );
  const [editValue, setEditValue] = useState<string>(() =>
    getStoredLink(workspaceId),
  );
  const [isOpen, setIsOpen] = useState(false);

  // Check if the current edit value is a valid URL
  const isEditValueValid = useMemo(
    () => !editValue.trim() || isValidUrl(editValue.trim()),
    [editValue],
  );

  const handleSave = useCallback(() => {
    const trimmedValue = editValue.trim();
    if (trimmedValue) {
      // Only save if URL is valid (http/https)
      if (isValidUrl(trimmedValue)) {
        localStorage.setItem(storageKey, trimmedValue);
        setDashboardLink(trimmedValue);
      }
      // If invalid, don't save but still close the popover
    } else {
      localStorage.removeItem(storageKey);
      setDashboardLink('');
    }
    setIsOpen(false);
  }, [editValue, storageKey]);

  const handleClear = useCallback(() => {
    localStorage.removeItem(storageKey);
    setDashboardLink('');
    setEditValue('');
    setIsOpen(false);
  }, [storageKey]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (open) {
        setEditValue(dashboardLink);
      }
    },
    [dashboardLink],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {dashboardLink && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2"
            >
              <a
                href={dashboardLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Processes Dashboard
              </a>
            </Button>
          )}
          <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                <span className="sr-only">Configure dashboard link</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Processes Dashboard Link</h4>
                  <p className="text-xs text-muted-foreground">
                    Add a link to your external processes tracked dashboard.
                  </p>
                </div>
                <div className="space-y-1">
                  <Input
                    placeholder="https://..."
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className={`text-sm ${!isEditValueValid ? 'border-destructive' : ''}`}
                  />
                  {!isEditValueValid && (
                    <p className="text-xs text-destructive">
                      Please enter a valid URL (http:// or https://)
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-muted-foreground hover:text-destructive"
                    disabled={!dashboardLink && !editValue}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!isEditValueValid}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
