import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@shared/components/ui/sidebar';
import type { SidebarSimpleItem } from '@shared/navigation/types';
import { Link, useLocation } from 'react-router-dom';

function NavBar({
  isOpen,
  routes,
}: {
  isOpen: boolean;
  routes: readonly SidebarSimpleItem[];
}) {
  const location = useLocation();

  return routes.map((route) => {
    const isActive =
      location.pathname === route.to || location.pathname.startsWith(`${route.to}/`);

    return (
      <SidebarMenu key={route.title}>
      <SidebarMenuItem
        key={route.to}
        className={isOpen ? '' : 'flex justify-center'}
      >
        <SidebarMenuButton
          tooltip={route.title}
          asChild
          size={'md'}
          isActive={isActive}
          className="relative h-11 rounded-xl px-3 text-sidebar-foreground/65 hover:text-white data-[active=true]:bg-sidebar-accent data-[active=true]:text-white data-[active=true]:shadow-[inset_3px_0_0_var(--sidebar-primary)]"
        >
          <Link to={route.to}>
            {route.icon && <route.icon className="w-5.5! h-5.5!" />}
            {isOpen && <span>{route.title}</span>}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
    );
  });
}

export default NavBar;
