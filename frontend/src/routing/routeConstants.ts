export interface IPage {
  path: string;
  title: string;
  children?: Record<string, IPage>;
  params?: string[];
}

export const ROUTES = {
  HOME: { path: '/', title: 'Home' },
  TRAINING: { path: '/training', title: 'Training' },
  PLANNING: {
    path: '/planning',
    title: 'Planning',
    children: {
      EDIT_PLAN: {
        path: '/$planId',
        title: 'Edit Plan',
        params: ['planId'],
      },
    },
  },
  LOGBOOK: { path: '/logbook', title: 'Logbook' },
  SETTINGS: { path: '/settings', title: 'Settings' },
} as const satisfies Record<string, IPage>;
