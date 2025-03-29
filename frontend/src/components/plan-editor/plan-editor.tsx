import { useState, useEffect } from 'react';
import IntervalEditor from './interval-editor';
import {
  CreatePlanIntervalDto,
  PlanInterval as ServicePlanInterval,
  Group as ServiceGroup,
} from '../../services/types';
import { Button } from '@heroui/button';
import { Plus, Copy } from 'lucide-react';
import ConfirmationModal from '../ui/confirmation-modal';
import { useIntervalsByPlanId } from '../../services/hooks/intervals/useIntervals';
import {
  useCreateInterval,
  useDeleteInterval,
} from '../../services/hooks/intervals/useIntervalMutations';
import { useExercises } from '@/services/hooks/exercises/useExercises';
import { useGroups } from '@/services/hooks/groups/useGroups';

interface PlanEditorProps {
  planId: number;
}

export default function PlanEditor({ planId }: PlanEditorProps) {
  const [intervalsState, setIntervalsState] = useState<ServicePlanInterval[]>([]);
  const [expandedIntervals, setExpandedIntervals] = useState<number[]>([]);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const { data: intervals, isLoading } = useIntervalsByPlanId(planId);
  const { data: allExercises, isLoading: exercisesLoading } = useExercises({});
  const { data: allGroups, isLoading: groupsLoading } = useGroups({});
  const { mutate: createInterval } = useCreateInterval();
  const { mutate: deleteInterval } = useDeleteInterval(planId);

  useEffect(() => {
    if (intervals) {
      setIntervalsState(intervals);
    }
  }, [intervals]);

  useEffect(() => {
    if (intervalsState.length > 0) {
      setExpandedIntervals([intervalsState[0].id]);
    }
  }, [intervalsState]);

  const handleCreateNewInterval = () => {
    if (!planId) return;

    const newInterval: CreatePlanIntervalDto = {
      planId: Number(planId),
      name: `Week ${intervalsState.length + 1}`,
      description: '',
      duration: '7 days',
      order: intervalsState.length,
    };

    createInterval(newInterval, {
      onSuccess: (createdInterval) => {
        setExpandedIntervals((prev) => [...prev, createdInterval.id]);
      },
    });
  };

  const handleCopyFromPrevious = () => {
    if (!planId || !intervalsState || intervalsState.length === 0) return;

    const lastInterval = intervalsState[intervalsState.length - 1];

    const newInterval: CreatePlanIntervalDto = {
      planId: Number(planId),
      name: `Week ${intervalsState.length + 1}`,
      description: lastInterval.description || '',
      duration: lastInterval.duration,
      order: intervalsState.length,
    };

    createInterval(newInterval, {
      onSuccess: (createdInterval) => {
        setExpandedIntervals((prev) => [...prev, createdInterval.id]);
      },
    });
  };

  const handleDeleteInterval = (intervalId: number) => {
    const intervalToDelete = intervalsState.find((interval) => interval.id === intervalId);
    if (!intervalToDelete) return;

    if (intervalToDelete.groupCount === 0) {
      deleteInterval(intervalId, {
        onSuccess: () => {
          setExpandedIntervals((prev) => prev.filter((id) => id !== intervalId));
        },
      });
      return;
    }

    setConfirmationModal({
      isOpen: true,
      title: 'Delete Interval',
      message: `Are you sure you want to delete "${intervalToDelete.name}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteInterval(intervalId, {
          onSuccess: () => {
            setExpandedIntervals((prev) => prev.filter((id) => id !== intervalId));
          },
        });
      },
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleUpdateInterval = (updatedInterval: ServicePlanInterval) => {
    setIntervalsState((prevIntervals) =>
      prevIntervals.map((interval) =>
        interval.id === updatedInterval.id ? updatedInterval : interval,
      ),
    );
  };

  const toggleInterval = (intervalId: number) => {
    setExpandedIntervals((prev) =>
      prev.includes(intervalId) ? prev.filter((id) => id !== intervalId) : [...prev, intervalId],
    );
  };

  return (
    <div className="relative">
      {/* Main content */}
      <div className="space-y-4">
        {isLoading || exercisesLoading || groupsLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : intervalsState.length > 0 ? (
          intervalsState.map((interval) => (
            <IntervalEditor
              key={interval.id}
              interval={interval}
              isExpanded={expandedIntervals.includes(Number(interval.id))}
              onToggle={() => toggleInterval(Number(interval.id))}
              allExercises={allExercises || []}
              allGroups={allGroups || []}
              onDeleteInterval={handleDeleteInterval}
              onUpdateInterval={handleUpdateInterval}
            />
          ))
        ) : (
          <div className="p-6 text-center">
            No intervals found. Create your first interval below.
          </div>
        )}

        {/* Empty state buttons */}
        <div className="flex space-x-3 mt-6">
          <Button
            variant="bordered"
            className="flex-1 py-6 border-dashed border-2 flex items-center justify-center gap-2"
            onPress={handleCreateNewInterval}
            disableAnimation
          >
            <Plus size={18} />
            <span>Create New Interval</span>
          </Button>

          <Button
            variant="bordered"
            className="flex-1 py-6 border-dashed border-2 flex items-center justify-center gap-2"
            onPress={handleCopyFromPrevious}
            disabled={!intervalsState || intervalsState.length === 0}
            disableAnimation
          >
            <Copy size={18} />
            <span>Copy From Previous</span>
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
