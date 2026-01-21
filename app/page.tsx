'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/src/providers';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { currentWorkspace, isLoading } = useWorkspace();

  useEffect(() => {
    // Once workspace is loaded, redirect to it
    if (!isLoading && currentWorkspace) {
      router.replace(`/${currentWorkspace.id}`);
    }
  }, [currentWorkspace, isLoading, router]);

  // Show loading state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="space-y-4 text-center" role="status" aria-live="polite">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Loading workspace...</p>
      </div>
    </div>
  );
}
