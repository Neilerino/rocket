import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from 'shad/components/ui/sidebar';
import { useSidebarItems } from '@/components/shared/sidebar/useSidebar';
import { Link } from '@tanstack/react-router';

const AppSideBar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { mainMenuItems, footerMenuItems } = useSidebarItems();

  return (
    <Sidebar collapsible="icon" {...props} className="bg-background">
      <SidebarContent>
        <SidebarGroup key="SidebarMain">
          <SidebarMenu>
            {mainMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
                  className="rounded-full hover:bg-accent hover:text-accent-foreground px-3"
                >
                  <Link to={item.url} className="flex items-center gap-3">
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span className="text-sm">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarContent>
          <SidebarGroup key="SidebarFooter">
            <SidebarMenu>
              {footerMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className="rounded-full hover:bg-accent hover:text-accent-foreground px-3"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSideBar;
