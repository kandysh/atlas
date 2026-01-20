import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="space-y-6 text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Workspace Not Found
          </h2>
          <p className="text-sm text-muted-foreground">
            The workspace you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    </div>
  );
}
