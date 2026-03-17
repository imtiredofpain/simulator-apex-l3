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
import { Link } from 'react-router-dom';

export function NavCollapsible({
  isOpen,
  routes,
}: {
  isOpen: boolean;
  routes: readonly SidebarGroupItem[];
}) {
  return routes.map((route) => (
    <SidebarMenu key={route.title}>
      <Collapsible
        key={route.title + route.order}
        asChild
        defaultOpen={!open}
        className="group/collapsible"
      >
        <SidebarMenuItem className={isOpen ? "" : "flex justify-center"}>
          {isOpen && (
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={route.title} size={"md"}>
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
                        <SidebarMenuSubButton asChild size={"md"}>
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
                  <SidebarMenuSubButton asChild size={"md"}>
                    <Link to={child.to}>{child.title}</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            ))}
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  ));
}
