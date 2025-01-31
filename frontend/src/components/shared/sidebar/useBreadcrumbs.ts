import { IPage } from '@/routing/routeConstants';

export interface IBreadcrumbItem {
  title: string;
  url: string;
}

export const useBreadcrumbItems = (page: IPage | undefined): IBreadcrumbItem[] => {
  const breadCrumbItems: IBreadcrumbItem[] = [];

  if (page) {
    breadCrumbItems.push({
      title: page.title,
      url: page.path,
    });
  }

  return breadCrumbItems;
};
