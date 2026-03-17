// import {
//   resolveRouteFromMatch,
//   resolveRouteByUrl,
//   buildBreadcrumbs,
// } from '@app/router/assemble';
// import { Button } from '@shared/components/ui/button';
// import { useSidebar, SidebarTrigger } from '@shared/components/ui/sidebar';
// import { cn } from '@shared/lib/utils';
// import {
//   DropdownMenuSub,
//   DropdownMenuSubTrigger,
//   DropdownMenuSubContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
// } from '@shared/components/ui/dropdown-menu';
// import { Ellipsis } from 'lucide-react';
// import platform from 'platform';
// import {
//   memo,
//   useMemo,
//   useState,
//   useEffect,
//   useRef,
//   useLayoutEffect,
//   Fragment,
// } from 'react';
// import { Link, useMatches, useLocation, generatePath } from 'react-router-dom';
// import { type HeaderItem } from '../types';
// import { isGroup, isButton } from '../utils';
// import {
//   Breadcrumb,
//   BreadcrumbEllipsis,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from '@shared/components/ui/breadcrumb';
// import type {
//   ButtonHeaderClickable,
//   ButtonHeaderComponent,
// } from '@shared/navigation/types';
// import { PATHS } from '@shared/config/pathRoute';

// /** ================= Типы крошек (без any) ================= */
// type CrumbMeta = { title?: string };
// type CrumbConfig = { meta?: CrumbMeta };
// type CrumbHandle = { crumb?: (params: unknown) => React.ReactNode };

// type Crumb = {
//   path: string;
//   params?: unknown;
//   handle?: unknown;
//   config?: CrumbConfig;
// };

// function isCrumbHandle(x: unknown): x is CrumbHandle {
//   return (
//     typeof x === 'object' &&
//     x !== null &&
//     'crumb' in (x as Record<string, unknown>) &&
//     typeof (x as CrumbHandle).crumb === 'function'
//   );
// }

// const HYSTERESIS = 24; // px запас против "дёрганья"

// function HeaderBar() {
//   const [isMobileView, setIsMobileView] = useState(false);

//   const matches = useMatches();
//   const current = matches[matches.length - 1];
//   const location = useLocation();
//   const crumbs = useMemo<Crumb[]>(
//     () => buildBreadcrumbs(location.pathname),
//     [location.pathname]
//   );
//   const { isMobile } = useSidebar();

//   const meta = useMemo(
//     () => resolveRouteFromMatch(current)?.config.meta,
//     [current, resolveRouteByUrl]
//   );
//   const dropdown = meta?.dropdown ?? [];
//   const buttons = meta?.buttons ?? [];

//   const handleResize = () => {
//     setIsMobileView(window.innerWidth < 768);
//   };

//   useEffect(() => {
//     window.addEventListener('resize', handleResize);
//     handleResize();
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // const family = (platform.os?.family || '').toLowerCase();
//   // const isMac = family.includes('os x') || family.includes('mac');
//   // const titlebarSidePadding = isMac
//   //   ? isMobile
//   //     ? 'pl-[75px]'
//   //     : 'pl-1'
//   //   : 'pr-36';
//   // const btnChrome = isMac
//   //   ? 'rounded-md hover:bg-black/5 active:bg-black/10'
//   //   : 'rounded hover:bg-black/5 active:bg-black/10 border border-black/10';
//   // const btnBase = `h-8 px-2 text-sm ${btnChrome}`;

//   const renderDropdownItems = (items: HeaderItem[]) =>
//     items.map((item) => {
//       if (isGroup(item)) {
//         return (
//           <DropdownMenuSub key={item.id}>
//             <DropdownMenuSubTrigger className="flex items-center gap-2">
//               {item.icon && (
//                 <item.icon className="w-4 h-4 text-muted-foreground" />
//               )}
//               {item.label}
//             </DropdownMenuSubTrigger>
//             <DropdownMenuSubContent className="min-w-44">
//               {renderDropdownItems(item.children)}
//             </DropdownMenuSubContent>
//           </DropdownMenuSub>
//         );
//       }

