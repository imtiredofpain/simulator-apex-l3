import { memo } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface SimplePageProps {
  title: string | React.ReactNode;
  isLoading?: boolean;
  actionComponent?: React.ReactNode;
  contentComponent: React.ReactNode;
}

const SimplePage = memo(
  ({
    title,
    contentComponent,
    actionComponent,
    isLoading = false,
  }: SimplePageProps) => {
    return (
      <Card className="border-0 shadow-none bg-transparent flex-1 h-full flex flex-col gap-0">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          {isLoading ? (
            <Skeleton className="w-3/7 h-8" />
          ) : (
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          )}
        </CardHeader>
        {!isLoading && actionComponent && (
          <div className="px-6 pb-6">{actionComponent}</div>
        )}
        {isLoading && actionComponent && (
          <div className="px-6 pb-6 flex flex-row gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-46 h-10" />
            ))}
          </div>
        )}
        <CardContent className="p-0 px-6 pb-6 flex-1 flex flex-col">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <div className="rounded-md flex-1">{contentComponent}</div>
          )}
        </CardContent>
      </Card>
    );
  }
);

export { SimplePage };
