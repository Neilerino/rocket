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
  SidebarRail,
} from 'shad/components/ui/sidebar';
import { useSidebarItems } from '@/components/shared/sidebar/useSidebar';
import { Link } from '@tanstack/react-router';

const AppSideBar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { mainMenuItems, footerMenuItems } = useSidebarItems();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup key="SidebarMain">
          <SidebarMenu>
            {mainMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={item.isActive}>
                  <Link to={item.url}>
                    {item.icon && <item.icon />} {item.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {/* <NavMain items={mainMenuItems} /> */}
      </SidebarContent>
      <SidebarFooter>
        <SidebarContent>
          <SidebarGroup key="SidebarFooter">
            <SidebarMenu>
              {footerMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive}></SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSideBar;
