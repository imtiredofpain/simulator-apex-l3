import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@shared/components/ui/sidebar';
import type { SidebarSimpleItem } from '@shared/navigation/types';
import { Link } from 'react-router-dom';

function NavBar({
  isOpen,
  routes,
}: {
  isOpen: boolean;
  routes: readonly SidebarSimpleItem[];
}) {
  return routes.map((route) => (
    <SidebarMenu key={route.title}>
      <SidebarMenuItem
        key={route.to}
        className={isOpen ? '' : 'flex justify-center'}
      >
        <SidebarMenuButton tooltip={route.title} asChild size={'md'}>
          <Link to={route.to}>
            {route.icon && <route.icon className="w-5.5! h-5.5!" />}
            {isOpen && <span>{route.title}</span>}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  ));
}

export default NavBar;
