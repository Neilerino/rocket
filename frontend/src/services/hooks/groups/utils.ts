import { GroupFilters } from '@/services/api';

export const QUERY_KEY = 'groups';

export const createGroupCacheKey = (args: {
  filters?: GroupFilters;
  planId?: number;
  intervalId?: number;
  id?: number;
}) => {
  const finalFilters: GroupFilters = {
    ...args.filters,
    ...(args.planId !== undefined && { planId: args.planId }),
    ...(args.intervalId !== undefined && { intervalId: args.intervalId }),
    ...(args.id !== undefined && { id: args.id }),
  };

  return [QUERY_KEY, finalFilters];
};
