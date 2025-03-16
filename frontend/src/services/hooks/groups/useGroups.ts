import { useQuery } from '@tanstack/react-query';
import { GroupFilters, GroupService } from '../../api/groups';
import { isApiError } from '../../api/errorHandler';
import { Group } from '../../types';
import { createGroupCacheKey } from './utils';

/**
 * Hook to fetch groups with flexible filtering
 * @param filters Filter criteria (planId, id, etc.)
 * @param options Additional react-query options
 */
export const useGroups = (filters: GroupFilters = {}, options = {}) => {
  return useQuery({
    queryKey: createGroupCacheKey({ filters }),
    queryFn: async () => {
      const response = await GroupService.getGroups(filters);
      if (isApiError(response)) {
        throw response.error;
      }
      const cacheValue = response.data || ([] as Group[]);
      return cacheValue;
    },
    ...options,
  });
};
