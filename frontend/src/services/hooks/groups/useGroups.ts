import { useQuery } from '@tanstack/react-query';
import { GroupService } from '../../api/groups';
import { isApiError } from '../../api/errorHandler';
import { Group } from '../../types';

const QUERY_KEY = 'groups';

export const useGroupsByPlanId = (planId: number, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'plan', planId],
    queryFn: async () => {
      const response = await GroupService.getGroupsByPlanId(planId);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as Group[];
    },
    enabled: !!planId,
    ...options
  });
};

export const useGroupById = (id: number, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await GroupService.getGroupById(id);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as Group;
    },
    enabled: !!id,
    ...options
  });
};
