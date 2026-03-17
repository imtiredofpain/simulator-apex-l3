import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SimplePage } from "@shared/components/SimplePage";
import { Spin, VirtualTableV2 } from "@mrdn/app-common";
import { logsColumns } from "./logsColums";
import { Sheet } from "@shared/components/ui/sheet";
import useQueryInfinitiLogs from "../hooks/useQueryInfititeLogs";
import { LogsContent } from "./logsContents/LogsContent";
import { formatByUnit } from "@shared/lib/formatByUnit";
import type { LogsDto } from "../types";
import { AnimatePresence, motion } from "framer-motion";

function ApiLogs() {
  const [open, setOpen] = useState(false); // Состояние для открытия Sheet
  const [currentId, setCurrentId] = useState<number | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const [heightPx, setHeightPx] = useState(400);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    isFetching,
    error,
  } = useQueryInfinitiLogs();

  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const memoizedColumns = useMemo(
    () => logsColumns({ setCurrentId, setOpen }),
    [] // Нет зависимостей, т.к. setters стабильны
  );

  useEffect(() => {
    if (!panelRef.current) return;

    const el = panelRef.current;

    // если нет ResizeObserver (старый браузер) — просто выходим
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const nextHeight = Math.round(entry.contentRect.height);

      setHeightPx((prev) => (prev === nextHeight ? prev : nextHeight));
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div className="flex-1 h-full">
      <SimplePage
        title="ApiLogs"
        contentComponent={
          <div className="h-full" ref={panelRef}>
            <VirtualTableV2<LogsDto>
              data={flatData}
              getRowId={(row, i) => `${row.id}-${i}`}
              onEndReached={handleEndReached}
              columns={memoizedColumns}
              heightPx={heightPx}
              showButtonTop
              isLoading={isFetching}
              footerToolbar={
                <div className="flex flex-row gap-2 justify-between text-xs text-muted-foreground bg-muted-foreground/4 -m-2 py-2 px-3">
                  <div>
                    <AnimatePresence>
                      {isFetching && (
                        <motion.div
                          className="flex flex-row gap-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Spin size={14} width={3} />
                          <div>Загрузка...</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    Записей:{" "}
                    {formatByUnit(flatData.length, {
                      type: "number",
                    })}
                    {" из "}
                    {formatByUnit(data?.pages[0].pagination.total ?? 0, {
                      type: "number",
                    })}
                  </div>
                </div>
              }
              selectionMode="none"
              className="border rounded-md"
            />
          </div>
        }
      />
      <Sheet modal={false} open={open} onOpenChange={setOpen}>
        <LogsContent id={currentId} />
      </Sheet>
    </div>
  );
}

export { ApiLogs };
