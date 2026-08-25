import { Button } from '@shared/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@shared/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/ui/popover';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuItem,
  sidebarMenuButtonVariants,
} from '@shared/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/components/ui/tooltip';
import type { SidebarGroupItem } from '@shared/navigation/types';
import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function NavCollapsible({
  isOpen,
  routes,
}: {
  isOpen: boolean;
  routes: readonly SidebarGroupItem[];
}) {
  const location = useLocation();
  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return routes.map((route) => {
    const isRouteActive = route.children.some((child) => isPathActive(child.to));

    return (
    <SidebarMenu key={route.title}>
      <Collapsible
        key={route.title + route.order}
        asChild
        defaultOpen={isRouteActive}
        className="group/collapsible"
      >
        <SidebarMenuItem className={isOpen ? "" : "flex justify-center"}>
          {isOpen && (
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={route.title}
                size="md"
                isActive={isRouteActive}
                className="h-11 rounded-xl px-3 text-sidebar-foreground/65 hover:text-white data-[active=true]:bg-sidebar-accent data-[active=true]:text-white data-[active=true]:shadow-[inset_3px_0_0_var(--sidebar-primary)]"
              >
                {route.icon && <route.icon className="w-5.5! h-5.5!" />}
                {isOpen && <span>{route.title}</span>}
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
          )}
          {!isOpen && (
            <Popover>
              <Tooltip>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={sidebarMenuButtonVariants({
                        size: "md",
                        variant: "default",
                      })}
                      size="icon"
                    >
                      {route.icon && <route.icon className="w-5.5! h-5.5!" />}
                      {isOpen && <span>{route.title}</span>}
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent side="right">
                  <p>{route.title}</p>
                </TooltipContent>
                <PopoverContent
                  sideOffset={16}
                  align="start"
                  side={"right"}
                  className="py-2! px-3! rounded-md"
                >
                  <div className="text-[15px]! font-medium">{route.title}</div>
                  <SidebarMenuSub className="ml-0 mt-1 -mr-3">
                    {route.children.map((child) => (
                      <SidebarMenuSubItem key={child.to}>
                        <SidebarMenuSubButton
                          asChild
                          size="md"
                          isActive={isPathActive(child.to)}
                        >
                          <Link to={child.to}>{child.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </PopoverContent>
              </Tooltip>
            </Popover>
          )}

          <CollapsibleContent>
            {route.children.map((child) => (
              <SidebarMenuSub key={child.to}>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    size="md"
                    isActive={isPathActive(child.to)}
                    className="h-9 rounded-lg text-sidebar-foreground/55 data-[active=true]:bg-sidebar-accent data-[active=true]:text-white"
                  >
                    <Link to={child.to}>{child.title}</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            ))}
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
    );
  });
}
