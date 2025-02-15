import AppSidebar from '@/components/shared/sidebar/appSidebar';
import { SidebarInset, SidebarProvider } from 'shad/components/ui/sidebar';
import { ReactNode } from 'react';
import TopBar from '../topbar/topBar';

const SidebarContainer = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-0 min-w-0">
          <TopBar />
          <div className="flex-1 w-full overflow-x-hidden">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SidebarContainer;
