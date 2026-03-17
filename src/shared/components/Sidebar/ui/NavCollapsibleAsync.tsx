import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@shared/components/ui/collapsible';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@shared/components/ui/sidebar';
import type { SidebarGroupComponentItem } from '@shared/navigation/types';
import { ChevronRight } from 'lucide-react';
import NavBar from './NavBar';

export function NavCollapsibleAsync({
  isOpen,
  routes,
}: {
  isOpen: boolean;
  routes: readonly SidebarGroupComponentItem[];
}) {
  return routes.map((route) => {
    const Component = route.component;
    return (
      <SidebarMenu key={route.title}>
        <Collapsible
          key={route.title + route.order}
          asChild
          defaultOpen={!open}
          className="group/collapsible"
        >
          <SidebarMenuItem className={isOpen ? "" : "flex justify-center"}>
            {!isOpen && <NavBar isOpen={isOpen} routes={[
              { title: route.title, to: route.to, icon: route.icon }
            ]} />}
            {isOpen && <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={route.title} size={"md"}>
                {route.icon && <route.icon className="w-5.5! h-5.5!" />}
                {isOpen && <span>{route.title}</span>}
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>}
            <CollapsibleContent>
              <Component isOpen={isOpen} />
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    );
  });
}
