import { ROUTES, IPage } from '@/routing/routeConstants';
import { useRouterState } from '@tanstack/react-router';
import { BookOpen, Dumbbell, Home, LucideIcon, LucideSettings, TrendingUp } from 'lucide-react';

export interface SidebarItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

interface SidebarItems {
  mainMenuItems: SidebarItem[];
  footerMenuItems: SidebarItem[];
}

export const useActivePage = (): IPage | undefined => {
  const router = useRouterState();

  return Object.values(ROUTES).find((route) => route.path === router.location.pathname);
};

export const useSidebarItems = (): SidebarItems => {
  const router = useRouterState();

  const mainMenuItems: SidebarItem[] = [
    {
      title: 'Home',
      url: ROUTES.HOME.path,
      icon: Home,
      isActive: router.location.pathname === ROUTES.HOME.path,
    },
    {
      title: 'Training',
      url: ROUTES.TRAINING.path,
      icon: Dumbbell,
      isActive: router.location.pathname === ROUTES.TRAINING.path,
    },
    {
      title: 'Planning (WIP)',
      url: ROUTES.PLANNING.path,
      icon: TrendingUp,
      isActive: router.location.pathname === ROUTES.PLANNING.path,
    },
    {
      title: 'Log Book (WIP)',
      url: ROUTES.LOGBOOK.path,
      icon: BookOpen,
      isActive: router.location.pathname === ROUTES.LOGBOOK.path,
    },
  ];

  const footerMenuItems: SidebarItem[] = [
    {
      title: 'Settings (WIP)',
      url: ROUTES.SETTINGS.path,
      icon: LucideSettings,
      isActive: router.location.pathname === ROUTES.SETTINGS.path,
    },
  ];

  return { mainMenuItems, footerMenuItems };
};
