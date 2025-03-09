import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'shad/components/ui/card';

import { Button } from 'shad/components/ui/button';
import { ScrollArea } from 'shad/components/ui/scroll-area';
import { Calendar, Clock, Dumbbell, Plus } from 'lucide-react';
import NewPlanModal from '@/pages/planning/newPlanModal';
import { usePlans } from '@/services/hooks';
import { SkeletonCard } from '@/components/ui/skeletonCard';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '@/routing/routeConstants';

const TrainingPlanner = () => {
  const query = usePlans({ filters: { userId: 1 } });
  const [showNewPlanDialog, setShowNewPlanDialog] = useState(false);
  const navigate = useNavigate({ from: ROUTES.PLANNING.path });

  const handleSeeDetails = (planId: number) => {
    navigate({
      to: `${ROUTES.PLANNING.path}${ROUTES.PLANNING.children.EDIT_PLAN.path}`,
      params: { planId },
    });
  };

  const plans = query.data;
  const loading = query.isLoading;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Training Plans</h1>
          <p className="text-gray-600">Manage your climbing training programs</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowNewPlanDialog(true)}>
          <Plus className="w-4 h-4" />
          New Plan
        </Button>
        {showNewPlanDialog && <NewPlanModal setShowNewPlanDialog={setShowNewPlanDialog} />}
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && (
            <>
              <SkeletonCard /> <SkeletonCard /> <SkeletonCard />
            </>
          )}
          {plans &&
            plans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5" />
                    {plan.name}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {plan?.duration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{plan.duration}</span>
                      </div>
                    )}
                    {plan?.schedule && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{plan.schedule}</span>
                      </div>
                    )}
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleSeeDetails(plan.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TrainingPlanner;
