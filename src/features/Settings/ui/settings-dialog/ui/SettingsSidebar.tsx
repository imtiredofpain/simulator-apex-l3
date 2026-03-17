import {
  useSearchParams as useRRSearchParams,
  useNavigate,
  useLocation,
  Link,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { settingsTree } from '@features/Settings/config';
import { splitPath } from '@features/Settings/lib/tree';
import { useSettingsStore } from '@features/Settings/model/store';
import { SettingsSearch } from './SettingsSearch';
import { buildSearchIndex, searchIndex } from '@features/Settings/lib/search';
import { ScrollArea } from '@shared/components/ui/scroll-area';
import { Button } from '@shared/components/ui/button';
import { Separator } from '@shared/components/ui/separator';
import { cn } from '@shared/lib/utils';
import { LinearBlur } from '@shared/components/LinearBlur';
import { useTheme } from '@features/Settings/providers/theme';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSidebarRenderer } from '@features/Settings/registry/sidebar';
import type { SettingsGroup } from '@features/Settings/model/types';

const index = buildSearchIndex();

export const SettingsSidebar: React.FC<{ currentPath: string }> = ({
  currentPath,
}) => {
  const { t } = useTranslation();

  // react-router-dom hooks
  const [params] = useRRSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // const pendingCount = useSettingsStore((s) => s.queue.length);
  const lastError = useSettingsStore((s) => s.lastError);
  const search = useSettingsStore((s) => s.search);
  const setFocus = useSettingsStore((s) => s.setFocus);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [visibleBlur, setVisibleBlur] = useState(false);

  const { theme } = useTheme();

  const [top] = splitPath(currentPath);
  const groups = Object.values(settingsTree.groups) as Array<
    SettingsGroup | true
  >;

  const results = useMemo(() => {
    if (!search.trim()) return [];
    return searchIndex(search, t, index);
  }, [search, t]);

  const resultHasIcon = useMemo(() => {
    return results.some((r) => r.icon);
  }, [results]);

  const openPath = useCallback(
    (dotPath: string, focusId?: string) => {
      const current = new URLSearchParams(params.toString());
      current.set('settings', dotPath);
      navigate(
        { pathname: location.pathname, search: `?${current.toString()}` },
        { replace: true }
      );
      if (focusId) setFocus(focusId, true);
    },
    [params, navigate, location.pathname, setFocus]
  );

  useEffect(() => {
    const root = viewportRef.current;
    if (!root) return;

    // Radix Viewport lives inside the ScrollArea root:
    const vp = root.querySelector(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLDivElement | null;
    if (!vp) return;

    const onScroll = () => {
      const { scrollTop } = vp;
      setVisibleBlur(scrollTop > 0);
    };

    vp.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      vp.removeEventListener('scroll', onScroll);
    };
  }, [viewportRef, setVisibleBlur]);

  return (
    <ScrollArea className="w-full h-[550px]" ref={viewportRef}>
      <aside className="w-full">
        <div className="sticky -top-[1px] mb-3 z-2">
          <SettingsSearch />
          <LinearBlur
            blur={visibleBlur ? 64 : 0}
            color={
              visibleBlur
                ? theme === 'dark'
                  ? '#171717'
                  : '#fff'
                : '#00000000'
            }
            rotate={180}
            className="absolute inset-0"
          />
        </div>

        {/* Если нет запроса — показываем обычный список разделов */}
        {!search.trim() ? (
          <nav className="flex flex-col gap-2 px-3">
            {groups.map((g, i) => {
              if (g === true)
                return <Separator key={'separator' + i} className="my-2" />;
              const current = new URLSearchParams(params.toString());
              current.set('settings', g.id);
              const active = top === g.id;
              const href = `?${current.toString()}`;
              const Custom = getSidebarRenderer(g.sidebarRenderer);
              const onClick = () => openPath(g.id, undefined);
              const Icon = g.icon;

              if (Custom) {
                return (
                  <div key={g.id}>
                    <Custom
                      group={g}
                      active={active}
                      path={href}
                      onClick={onClick}
                      t={t}
                    />
                  </div>
                );
              }

              return (
                <Link key={g.id} to={href} tabIndex={-1}>
                  <Button
                    className={`flex items-center gap-2 w-full justify-start ${
                      top === g.id
                        ? 'bg-muted font-medium'
                        : 'hover:bg-muted/50'
                    }`}
                    variant="ghost"
                  >
                    {Icon ? <Icon size={18} className="shrink-0" /> : null}
                    {t('settings.' + g.i18nKey)}
                  </Button>
                </Link>
              );
            })}
            <Separator className="my-2" />
          </nav>
        ) : (
          // Иначе — выдаём результаты поиска
          <div className="px-3 py-2">
            {results.length === 0 ? (
              <div className="py-2 text-sm text-muted-foreground">
                {t('settings.search.noResults')}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {results.map(({ entry, label, breadcrumb, icon }) => {
                  const dotPath = entry.groupPath; // открываем группу/подгруппу
                  return (
                    <button
                      key={`${entry.kind}-${entry.id}-${dotPath}`}
                      type="button"
                      className="px-2 py-2 text-left rounded-md hover:bg-muted"
                      onClick={() =>
                        openPath(
                          dotPath,
                          entry.kind === 'item' ? entry.id : undefined
                        )
                      }
                    >
                      <div
                        className={cn(
                          'flex items-start gap-2',
                          !icon ? 'px-1' : 'px-0.5'
                        )}
                      >
                        {(() => {
                          const IconC = icon;
                          return IconC ? (
                            <IconC
                              size={16}
                              className="mt-0.5 shrink-0 text-muted-foreground"
                            />
                          ) : resultHasIcon ? (
                            <div className="w-4 shrink-0" />
                          ) : null;
                        })()}
                        <div>
                          <div className="text-sm">{label}</div>
                          <div className="text-xs text-muted-foreground">
                            {breadcrumb.join(' › ')}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <Separator className="my-2" />
          </div>
        )}

        <div className="px-3 py-3 mt-2">
          {lastError ? (
            <div className="mt-1 text-xs text-red-600">{lastError}</div>
          ) : null}
        </div>
      </aside>
    </ScrollArea>
  );
};
