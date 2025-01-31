import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from 'shad/components/ui/breadcrumb';

import { IPage } from '@/routing/routeConstants';

import { useBreadcrumbItems } from './useBreadcrumbs';

interface SidebarBreadcrumbsProps {
  activePage: IPage | undefined;
}

const SidebarBreadcrumbs: React.FC<SidebarBreadcrumbsProps> = ({ activePage }) => {
  const breadcrumbItems = useBreadcrumbItems(activePage);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.title}>
            <BreadcrumbItem className="hidden md:block">
              {index === breadcrumbItems.length - 1 ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.url}>{item.title}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && (
              <BreadcrumbSeparator className="hidden md:block" />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default SidebarBreadcrumbs;
