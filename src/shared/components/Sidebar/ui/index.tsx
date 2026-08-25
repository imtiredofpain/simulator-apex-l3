import { Link } from "react-router-dom";
import platform from "platform";
import {
  Sidebar,
  SidebarContent,
  useSidebar,
  SidebarTrigger,
  SidebarGroup,
} from "@shared/components/ui/sidebar";
import { cn } from "@shared/lib/utils";
import { useMediaQuery } from "@shared/hooks/useMediaQuery";
import { useIsFullscreen } from "@shared/hooks/useIsFullscreen";
import { Separator } from "@shared/components/ui/separator";
import SidebarFooterComp from "./Footer";
import { NavCollapsible } from "./NavCollapsible";
import NavBar from "./NavBar";
import { sidebarMenuConfig } from "@shared/config/sidebarMenu";
import { PATHS } from "@shared/config/pathRoute";
import { NavCollapsibleAsync } from "./NavCollapsibleAsync";

export function AppSidebar() {
  const { open, isMobile, openMobile } = useSidebar();
  const matchesTablet = useMediaQuery("(max-width: 1024px)");
  const isTablet = !isMobile && matchesTablet;
  const isDesktop = !isMobile && !isTablet;
  const showSidebarTrigger =
    (!isDesktop && isTablet && !isMobile && open) ||
    (!isTablet && !open && !isDesktop && !isMobile);

  const family = (platform.os?.family ?? "").toLowerCase();
  const isMac = !!(family.includes("os x") || family.includes("mac"));

  const isFullscreen = useIsFullscreen();
  const needsMacTitlebarInset = isMac && !isFullscreen;

  // Ширины под разные состояния. Базируемся на визуальных требованиях,
  // но оставляем их централизованно в переменных, без магических чисел по коду.
  const COLLAPSED_WIDTH = isMac ? 76 : 72;
  const EXPANDED_WIDTH = 260;

  const OUTER_PADDING = 0;

  // Desktop: open ? expanded : collapsed
  // Tablet: всегда оставляем место под узкий rail (collapsed), а разворот показываем поверх
  // Mobile: вообще не занимаем места в потоке
  const outerWidth = isMobile
    ? 0
    : isTablet
      ? COLLAPSED_WIDTH + OUTER_PADDING
      : open
        ? EXPANDED_WIDTH + OUTER_PADDING
        : COLLAPSED_WIDTH + OUTER_PADDING;

  const contentWidth =
    isMobile || (isTablet && open)
      ? EXPANDED_WIDTH
      : open
        ? EXPANDED_WIDTH
        : COLLAPSED_WIDTH;

  const isOpen = isMobile || (isTablet && open) ? true : open;

  return (
    <div
      className={cn(
        "flex flex-col shrink-0", // не позволяем сжиматься странно
        "h-full",
        // Гарантируем адекватную работу на сверхузких экранах
        "min-w-0 max-w-full",
        "overflow-hidden",
        "z-40",
      )}
      // Точная ширина через инлайн-стиль, чтобы не дёргать Tailwind классами на каждом шаге
      style={{ width: outerWidth }}
    >
      {showSidebarTrigger && (
        <div
          className="fixed top-0 left-0 flex items-center h-8 px-2 z-9999"
          style={{ width: EXPANDED_WIDTH }}
        >
          <div className="h-6 w-16 [-webkit-app-region:drag]" />
          {/* Пустое место слева под светофоры/mac и общий отступ */}
          <SidebarTrigger
            aria-label="Toggle sidebar"
            className="ml-auto [-webkit-app-region:no-drag] \!pointer-events-auto"
          />
        </div>
      )}
      <Sidebar
        collapsible="icon"
        className={cn(
          "border-r border-sidebar-border/70 bg-sidebar",
          (isMobile || (isTablet && open)) && [
            "fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-out",
            (isMobile ? openMobile : open)
              ? "translate-x-0 pointer-events-auto"
              : "-translate-x-full pointer-events-none",
          ],
        )}
      >
        <SidebarContent
          className={cn(
            "h-full overflow-y-auto px-2 pb-3",
            "[&_[data-sidebar=menu]]:gap-1.5",
          )}
          style={{
            width: contentWidth,
          }}
        >
          {needsMacTitlebarInset && <div className="mt-6" />}
          <div
            className={cn(
              "sticky left-0 z-10 flex h-20 items-center border-b border-sidebar-border/60 px-1",
              needsMacTitlebarInset ? "top-8" : "top-0",
              open || openMobile ? "justify-start" : "justify-center",
            )}
          >
            <Link
              to={PATHS.home}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-sidebar-accent/60",
                !(open || openMobile) && "px-1",
              )}
            >
              <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-[0_0_24px_rgba(110,92,255,0.18)]">
                <img src="/apex_icon.svg" alt="Apex L3" className="h-8 w-8" />
                <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-sidebar" />
              </span>
              {(open || openMobile) && (
                <span className="min-w-0">
                  <span className="block text-[15px] font-bold tracking-[0.22em] text-white">
                    APEX
                  </span>
                  <span className="technical-label block text-[9px] text-sidebar-foreground/45">
                    L3 control system
                  </span>
                </span>
              )}
            </Link>
          </div>
          <SidebarGroup className="px-1 py-4">
            {isOpen && (
              <p className="technical-label mb-3 px-3 text-sidebar-foreground/35">
                Рабочее пространство
              </p>
            )}
            <NavBar isOpen={isOpen} routes={sidebarMenuConfig.simple} />
            {sidebarMenuConfig.groups && (
              <NavCollapsible
                isOpen={isOpen}
                routes={sidebarMenuConfig.groups}
              />
            )}
            {sidebarMenuConfig.async && (
              <NavCollapsibleAsync
                isOpen={isOpen}
                routes={sidebarMenuConfig.async}
              />
            )}
          </SidebarGroup>
          <Separator className="mt-auto bg-sidebar-border/60" />
        </SidebarContent>
        <Separator className="my-0 bg-sidebar-border/60" />
        <SidebarFooterComp isOpen={isOpen} />
      </Sidebar>
    </div>
  );
}
