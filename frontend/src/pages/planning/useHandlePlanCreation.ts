import { useCreatePlan } from '@/services/hooks';
import { CreatePlanDto } from '@/services/types';
import { useNavigate } from '@tanstack/react-router';

import { ROUTES } from '@/routing/routeConstants';

export const useHandlePlanCreation = () => {
  const navigate = useNavigate({ from: ROUTES.PLANNING.path });
  const createPlan = useCreatePlan();

  return async (newPlan: CreatePlanDto) => {
    const plan = await createPlan.mutateAsync(newPlan);
    await navigate({
      to: `${ROUTES.PLANNING.path}${ROUTES.PLANNING.children.EDIT_PLAN.path}`,
      params: { planId: plan.id },
    });
  };
};