//       if (isButton(item)) {
//         if ((item as ButtonHeaderClickable).onClick) {
//           return (
//             <DropdownMenuItem
//               key={item.id}
//               onClick={(e) => {
//                 e.preventDefault();
//                 (item as ButtonHeaderClickable).onClick();
//               }}
//             >
//               {item.icon && <item.icon />}
//               {item.label}
//             </DropdownMenuItem>
//           );
//         } else if ((item as ButtonHeaderComponent).component) {
//           const Component = (item as ButtonHeaderComponent).component;
//           return (
//             <DropdownMenuItem key={item.id}>
//               <Component />
//             </DropdownMenuItem>
//           );
//         }
//       }

//       return <DropdownMenuSeparator key={item.id} />;
//     });

//   /** ------ измерения + состояние видимости крошек ------ */
//   const containerRef = useRef<HTMLSpanElement | null>(null);
//   const listRef = useRef<HTMLOListElement | null>(null);

//   const [hiddenCount, setHiddenCount] = useState(0); // сколько средних спрятали
//   const hiddenCountRef = useRef(0);

//   const [collapseLeading, setCollapseLeading] = useState(false); // схлопнуть "Главная + первая"
//   const collapseLeadingRef = useRef(false);

//   // const renderLabel = (c: Crumb): React.ReactNode => {
//   //   if (isCrumbHandle(c.handle)) {
//   //     try {
//   //       return c.handle.crumb?.(c.params) ?? c.config?.meta?.title ?? c.path;
//   //     } catch {
//   //       // безопасный фолбэк
//   //     }
//   //   }
//   //   return c.config?.meta?.title ?? c.path;
//   // };

//   const renderLabel = (c: Crumb): React.ReactNode => {
//     const LabelComponent = isCrumbHandle(c.handle)
//       ? c.handle.crumb
//       : c.config?.meta?.title ?? c.path;
//     if (LabelComponent && typeof LabelComponent === 'function') {
//       try {
//         return <LabelComponent {...(c.params ?? {})} />;
//       } catch {
//         // безопасный фолбэк
//         return c.config?.meta?.title ?? c.path;
//       }
//     }
//     return c.config?.meta?.title ?? c.path;
//   };

//   const recalc = () => {
//     const total = crumbs.length;
//     const middle = Math.max(0, total - 2);
//     const container = containerRef.current;
//     const list = listRef.current;
//     if (!container || !list) return;

//     let hide = Math.min(hiddenCountRef.current, middle);

//     const cw = container.clientWidth;
//     const sw = list.scrollWidth;

//     // 1) Прячем/возвращаем средние по одному
//     if (sw > cw && hide < middle) {
//       hide += 1;
//       hiddenCountRef.current = hide;
//       setHiddenCount(hide);
//       return;
//     }

//     if (cw - sw > HYSTERESIS && hide > 0) {
//       hide -= 1;
//       hiddenCountRef.current = hide;
//       setHiddenCount(hide);
//       return;
//     }

//     // 2) Если все средние уже спрятаны, а места всё еще нет — схлопываем "Главная + первая"
//     const needCollapseLeading = sw > cw && hide === middle;
//     if (needCollapseLeading && !collapseLeadingRef.current) {
//       collapseLeadingRef.current = true;
//       setCollapseLeading(true);
//       return;
//     }

//     // 3) Если появилось место — разворачиваем левую группу
//     if (collapseLeadingRef.current && cw - sw > HYSTERESIS) {
//       collapseLeadingRef.current = false;
//       setCollapseLeading(false);
//       return;
//     }
//   };

//   useLayoutEffect(() => {
//     // При смене пути пересчитываем с нуля
//     hiddenCountRef.current = 0;
//     collapseLeadingRef.current = false;
//     setHiddenCount(0);
//     setCollapseLeading(false);
//     recalc();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [crumbs.length]);

//   // Доп. пересчёт на следующий кадр
//   useLayoutEffect(() => {
//     let raf = 0;
//     raf = requestAnimationFrame(() => recalc());
//     return () => cancelAnimationFrame(raf);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [hiddenCount, collapseLeading]);

