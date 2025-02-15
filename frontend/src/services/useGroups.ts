import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRequest, postRequest, putRequest, deleteRequest } from './requests';
import type { Group, CreateGroupDto, UpdateGroupDto } from './types';

const QUERY_KEY = 'groups';

// API Functions
const getGroupsByPlanId = async (planId: number) => {
  return getRequest<Group[]>(`/groups/plan/${planId}`);
};

const getGroupById = async (id: number) => {
  return getRequest<Group>(`/groups/${id}`);
};

const createGroup = async (newGroup: CreateGroupDto) => {
  return postRequest<Group>('/groups', newGroup);
};

const updateGroup = async ({ id, ...data }: UpdateGroupDto & { id: number }) => {
  return putRequest<Group>(`/groups/${id}`, data);
};

const deleteGroup = async (id: number) => {
  return deleteRequest<void>(`/groups/${id}`);
};

const assignGroupToInterval = async (groupId: number, intervalId: number) => {
  return postRequest<void>(`/groups/${groupId}/intervals/${intervalId}`, {});
};

const removeGroupFromInterval = async (groupId: number, intervalId: number) => {
  return deleteRequest<void>(`/groups/${groupId}/intervals/${intervalId}`);
};

// React Query Hooks
export const useGroupsByPlanId = (planId: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'plan', planId],
    queryFn: () => getGroupsByPlanId(planId),
  });
};

export const useGroupById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getGroupById(id),
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateGroup,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useAssignGroupToInterval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, intervalId }: { groupId: number; intervalId: number }) =>
      assignGroupToInterval(groupId, intervalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useRemoveGroupFromInterval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, intervalId }: { groupId: number; intervalId: number }) =>
      removeGroupFromInterval(groupId, intervalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
