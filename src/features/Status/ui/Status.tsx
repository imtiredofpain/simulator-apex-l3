import { memo, useEffect, useRef, useState } from 'react';
import useCheckStatus from '../hooks/useCheck';
import useCheckStatusDB from '../hooks/useCheckDB';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@shared/components/ui/tooltip';
import { cn } from '@shared/lib/utils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Separator } from '@shared/components/ui/separator';
import { Button } from '@shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';

type LatencyPoint = {
  timestamp: number;
  value: number;
};

const FIVE_MINUTES_MS = 5 * 60 * 1000;

type LatencyStore = {
  apiPoints: LatencyPoint[];
  dbPoints: LatencyPoint[];
  addApiPoint: (value: number, timestamp?: number) => void;
  addDbPoint: (value: number, timestamp?: number) => void;
};

const useStatusLatencyStore = create<LatencyStore>()(
  persist(
    (set) => ({
      apiPoints: [],
      dbPoints: [],
      addApiPoint: (value, timestamp) => {
        const now = timestamp ?? Date.now();
        set((state) => {
          const next = [...state.apiPoints, { timestamp: now, value }];
          return {
            ...state,
            apiPoints: next.filter(
              (point) => now - point.timestamp <= FIVE_MINUTES_MS
            ),
          };
        });
      },
      addDbPoint: (value, timestamp) => {
        const now = timestamp ?? Date.now();
        set((state) => {
          const next = [...state.dbPoints, { timestamp: now, value }];
          return {
            ...state,
            dbPoints: next.filter(
              (point) => now - point.timestamp <= FIVE_MINUTES_MS
            ),
          };
        });
      },
    }),
    {
      name: 'status-latency-store',
    }
  )
);

type StatusConnectProps = {
  isSmall?: boolean;
};

function States({
  apiDurationMs,
  dbDurationMs,
  isPendingCheck,
  avgLatencyMs,
  isErrorCheck,
  isPendingDB,
  isErrorDB,
  dataCheck,
  dataCheckDB,
  isPopup = false,
}: {
  isPopup?: boolean;
  apiDurationMs: number | null;
  dbDurationMs: number | null;
  avgLatencyMs: number | null;
  isPendingCheck: boolean;
  isErrorCheck: boolean;
  isPendingDB: boolean;
  isErrorDB: boolean;
  dataCheck: any;
  dataCheckDB: any;
}) {
  return (
    <div className="space-y-0.5 text-[11px] text-slate-300">
      <div className="flex items-baseline justify-between gap-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
        <span
          className={cn(isPopup ? 'text-black dark:text-white' : 'text-muted')}
        >
          API
        </span>
        <span
          className={cn(
            'w-full text-left',
            isPendingCheck
              ? 'text-amber-300'
              : isErrorCheck
              ? 'text-red-400'
              : 'text-emerald-400'
          )}
        >
          {isPendingCheck
            ? 'запрос выполняется…'
            : isErrorCheck
            ? dataCheck?.isSuccess
              ? dataCheck?.message
              : 'API not available'
            : dataCheck?.isSuccess
            ? dataCheck?.message
            : 'ok'}
        </span>
        <span
          className={cn(
            'text-[10px] shrink-0',
            isPopup ? 'text-black dark:text-white' : 'text-muted'
          )}
        >
          {apiDurationMs != null ? `${apiDurationMs} мс` : '—'}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
        <span
          className={cn(isPopup ? 'text-black dark:text-white' : 'text-muted')}
        >
          DB
        </span>
        <span
          className={cn(
            'w-full text-left',
            isPendingDB
              ? 'text-amber-300'
              : isErrorDB
              ? 'text-red-400'
              : 'text-emerald-400'
          )}
        >
          {isPendingDB
            ? 'запрос выполняется…'
            : isErrorDB
            ? dataCheckDB?.isSuccess
              ? dataCheckDB?.message
              : 'DB not available'
            : dataCheckDB?.isSuccess
            ? dataCheckDB?.message
            : 'ok'}
        </span>
        <span
          className={cn(
            'text-[10px] shrink-0',
            isPopup ? 'text-black dark:text-white' : 'text-muted'
          )}
        >
          {dbDurationMs != null ? `${dbDurationMs} мс` : '—'}
        </span>
      </div>
      <div className="flex items-baseline justify-between w-full gap-1">
        <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
        <span
          className={cn(
            'w-full',
            isPopup ? 'text-black dark:text-white' : 'text-muted'
          )}
        >
          Среднее (5 мин)
        </span>
        <span
          className={cn(
            'text-left text-[11px] shrink-0',
            isPopup ? 'text-black dark:text-white' : 'text-muted'
          )}
        >
          {avgLatencyMs != null ? `${avgLatencyMs} мс` : '—'}
        </span>
      </div>
    </div>
  );
}