//   useEffect(() => {
//     let raf = 0;
//     const schedule = () => {
//       if (raf) return;
//       raf = requestAnimationFrame(() => {
//         raf = 0;
//         recalc();
//       });
//     };
//     const observer = new ResizeObserver(() => schedule());
//     if (containerRef.current) observer.observe(containerRef.current);
//     return () => {
//       if (raf) cancelAnimationFrame(raf);
//       observer.disconnect();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <header
//       className={`flex items-center w-full relative border-b h-[33px] overflow-hidden app-shell__header select-none transition-all ease-in-out duration-300`}
//     >
//       <div className="flex items-start justify-between w-full">
//         <div className="flex items-center gap-2 [-webkit-app-region:no-drag]">
//           <SidebarTrigger />
//           <span
//             ref={containerRef}
//             className="block min-w-0 text-sm text-foreground/70 overflow-hidden max-w-[50vw] sm:max-w-[60vw] md:max-w-[70vw] lg:max-w-[75vw]"
//           >
//             <Breadcrumb>
//               <BreadcrumbList
//                 ref={listRef}
//                 className="flex-nowrap whitespace-nowrap"
//               >
//                 {(() => {
//                   const total = crumbs.length;
//                   if (total === 0) return null;

//                   if (location.pathname === '/') {
//                     return (
//                       <BreadcrumbItem className="whitespace-nowrap">
//                         <BreadcrumbPage>Главная</BreadcrumbPage>
//                       </BreadcrumbItem>
//                     );
//                   }

//                   if (total === 1) {
//                     const only = crumbs[0];
//                     return (
//                       <>
//                         <BreadcrumbItem className="whitespace-nowrap">
//                           <BreadcrumbLink asChild className="whitespace-nowrap">
//                             <Link to={PATHS.home}>Главная</Link>
//                           </BreadcrumbLink>
//                         </BreadcrumbItem>
//                         <BreadcrumbSeparator />
//                         <BreadcrumbItem className="whitespace-nowrap">
//                           <BreadcrumbPage>{renderLabel(only)}</BreadcrumbPage>
//                         </BreadcrumbItem>
//                       </>
//                     );
//                   }

//                   const first = crumbs[0];
//                   const last = crumbs[total - 1];
//                   const middleAll = total > 2 ? crumbs.slice(1, total - 1) : [];

//                   const pinned = middleAll.length > 0 ? [middleAll[0]] : [];
//                   const rest = middleAll.length > 1 ? middleAll.slice(1) : [];

//                   const hide = Math.min(hiddenCount, Math.max(0, rest.length));
//                   const hidden = rest.slice(0, hide);
//                   const visible = [...pinned, ...rest.slice(hide)];

//                   const LeadingCollapsedMenu = () => (
//                     <BreadcrumbItem className="whitespace-nowrap">
//                       <DropdownMenu>
//                         <DropdownMenuTrigger className="flex items-center gap-1 whitespace-nowrap">
//                           <BreadcrumbEllipsis className="size-4" />
//                           <span className="sr-only">Toggle menu</span>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="start">
//                           <DropdownMenuItem asChild>
//                             <Link to="/">Главная</Link>
//                           </DropdownMenuItem>
//                           <DropdownMenuItem asChild>
//                             <Link to={first.path}>{renderLabel(first)}</Link>
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </BreadcrumbItem>
//                   );

//                   return (
//                     <>
//                       {collapseLeading ? (
//                         <LeadingCollapsedMenu />
//                       ) : (
//                         <>
//                           <BreadcrumbItem className="whitespace-nowrap">
//                             <BreadcrumbLink
//                               asChild
//                               className="whitespace-nowrap"
//                             >
//                               <Link to="/">Главная</Link>
//                             </BreadcrumbLink>
//                           </BreadcrumbItem>
//                           <BreadcrumbSeparator />
//                           <BreadcrumbItem className="whitespace-nowrap">
//                             <BreadcrumbLink
//                               asChild
//                               className="whitespace-nowrap"
//                             >
//                               <Link to={first.path}>{renderLabel(first)}</Link>
//                             </BreadcrumbLink>
//                           </BreadcrumbItem>
//                         </>
//                       )}

//                       {visible.map((c) => (
//                         <Fragment key={c.path}>
//                           <BreadcrumbSeparator />
//                           <BreadcrumbItem className="whitespace-nowrap">
//                             <BreadcrumbLink
//                               asChild
//                               className="whitespace-nowrap"
//                             >
//                               <Link to={generatePath(c.path, c.params ?? {})}>
//                                 {renderLabel(c)}
//                               </Link>
//                             </BreadcrumbLink>
//                           </BreadcrumbItem>
//                         </Fragment>
//                       ))}

