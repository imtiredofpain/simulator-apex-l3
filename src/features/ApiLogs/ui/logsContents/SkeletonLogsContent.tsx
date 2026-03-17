import { Skeleton } from '@shared/components/ui/skeleton';

function SkeletonLogsContent() {
  return (
    <div className="p-4 min-w-full flex flex-col gap-7">
      <Skeleton className="h-15 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export { SkeletonLogsContent };
