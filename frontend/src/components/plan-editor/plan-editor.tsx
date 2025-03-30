import { useState } from 'react';
import IntervalEditor from './interval-editor';
import { CreatePlanIntervalDto } from '../../services/types';
import { Button } from '@heroui/button';
import { Plus, Copy } from 'lucide-react';
import ConfirmationModal from '../ui/confirmation-modal';
import { useIntervalsByPlanId } from '../../services/hooks/intervals/useIntervals';
import {
  useCreateInterval,
  useDeleteInterval,
} from '../../services/hooks/intervals/useIntervalMutations';

interface PlanEditorProps {
  planId: number;
}

export default function PlanEditor({ planId }: PlanEditorProps) {
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
  const { mutate: createInterval } = useCreateInterval();
  const { mutate: deleteInterval } = useDeleteInterval(planId);

  const handleCreateNewInterval = () => {
    if (!planId) return;

    const newInterval: CreatePlanIntervalDto = {
      planId: Number(planId),
      name: `Week ${intervals ? intervals?.length + 1 : 1}`,
      description: '',
      duration: '7 days',
      order: intervals?.length ?? 0,
    };

    createInterval(newInterval, {
      onSuccess: (createdInterval) => {
        setExpandedIntervals((prev) => [...prev, createdInterval.id]);
      },
    });
  };

  const handleCopyFromPrevious = () => {
    if (!planId || !intervals || intervals.length === 0) return;

    const lastInterval = intervals[intervals.length - 1];

    const newInterval: CreatePlanIntervalDto = {
      planId: Number(planId),
      name: `Week ${intervals.length + 1}`,
      description: lastInterval.description || '',
      duration: lastInterval.duration,
      order: intervals.length,
    };

    createInterval(newInterval, {
      onSuccess: (createdInterval) => {
        setExpandedIntervals((prev) => [...prev, createdInterval.id]);
      },
    });
  };

  const handleDeleteInterval = (intervalId: number) => {
    const intervalToDelete = intervals?.find((interval) => interval.id === intervalId);

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

  const toggleInterval = (intervalId: number) => {
    setExpandedIntervals((prev) =>
      prev.includes(intervalId) ? prev.filter((id) => id !== intervalId) : [...prev, intervalId],
    );
  };

  return (
    <div className="relative">
      {/* Main content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : intervals && intervals.length > 0 ? (
          intervals.map((interval) => (
            <IntervalEditor
              key={interval.id}
              interval={interval}
              isExpanded={expandedIntervals.includes(Number(interval.id))}
              onToggle={() => toggleInterval(Number(interval.id))}
              onDeleteInterval={handleDeleteInterval}
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
            disabled={!intervals || intervals.length === 0}
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
