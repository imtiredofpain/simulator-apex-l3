import { Link } from 'react-router-dom';
import platform from 'platform';
import {
  Sidebar,
  SidebarContent,
  useSidebar,
  SidebarTrigger,
  SidebarGroup,
} from '@shared/components/ui/sidebar';
import { cn } from '@shared/lib/utils';
import { useMediaQuery } from '@shared/hooks/useMediaQuery';
import { useIsFullscreen } from '@shared/hooks/useIsFullscreen';
import { SuperellipseIcon } from '@mrdn/app-common';
import { Separator } from '@shared/components/ui/separator';
import { LinearBlur } from '@shared/components/LinearBlur';
import { useTheme } from '@features/Settings/providers/theme';
import SidebarFooterComp from './Footer';
import ME_Icon from '@assets/logos/ME_logo_icon.svg';
import ME_Text from '@assets/logos/ME_logo_text.svg';
import { NavCollapsible } from './NavCollapsible';
import NavBar from './NavBar';
import { sidebarMenuConfig } from '@shared/config/sidebarMenu';
import { PATHS } from '@shared/config/pathRoute';
import { NavCollapsibleAsync } from './NavCollapsibleAsync';

export function AppSidebar() {
  const { open, isMobile, openMobile } = useSidebar();
  const matchesTablet = useMediaQuery('(max-width: 1024px)');
  const isTablet = !isMobile && matchesTablet;
  const { theme } = useTheme();

  const isDesktop = !isMobile && !isTablet;
  const showSidebarTrigger =
    (!isDesktop && isTablet && !isMobile && open) ||
    (!isTablet && !open && !isDesktop && !isMobile);

  const family = (platform.os?.family ?? '').toLowerCase();
  const isMac = !!(family.includes('os x') || family.includes('mac'));
  const isWindows = family.includes('windows');

  const isFullscreen = useIsFullscreen();
  const needsMacTitlebarInset = isMac && !isFullscreen;

  // Ширины под разные состояния. Базируемся на визуальных требованиях,
  // но оставляем их централизованно в переменных, без магических чисел по коду.
  const COLLAPSED_WIDTH = isMac ? 76 : isWindows ? 74 : 56; // под светофоры mac чуть шире
  const EXPANDED_WIDTH = 280; // стандартная ширина развёрнутого меню

  const OUTER_PADDING = isWindows ? 12 : 0;

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
        'flex flex-col shrink-0', // не позволяем сжиматься странно
        'h-full',
        // Гарантируем адекватную работу на сверхузких экранах
        'min-w-0 max-w-full',
        'overflow-hidden',
        'z-40'
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
          (isMobile || (isTablet && open)) && [
            'fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-out',
            (isMobile ? openMobile : open)
              ? 'translate-x-0 pointer-events-auto'
              : '-translate-x-full pointer-events-none',
          ]
        )}
      >
        <SidebarContent
          className={cn(
            'h-full overflow-y-auto',
            'pt-1',
            '[&_[data-sidebar=menu]]:gap-1',
            ''
          )}
          style={{
            width: contentWidth,
          }}
        >
          <LinearBlur
            blur={64}
            rotate={180}
            className={cn(
              'absolute top-0 right-0  z-1! w-full',
              needsMacTitlebarInset ? 'h-[100px]!' : 'h-[70px]!'
            )}
            color={
              isOpen ? undefined : theme === 'light' ? '#dde8ff' : '#0b2d56'
            }
          />
          {needsMacTitlebarInset && <div className="mt-6" />}
          <div
            className={cn(
              'flex items-center gap-2 p-2',
              'sticky left-0 z-10',
              needsMacTitlebarInset ? 'top-8' : 'top-0',
              open || openMobile ? 'justify-start pl-3' : 'justify-center'
            )}
          >
            <Link to={PATHS.home}>
              <SuperellipseIcon
                size={40}
                bgClassName="text-white"
                strokeWidth={1}
                strokeColor="var(--border)"
                padding={8}
              >
                <img src={ME_Icon} alt="L3" />
              </SuperellipseIcon>
            </Link>
            {(open || openMobile) && (
              <Link to={PATHS.home}>
                <img src={ME_Text} alt="L3" className="h-7 dark:invert" />
              </Link>
            )}
          </div>
          <SidebarGroup>
            <NavBar isOpen={isOpen} routes={sidebarMenuConfig.simple} />
            {sidebarMenuConfig.groups && <NavCollapsible isOpen={isOpen} routes={sidebarMenuConfig.groups} />}
            {sidebarMenuConfig.async && <NavCollapsibleAsync isOpen={isOpen} routes={sidebarMenuConfig.async} />}
          </SidebarGroup>
          <Separator className="-mb-2" />
        </SidebarContent>
        <Separator className="my-0" />
        <SidebarFooterComp isOpen={isOpen} />
      </Sidebar>
    </div>
  );
}
