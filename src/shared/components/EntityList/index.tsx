import { Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import SearchInput from '../Sidebar/ui/SearchInput';
import { SimleTable } from '../SimpleTable/Index';
import type { ColumnDefExt, VirtualTableProps } from '@mrdn/app-common';
import { type LevenshteinOptions, type SearchStrategy } from './Strategy';
import { localSearch } from './localSearch';
import { defautConfigSearch } from './defautConfigSearch';

interface EntityListProps<T> {
  title: string | React.ReactNode;
  data: T[];
  columns: ColumnDefExt<T, unknown>[];
  isLoading: boolean;

  onCreate?: () => void;
  hiddenCreate?: boolean;
  hiddenColumns?: VirtualTableProps<T>['columnVisibility'];
  renderEmpty?: VirtualTableProps<T>['renderEmpty'];

  search?: {
    has?: boolean;
    placeholder?: string;
    local?: {
      keys: Array<keyof T>;
      strategies?: (
        | SearchStrategy<LevenshteinOptions>
        | SearchStrategy<unknown>
      )[];
      threshold?: number;
    };
  };
}

export function EntityList<T>({
  title,
  data,
  columns,
  isLoading,
  onCreate,
  hiddenCreate = false,
  hiddenColumns,
  renderEmpty,
  search,
}: EntityListProps<T>) {
  const { has = true, local } = {
    ...defautConfigSearch<T>(Object.keys(data?.[0] || {}) as (keyof T)[]),
    ...search,
  };

  const [query, setQuery] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const [heightPx, setHeightPx] = useState(400);

  const rows = useMemo(() => {
    try {
      if (!has || !query || !local) {
        return data;
      }

      const filtered = localSearch(data, query, {
        keys: local.keys,
        strategies: local.strategies as SearchStrategy<unknown>[],
        threshold: local.threshold ?? 2,
      });
      return filtered;
    } catch (error) {
      console.error(error);
      return data;
    }
  }, [local, has, query, data]);

  useEffect(() => {
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
  }, [isLoading]);

  return (
    <Card className="border-0 shadow-none bg-transparent flex-1 h-full flex flex-col gap-0">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>

        {has && (
          <SearchInput
            placeholder={search?.placeholder ?? 'Поиск...'}
            value={query}
            onChange={setQuery}
            onPaste={(v) => {
              setQuery(v.replaceAll(/\s+/g, ' ').trim());
            }}
            delay={800}
            className="max-w-[300px]!"
          />
        )}
      </CardHeader>

      {!hiddenCreate && onCreate && (
        <div className="px-6 pb-6">
          <Button
            onClick={onCreate}
            variant="submit"
            className="dark:text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать
          </Button>
        </div>
      )}

      <CardContent className="p-0 px-6 pb-6 flex-1" ref={panelRef}>
        <SimleTable
          key={query || 'default'}
          rows={rows}
          columns={columns}
          isLoading={isLoading}
          hiddenColumns={hiddenColumns}
          valueSearch={query}
          renderEmpty={renderEmpty}
          heightPx={heightPx}
        />
      </CardContent>
    </Card>
  );
}
