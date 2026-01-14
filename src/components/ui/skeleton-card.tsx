"use client";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "./card";

export function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-[40%]" />
        <Skeleton className="h-4 w-[25%]" />
      </CardHeader>

      <CardContent>
        <Skeleton className="h-65 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}
