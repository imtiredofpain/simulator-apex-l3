import type { IReportHistory } from '@features/Reports/types';
import { VirtualTableV2 } from '@mrdn/app-common';
import type { EnumsUnits } from '@shared/api/hooks/enums/types';
import { Badge } from '@shared/components/ui/badge';
import { Separator } from '@shared/components/ui/separator';
import { formatByUnit } from '@shared/lib/formatByUnit';
import { cn } from '@shared/lib/utils';
import { memo, useLayoutEffect, useMemo, useRef, useState } from 'react';

interface ReportHistoryProps {
  history: IReportHistory[];
  actions?: EnumsUnits;
}

function ReportHistory(props: ReportHistoryProps) {
  const { history, actions: enumActions = {} } = props;

  const panelRef = useRef<HTMLDivElement>(null);
  const [heightPx, setHeightPx] = useState(400);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const actions = useMemo(() => {
    const setAction = new Map<
      string,
      { count: number; name: string; id: string }
    >();
    history.map((h) => {
      const a = enumActions[h.action.toString()] ?? {
        name: h.action.toString(),
        description: h.action.toString(),
      };
      if (setAction.has(a.name)) {
        const c = setAction.get(a.name);
        if (c) {
          setAction.set(a.name, {
            count: c.count + 1,
            name: a.description,
            id: c.id,
          });
        }
      } else {
        setAction.set(a.name, {
          count: 1,
          name: a.description,
          id: h.action.toString(),
        });
      }
    });

    // Сортируем
    const arr = Array.from(setAction);
    arr.sort((a, b) => {
      return b[1].count - a[1].count;
    });

    return {
      array: arr,
      actions: setAction,
      total: arr.length,
    };
  }, [history, enumActions]);

  const filteredHistory = useMemo(() => {
    if (!activeAction) return history;

    return history.filter((h) => h.action.toString() === activeAction);
  }, [activeAction, history]);

  const handleClickAction = (action: string) => {
    if (activeAction === action) {
      setActiveAction(null);
    } else {
      setActiveAction(action);
    }
  };

  useLayoutEffect(() => {
    if (!panelRef.current) return;

    const el = panelRef.current;

    // если нет ResizeObserver (старый браузер) — просто выходим
    if (typeof ResizeObserver === 'undefined') return;

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
  }, []);

  return (
    <div className="h-full flex flex-col gap-2">
      {actions.total > 1 && (
        <div className="flex flex-row flex-wrap gap-2">
          {actions.array.map(([a]) => {
            return (
              <Badge
                key={a}
                variant={
                  actions.actions.get(a)?.id === activeAction
                    ? 'default'
                    : 'outline'
                }
                onClick={() =>
                  handleClickAction(actions.actions.get(a)?.id ?? '')
                }
                className="py-1.5 cursor-pointer gap-2"
              >
                <div>{actions.actions.get(a)?.name}</div>
                <Separator orientation="vertical" />
                <div
                  className={cn(
                    'text-muted-foreground',
                    a === activeAction && 'text-white'
                  )}
                >
                  {actions.actions.get(a)?.count}
                </div>
              </Badge>
            );
          })}
        </div>
      )}
      <div className="border rounded-md overflow-hidden h-full" ref={panelRef}>
        <VirtualTableV2<IReportHistory>
          data={filteredHistory.map((h, i) => {
            return {
              order: i + 1,
              ...h,
            };
          })}
          showButtonTop
          footerToolbar={
            <div className="flex flex-row gap-2 justify-between text-xs text-muted-foreground bg-muted-foreground/4 -m-2 py-2 px-3">
              <div></div>
              <div>Записей: {filteredHistory.length}</div>
            </div>
          }
          columns={[
            { accessorKey: 'order', header: '№' },
            {
              accessorKey: 'timestamp',
              header: 'Дата и время',
              cell: (info) => {
                const v = info.getValue() as string;
                const d = new Date(v);
                const f = formatByUnit(d.getTime(), {
                  type: 'timestamp',
                  format: 'd.m.y в h:i:s',
                });
                return <span>{f}</span>;
              },
            },
            {
              accessorKey: 'action',
              header: 'Действие',
              cell: (info) => {
                const v = info.getValue() as string;
                const a = enumActions[v] ?? {
                  name: v,
                  description: v,
                };
                return <span>{a.description}</span>;
              },
            },
            { accessorKey: 'oldStatus', header: 'Статус до' },
            { accessorKey: 'newStatus', header: 'Статус после' },
            { accessorKey: 'comment', header: 'Комментарий' },
          ]}
          selectionMode="none"
          heightPx={heightPx}
        />
      </div>
    </div>
  );
}

export default memo(ReportHistory);
