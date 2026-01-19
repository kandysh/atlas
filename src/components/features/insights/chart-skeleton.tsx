'use client';

import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Skeleton } from '@/src/components/ui/skeleton';

// Pre-defined heights for skeleton bars (avoid Math.random during render)
const BAR_HEIGHTS = [65, 82, 48, 91, 73, 56];

interface ChartSkeletonProps {
  hasFooter?: boolean;
}

export function ChartSkeleton({ hasFooter = false }: ChartSkeletonProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center justify-center h-[250px]">
          <div className="space-y-3 w-full">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardContent>
      {hasFooter && (
        <div className="px-6 pb-4">
          <Skeleton className="h-4 w-40" />
        </div>
      )}
    </Card>
  );
}

export function DonutChartSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="flex items-center justify-center aspect-square max-h-[250px] mx-auto">
          <Skeleton className="h-40 w-40 rounded-full" />
        </div>
      </CardContent>
      <div className="px-6 py-4">
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </Card>
  );
}

export function BarChartSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent>
        <div className="h-[250px] flex items-end gap-2">
          {BAR_HEIGHTS.map((height, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <Skeleton
                className="w-full rounded-t"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function LineChartSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent>
        <div className="h-[250px] flex flex-col justify-center space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}
