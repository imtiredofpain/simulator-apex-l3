import { buildBreadcrumbs } from '@app/router/assemble';
import { SidebarTrigger } from '@shared/components/ui/sidebar';
import {
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@shared/components/ui/dropdown-menu';
import {
  memo,
  useMemo,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  Fragment,
} from 'react';
import { Link, useLocation, generatePath } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@shared/components/ui/breadcrumb';
import { PATHS } from '@shared/config/pathRoute';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import { useSelectedInn, useSetSelectedInn } from '@features/Organizations';
import { useQueryOrganizations } from '@features/Organizations/hooks/useQueryOrganizations';

/** ================= Типы крошек (без any) ================= */
type CrumbMeta = { title?: string };
type CrumbConfig = { meta?: CrumbMeta };
type CrumbHandle = { crumb?: (params: unknown) => React.ReactNode };

type Crumb = {
  path: string;
  params?: unknown;
  handle?: unknown;
  config?: CrumbConfig;
};

function isCrumbHandle(x: unknown): x is CrumbHandle {
  return (
    typeof x === 'object' &&
    x !== null &&
    'crumb' in (x as Record<string, unknown>) &&
    typeof (x as CrumbHandle).crumb === 'function'
  );
}

const renderLabel = (c: Crumb): React.ReactNode => {
  const LabelComponent = isCrumbHandle(c.handle)
    ? c.handle.crumb
    : c.config?.meta?.title ?? c.path;
  if (LabelComponent && typeof LabelComponent === 'function') {
    try {
      return <LabelComponent {...(c.params ?? {})} />;
    } catch {
      // безопасный фолбэк
      return c.config?.meta?.title ?? c.path;
    }
  }
  return c.config?.meta?.title ?? c.path;
};

const HYSTERESIS = 24; // px запас против "дёрганья"

function HeaderBar() {
  const selectedInn = useSelectedInn();
  const setSelectedInn = useSetSelectedInn();
  const { data: { data: organizations } = {} } = useQueryOrganizations();
  const location = useLocation();
  const crumbs = useMemo<Crumb[]>(
    () => buildBreadcrumbs(location.pathname),
    [location.pathname]
  );

  /** ------ измерения + состояние видимости крошек ------ */
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const listRef = useRef<HTMLOListElement | null>(null);

  const [hiddenCount, setHiddenCount] = useState(0); // сколько средних спрятали
  const hiddenCountRef = useRef(0);

  const [collapseLeading, setCollapseLeading] = useState(false); // схлопнуть "Главная + первая"
  const collapseLeadingRef = useRef(false);

  const recalc = () => {
    const total = crumbs.length;
    const middle = Math.max(0, total - 2);
    const container = containerRef.current;
    const list = listRef.current;
    if (!container || !list) return;

    let hide = Math.min(hiddenCountRef.current, middle);

    const cw = container.clientWidth;
    const sw = list.scrollWidth;

    // 1) Прячем/возвращаем средние по одному
    if (sw > cw && hide < middle) {
      hide += 1;
      hiddenCountRef.current = hide;
      setHiddenCount(hide);
      return;
    }

    if (cw - sw > HYSTERESIS && hide > 0) {
      hide -= 1;
      hiddenCountRef.current = hide;
      setHiddenCount(hide);
      return;
    }

    // 2) Если все средние уже спрятаны, а места всё еще нет — схлопываем "Главная + первая"
    const needCollapseLeading = sw > cw && hide === middle;
    if (needCollapseLeading && !collapseLeadingRef.current) {
      collapseLeadingRef.current = true;
      setCollapseLeading(true);
      return;
    }

    // 3) Если появилось место — разворачиваем левую группу
    if (collapseLeadingRef.current && cw - sw > HYSTERESIS) {
      collapseLeadingRef.current = false;
      setCollapseLeading(false);
      return;
    }
  };

  useLayoutEffect(() => {
    // При смене пути пересчитываем с нуля
    hiddenCountRef.current = 0;
    collapseLeadingRef.current = false;
    setHiddenCount(0);
    setCollapseLeading(false);
    recalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crumbs.length]);

  // Доп. пересчёт на следующий кадр
  useLayoutEffect(() => {
    let raf = 0;
    raf = requestAnimationFrame(() => recalc());
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenCount, collapseLeading]);

  useEffect(() => {
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        recalc();
      });
    };
    const observer = new ResizeObserver(() => schedule());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header
      className={`flex items-center w-full relative border-b h-[33px] app-shell__header select-none transition-all ease-in-out duration-300 pr-3 overflow-x-auto-auto`}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex items-center gap-2 [-webkit-app-region:no-drag]">
          <SidebarTrigger />
          <span
            ref={containerRef}
            className="block min-w-0 text-sm text-foreground/70  max-w-[50vw] sm:max-w-[60vw] md:max-w-[70vw] lg:max-w-[75vw]"
          >
            <Breadcrumb>
              <BreadcrumbList
                ref={listRef}
                className="flex-nowrap whitespace-nowrap"
              >
                {(() => {
                  const total = crumbs.length;
                  if (total === 0) return null;

                  if (location.pathname === "/") {
                    return (
                      <BreadcrumbItem className="whitespace-nowrap">
                        <BreadcrumbPage>Главная</BreadcrumbPage>
                      </BreadcrumbItem>
                    );
                  }

                  if (total === 1) {
                    const only = crumbs[0];
                    return (
                      <>
                        <BreadcrumbItem className="whitespace-nowrap">
                          <BreadcrumbLink asChild className="whitespace-nowrap">
                            <Link to={PATHS.home}>Главная</Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem className="whitespace-nowrap">
                          <BreadcrumbPage>{renderLabel(only)}</BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    );
                  }

                  const first = crumbs[0];
                  const last = crumbs[total - 1];
                  const middleAll = total > 2 ? crumbs.slice(1, total - 1) : [];

                  const pinned = middleAll.length > 0 ? [middleAll[0]] : [];
                  const rest = middleAll.length > 1 ? middleAll.slice(1) : [];

                  const hide = Math.min(hiddenCount, Math.max(0, rest.length));
                  const hidden = rest.slice(0, hide);
                  const visible = [...pinned, ...rest.slice(hide)];

                  const LeadingCollapsedMenu = () => (
                    <BreadcrumbItem className="whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 whitespace-nowrap">
                          <BreadcrumbEllipsis className="size-4" />
                          <span className="sr-only">Toggle menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem asChild>
                            <Link to="/">Главная</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={first.path}>{renderLabel(first)}</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </BreadcrumbItem>
                  );

                  return (
                    <>
                      {collapseLeading ? (
                        <LeadingCollapsedMenu />
                      ) : (
                        <>
                          <BreadcrumbItem className="whitespace-nowrap">
                            <BreadcrumbLink
                              asChild
                              className="whitespace-nowrap"
                            >
                              <Link to="/">Главная</Link>
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem className="whitespace-nowrap">
                            <BreadcrumbLink
                              asChild
                              className="whitespace-nowrap"
                            >
                              <Link to={first.path}>{renderLabel(first)}</Link>
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                        </>
                      )}

                      {visible.map((c) => (
                        <Fragment key={c.path}>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem className="whitespace-nowrap">
                            <BreadcrumbLink
                              asChild
                              className="whitespace-nowrap"
                            >
                              <Link to={generatePath(c.path, c.params ?? {})}>
                                {renderLabel(c)}
                              </Link>
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                        </Fragment>
                      ))}

                      {hidden.length > 0 && (
                        <>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem className="whitespace-nowrap">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="flex items-center gap-1 whitespace-nowrap">
                                <BreadcrumbEllipsis className="size-4" />
                                <span className="sr-only">Toggle menu</span>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {hidden.map((c) => (
                                  <DropdownMenuItem key={c.path} asChild>
                                    <Link
                                      to={generatePath(c.path, c.params ?? {})}
                                    >
                                      {renderLabel(c)}
                                    </Link>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </BreadcrumbItem>
                        </>
                      )}

                      <BreadcrumbSeparator />
                      <BreadcrumbItem className="whitespace-nowrap">
                        <BreadcrumbPage>{renderLabel(last)}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  );
                })()}
              </BreadcrumbList>
            </Breadcrumb>
          </span>
        </div>
      </div>
      <div className="flex items-center">
        <Select
          onValueChange={(value) => setSelectedInn(value)}
          value={selectedInn || ""}
        >
          <SelectTrigger className="max-w-[280px] w-fit h-1 p-0 border-0 focus-visible:ring-0 bg-transparent!">
            {!selectedInn && <SelectValue placeholder="Выберите организацию" />}
            {selectedInn && (
              <div className='flex flex-row gap-1'>
                <span>
                  {organizations?.find((o) => o.inn === selectedInn)?.name}
                </span>
                <span className='text-muted-foreground'>(ИНН: {selectedInn})</span>
              </div>
            )}
          </SelectTrigger>
          <SelectContent className='w-fit! max-w-[350px]!'>
            <SelectGroup>
              {organizations?.map((org) => (
                <SelectItem key={org.inn} value={org.inn}>
                  <div>
                    <div className="font-semibold">{org.name}</div>
                    <div className="text-muted-foreground text-xs">
                      ИНН: {org.inn}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}

export default memo(HeaderBar);
