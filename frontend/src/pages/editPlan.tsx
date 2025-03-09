import { Mountain, Timer, CalendarDays } from 'lucide-react';
import { PlanEditor } from '@/components/plan-editor';
import { useParams } from '@tanstack/react-router';
import { ROUTES } from '@/routing/routeConstants';
import { usePlans } from '@/services/hooks';

const EditPlan = () => {
  const { planId } = useParams({
    from: `${ROUTES.PLANNING.path}${ROUTES.PLANNING.children.EDIT_PLAN.path}`,
  });

  const { data: plans } = usePlans({ id: planId });
  const plan = plans && plans.length > 0 ? plans[0] : null;

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-blue-950 text-white w-full shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1),0_2px_4px_-2px_rgb(0,0,0,0.1)] border-b-2 border-gray-800/50">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <Mountain className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">{plan?.name || 'Loading plan...'}</h1>
              <p className="text-white/80">{plan?.description || ''}</p>
            </div>
          </div>
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              <span>{plan?.duration ? `${plan.duration} weeks` : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              <span>{plan?.schedule || ''}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <PlanEditor planId={planId} />
      </div>
    </div>
  );
};

export default EditPlan;
