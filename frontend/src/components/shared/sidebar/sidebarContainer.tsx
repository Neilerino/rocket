import AppSidebar from '@/components/shared/sidebar/appSidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from 'shad/components/ui/breadcrumb';
import { Separator } from 'shad/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from 'shad/components/ui/sidebar';
import { useActivePage } from './useSidebar';
import { ReactNode } from 'react';
import SidebarBreadcrumbs from './sidebarBreadcrumbs';

const SidebarContainer = ({ children }: { children: ReactNode }) => {
  const activePage = useActivePage();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <SidebarBreadcrumbs activePage={activePage} />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SidebarContainer;