function StatusConnect({ isSmall = false }: StatusConnectProps) {
  const {
    data: dataCheck,
    isError: isErrorCheck,
    isLoading: isLoadingCheck,
    isFetching: isFetchingCheck,
  } = useCheckStatus();
  const {
    data: dataCheckDB,
    isError: isErrorDB,
    isLoading: isLoadingDB,
    isFetching: isFetchingDB,
  } = useCheckStatusDB();

  const isPendingCheck = isLoadingCheck || isFetchingCheck;
  const isPendingDB = isLoadingDB || isFetchingDB;

  const [apiDurationMs, setApiDurationMs] = useState<number | null>(null);
  const [dbDurationMs, setDbDurationMs] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const apiStartRef = useRef<number | null>(null);
  const dbStartRef = useRef<number | null>(null);
  const { apiPoints, dbPoints, addApiPoint, addDbPoint } =
    useStatusLatencyStore();

  // pending-флаги используем для измерения времени,
  // а для UI показываем "Проверяем соединение..." только до первого успешного ответа,
  // чтобы бейдж не дёргался на каждом рефетче.
  const isPending = isPendingCheck || isPendingDB;
  const hasAnyData = !!dataCheck || !!dataCheckDB;
  const showPendingUi = !hasAnyData && isPending;

  const windowNow = Date.now();
  const windowCutoff = windowNow - FIVE_MINUTES_MS;
  const allPointsInWindow = [...apiPoints, ...dbPoints].filter(
    (p) => p.timestamp >= windowCutoff
  );
  const avgLatencyMs =
    allPointsInWindow.length > 0
      ? Math.round(
          allPointsInWindow.reduce((acc, p) => acc + p.value, 0) /
            allPointsInWindow.length
        )
      : null;

  const dotColor = showPendingUi
    ? 'bg-yellow-400'
    : isErrorCheck || isErrorDB
    ? 'bg-red-500'
    : 'bg-emerald-500';
  const label = showPendingUi
    ? 'Проверяем соединение с сервером L2...'
    : isErrorCheck || isErrorDB
    ? 'Ошибка соединения с сервером L2'
    : 'Соединение с сервером L2 установлено';

  useEffect(() => {
    if (isPendingCheck) {
      // новый запрос к API (первый или рефетч)
      apiStartRef.current = performance.now();
      setApiDurationMs(null);
    } else if (apiStartRef.current != null) {
      // запрос завершён (успешно или с ошибкой)
      const diff = performance.now() - apiStartRef.current;
      const rounded = Math.round(diff);
      setApiDurationMs(rounded);
      apiStartRef.current = null;

      const now = Date.now();
      addApiPoint(rounded, now);
    }
  }, [isPendingCheck]);

  useEffect(() => {
    if (isPendingDB) {
      // новый запрос к БД (первый или рефетч)
      dbStartRef.current = performance.now();
      setDbDurationMs(null);
    } else if (dbStartRef.current != null) {
      // запрос завершён (успешно или с ошибкой)
      const diff = performance.now() - dbStartRef.current;
      const rounded = Math.round(diff);
      setDbDurationMs(rounded);
      dbStartRef.current = null;

      const now = Date.now();
      addDbPoint(rounded, now);
    }
  }, [isPendingDB]);

  // Общая ошибка соединения
  const isError = isErrorCheck || isErrorDB;
  const isLoading = isLoadingCheck || isLoadingDB;

  if (isSmall && !(isError || isLoading)) {
    return null;
  }

  return (
    <>
      <Tooltip delayDuration={700}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] cursor-default',
              isSmall ? 'bg-transparent' : 'bg-accent'
            )}
            onClick={() => {
              setOpenDialog(true);
            }}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
            <span className="font-medium tracking-tight">{label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="text-xs border-1 light dark:text-[#fff]">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-1 -mr-1">
              <div className="mt-1 mb-2 font-medium">Детали соединения</div>
              <Button
                size="sm"
                onClick={() => {
                  setOpenDialog(true);
                }}
                variant={'outline'}
                className="h-5 text-[11px] p-2 text-black rounded-sm"
              >
                Открыть в окне
              </Button>
            </div>
            <States
              apiDurationMs={apiDurationMs}
              dbDurationMs={dbDurationMs}
              avgLatencyMs={avgLatencyMs}
              isPendingCheck={isPendingCheck}
              isErrorCheck={isErrorCheck}
              isPendingDB={isPendingDB}
              isErrorDB={isErrorDB}
              dataCheck={dataCheck}
              dataCheckDB={dataCheckDB}
            />
            <Separator className="my-4 bg-secondary/15" />
          </div>
        </TooltipContent>
      </Tooltip>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="w-[calc(100vw-100px)]! min-w-[calc(100vw-100px)]! h-[calc(100vh-100px)]! min-h-[calc(100vh-100px)]!">
          <DialogHeader>
            <DialogTitle>Детали соединения с сервером L2</DialogTitle>
            <DialogDescription>
              <States
                apiDurationMs={apiDurationMs}
                dbDurationMs={dbDurationMs}
                avgLatencyMs={avgLatencyMs}
                isPendingCheck={isPendingCheck}
                isErrorCheck={isErrorCheck}
                isPendingDB={isPendingDB}
                isErrorDB={isErrorDB}
                dataCheck={dataCheck}
                dataCheckDB={dataCheckDB}
                isPopup
              />
            </DialogDescription>
            <Separator className="my-4" />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(StatusConnect);
