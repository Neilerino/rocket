import { useCreatePlan, IPostPlan } from '@/services/usePlans';
import { useNavigate } from '@tanstack/react-router';

import { ROUTES } from '@/routing/routeConstants';

export const useHandlePlanCreation = () => {
  const navigate = useNavigate({ from: ROUTES.PLANNING.path });
  const createPlan = useCreatePlan();

  return async (newPlan: IPostPlan) => {
    const plan = await createPlan.mutateAsync(newPlan);
    await navigate({
      to: `${ROUTES.PLANNING.path}${ROUTES.PLANNING.children.EDIT_PLAN.path}`,
      params: { planId: plan.id },
    });
  };
};
