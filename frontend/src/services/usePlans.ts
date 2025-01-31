import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRequest, postRequest } from '@/services/requests';

const USER_ID = 2;
const QUERY_KEY = 'plans';

export interface IPostPlan {
  name: string;
  description: string;
  userId: number;
  duration: string;
  schedule: string;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  duration?: string;
  schedule?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

const getPlans = async () => {
  return getRequest<Plan[]>(`/plans/${USER_ID}`);
};

const postPlan = async (newPlan: IPostPlan) => {
  return postRequest<Plan>(`/plans/`, newPlan);
};

export const useGetPlans = () => {
  return useQuery({ queryKey: [QUERY_KEY], queryFn: getPlans });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
