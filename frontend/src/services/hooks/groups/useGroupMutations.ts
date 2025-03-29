import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GroupFilters, GroupService } from '../../api/groups';
import { isApiError } from '../../api/errorHandler';
import { Group, CreateGroupDto, UpdateGroupDto } from '../../types';
import { createGroupCacheKey } from './utils';

export const useCreateGroup = ({ filters }: { filters: GroupFilters }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupData: CreateGroupDto) => {
      const response = await GroupService.createGroup(groupData);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as Group;
    },
    onSuccess: async (group) => {
      if (filters.intervalId) {
        const response = await GroupService.assignGroupToInterval(group.id, filters.intervalId);
        if (isApiError(response)) {
          throw response.error;
        }
      }

      queryClient.setQueryData(createGroupCacheKey({ filters }), (old: Group[] | undefined) =>
        old ? [...old, group] : [group],
      );
      return group;
    },
  });
};

export const useUpdateGroup = ({ filters }: { filters: GroupFilters }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateGroupDto & { id: number }) => {
      const response = await GroupService.updateGroup(id, data);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as Group;
    },
    onMutate: async (updatedGroup) => {
      await queryClient.cancelQueries({ queryKey: createGroupCacheKey({ filters }) });
      const previousGroup = queryClient.getQueryData(createGroupCacheKey({ filters }));

      queryClient.setQueryData(createGroupCacheKey({ filters }), (old: Group[] | undefined) =>
        old
          ? old.map((g) => (g.id === updatedGroup.id ? { ...g, ...updatedGroup } : g))
          : undefined,
      );

      return { previousGroup };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousGroup) {
        queryClient.setQueryData(createGroupCacheKey({ filters }), context.previousGroup);
      }
    },
  });
};

export const useDeleteGroup = ({ filters }: { filters: GroupFilters }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await GroupService.deleteGroup(id);
      if (isApiError(response)) {
        throw response.error;
      }
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(createGroupCacheKey({ filters }), (old: Group[] | undefined) =>
        old ? old.filter((g) => g.id !== id) : undefined,
      );
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: createGroupCacheKey({ filters }) });
    },
  });
};

export const useAssignGroupToInterval = (filters: GroupFilters = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, intervalId }: { groupId: number; intervalId: number }) => {
      const response = await GroupService.assignGroupToInterval(groupId, intervalId);
      if (isApiError(response)) {
        throw response.error;
      }
      return { groupId, intervalId };
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(createGroupCacheKey({ filters }), (old: Group[] | undefined) =>
        old ? [...old, { id: variables.groupId }] : [{ id: variables.groupId }],
      );
    },
  });
};

export const useRemoveGroupFromInterval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, intervalId }: { groupId: number; intervalId: number }) => {
      const response = await GroupService.removeGroupFromInterval(groupId, intervalId);
      if (isApiError(response)) {
        throw response.error;
      }
      return { groupId, intervalId };
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(
        createGroupCacheKey({ filters: { intervalId: variables.intervalId } }),
        (old: Group[] | undefined) =>
          old ? old.filter((g) => g.id !== variables.groupId) : undefined,
      );
    },
  });
};
