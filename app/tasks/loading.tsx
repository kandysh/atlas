import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="space-y-4">
        {/* Toolbar skeleton */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Skeleton className="h-9 w-full max-w-md" />
            <Skeleton className="h-9 w-24" />
          </div>
          <Skeleton className="h-9 w-9" />
        </div>

        {/* Mobile card skeletons */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop table skeleton */}
        <div className="hidden md:block rounded-lg border border-border bg-card p-4">
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>

        {/* Pagination skeleton */}
        <div className="flex justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-48" />
        </div>
      </div>
    </div>
  )
}
