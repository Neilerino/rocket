import { Outlet } from '@tanstack/react-router';
import SidebarContainer from './shared/sidebar/sidebarContainer';

export function RootComponent() {
  return (
    <SidebarContainer>
      <Outlet />
    </SidebarContainer>
  );
}