//                       {hidden.length > 0 && (
//                         <>
//                           <BreadcrumbSeparator />
//                           <BreadcrumbItem className="whitespace-nowrap">
//                             <DropdownMenu>
//                               <DropdownMenuTrigger className="flex items-center gap-1 whitespace-nowrap">
//                                 <BreadcrumbEllipsis className="size-4" />
//                                 <span className="sr-only">Toggle menu</span>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent align="start">
//                                 {hidden.map((c) => (
//                                   <DropdownMenuItem key={c.path} asChild>
//                                     <Link
//                                       to={generatePath(c.path, c.params ?? {})}
//                                     >
//                                       {renderLabel(c)}
//                                     </Link>
//                                   </DropdownMenuItem>
//                                 ))}
//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           </BreadcrumbItem>
//                         </>
//                       )}

//                       <BreadcrumbSeparator />
//                       <BreadcrumbItem className="whitespace-nowrap">
//                         <BreadcrumbPage>{renderLabel(last)}</BreadcrumbPage>
//                       </BreadcrumbItem>
//                     </>
//                   );
//                 })()}
//               </BreadcrumbList>
//             </Breadcrumb>
//           </span>
//         </div>
//       </div>
//       {(((buttons && buttons.length > 0) ||
//         (dropdown && dropdown.length > 0)) && (
//         <div className="flex items-center gap-0.5 pr-1 ml-auto [-webkit-app-region:no-drag]">
//           {isMobileView ? (
//             <DropdownMenu key="dropdown-menu">
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className={`${btnBase} px-2 h-6 rounded-tr-[13px] transition-all duration-300`}
//                 >
//                   <Ellipsis />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent
//                 align="end"
//                 className="transition-all duration-300 ease-in-out min-w-44"
//               >
//                 {buttons.map((item) => {
//                   if ((item as ButtonHeaderClickable).onClick) {
//                     return (
//                       <DropdownMenuItem
//                         key={item.id}
//                         onClick={(e) => {
//                           e.preventDefault();
//                           (item as ButtonHeaderClickable).onClick();
//                         }}
//                       >
//                         {item.icon && <item.icon />}
//                         {item.label}
//                       </DropdownMenuItem>
//                     );
//                   } else if ((item as ButtonHeaderComponent).component) {
//                     const Component = (item as ButtonHeaderComponent).component;
//                     return (
//                       <DropdownMenuItem key={item.id}>
//                         <Component />
//                       </DropdownMenuItem>
//                     );
//                   }
//                 })}
//                 {renderDropdownItems(dropdown)}
//               </DropdownMenuContent>
//             </DropdownMenu>
//           ) : (
//             <>
//               {buttons.map((item, i) => {
//                 if ((item as ButtonHeaderClickable).onClick) {
//                   return (
//                     <Button
//                       key={item.id}
//                       variant="ghost"
//                       size="sm"
//                       className={cn(
//                         `${btnBase} px-2 h-6 text-xs transition-all ease-in-out duration-300`,
//                         !(dropdown.length > 0) &&
//                           i === buttons.length - 1 &&
//                           'rounded-tr-[13px]'
//                       )}
//                       style={{ fontSize: 11.5 }}
//                       onClick={(item as ButtonHeaderClickable).onClick}
//                     >
//                       {item.icon && (
//                         <item.icon className="!size-[14px] overflow-hidden" />
//                       )}
//                       {item.label}
//                     </Button>
//                   );
//                 } else if ((item as ButtonHeaderComponent).component) {
//                   const Component = (item as ButtonHeaderComponent).component;
//                   return (
//                     <Component
//                       key={item.id}
//                       className={cn(
//                         `${btnBase} px-2 h-6 text-xs transition-all ease-in-out duration-300`,
//                         !(dropdown.length > 0) &&
//                           i === buttons.length - 1 &&
//                           'rounded-tr-[13px]'
//                       )}
//                     />
//                   );
//                 }
//               })}
//               {dropdown.length > 0 && (
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className={`${btnBase} px-2 h-6 rounded-tr-[13px] transition-all duration-300`}
//                     >
//                       <Ellipsis />
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent
//                     align="end"
//                     className="transition-all duration-300 ease-in-out min-w-44"
//                   >
//                     {renderDropdownItems(dropdown)}
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               )}
//             </>
//           )}
//         </div>
//       )) ||
//         null}
//     </header>
//   );
// }

// export default memo(HeaderBar);
