import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GroupService } from '../../api/groups';
import { isApiError } from '../../api/errorHandler';
import { Group, CreateGroupDto, UpdateGroupDto } from '../../types';

const QUERY_KEY = 'groups';

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (groupData: CreateGroupDto) => {
      const response = await GroupService.createGroup(groupData);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as Group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
};

export const useUpdateGroup = () => {
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
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, updatedGroup.id] });
      const previousGroup = queryClient.getQueryData([QUERY_KEY, updatedGroup.id]);
      
      queryClient.setQueryData([QUERY_KEY, updatedGroup.id], 
        (old: Group | undefined) => old ? { ...old, ...updatedGroup } : undefined);
        
      return { previousGroup };
    },
    onError: (_err, variables, context) => {
      if (context?.previousGroup) {
        queryClient.setQueryData(
          [QUERY_KEY, variables.id],
          context.previousGroup
        );
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    }
  });
};

export const useDeleteGroup = () => {
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.removeQueries({ queryKey: [QUERY_KEY, id] });
    }
  });
};

export const useAssignGroupToInterval = () => {
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['intervals', variables.intervalId] });
    }
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['intervals', variables.intervalId] });
    }
  });
};
