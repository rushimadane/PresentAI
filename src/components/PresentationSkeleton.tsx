import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Shown optimistically while a deck is being generated, so the user sees the
// final layout taking shape instead of a blank screen or a lone spinner.
const PresentationSkeleton: React.FC = () => {
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-12" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="aspect-video rounded-lg border border-border overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <Skeleton className="h-full w-full rounded-none min-h-[160px]" />
          <div className="p-6 flex flex-col justify-center gap-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-2.5 w-2.5 rounded-full" />
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </CardFooter>
    </Card>
  );
};

export default PresentationSkeleton;
