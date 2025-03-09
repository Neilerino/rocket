import { useState, useEffect } from 'react';
import IntervalEditor from './interval-editor';
import GroupSidebar from './group-sidebar';
import { Group, ParameterType, PlanInterval as LocalPlanInterval } from './types';
import { CreatePlanIntervalDto } from '../../services/types';
import { sampleExercises, sampleParameterTypes } from './sample-data';
import { Button } from '@heroui/button';
import { Plus, Copy } from 'lucide-react';
import ConfirmationModal from '../ui/confirmation-modal';
import { useIntervalsByPlanId } from '../../services/hooks/intervals/useIntervals';
import {
  useCreateInterval,
  useDeleteInterval,
} from '../../services/hooks/intervals/useIntervalMutations';

interface PlanEditorProps {
  planId?: string;
}

export default function PlanEditor({ planId }: PlanEditorProps) {
  // State for local UI operations
  const [localIntervals, setLocalIntervals] = useState<LocalPlanInterval[]>([]);

  // API hooks
  const { data: intervals, isLoading } = useIntervalsByPlanId(Number(planId));
  const { mutate: createInterval } = useCreateInterval();
  const { mutate: deleteInterval } = useDeleteInterval();

  // Update local intervals when API data changes
  useEffect(() => {
    if (intervals) {
      // Convert API intervals to local format
      const convertedIntervals: LocalPlanInterval[] = intervals.map((apiInterval) => ({
        id: apiInterval.id.toString(),
        planId: apiInterval.planId.toString(),
        name: apiInterval.name,
        description: apiInterval.description || '',
        duration: apiInterval.duration.toString(),
        order: apiInterval.order,
        groups: [], // We'll need to implement group fetching separately
      }));
      setLocalIntervals(convertedIntervals);
    }
  }, [intervals]);

  // State for open/closed intervals
  const [expandedIntervals, setExpandedIntervals] = useState<number[]>([0]); // Start with first interval expanded

  // State for sidebar (only for the GroupSidebar now)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Parameter types for exercise customization
  const parameterTypes: ParameterType[] = sampleParameterTypes;

  // State for confirmation modal
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

  // Function to handle selecting a group for editing
  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
  };

  const toggleInterval = (intervalId: number) => {
    setExpandedIntervals((prev) =>
      prev.includes(intervalId) ? prev.filter((id) => id !== intervalId) : [...prev, intervalId],
    );
  };

  const handleUpdateGroup = (updatedGroup: Group) => {
    console.log('Updating group:', updatedGroup);
    setLocalIntervals((prevIntervals) =>
      prevIntervals.map((interval) => ({
        ...interval,
        groups: interval.groups.map((group) =>
          group.id === updatedGroup.id ? updatedGroup : group,
        ),
      })),
    );
  };

  // Function to create a new empty interval
  const handleCreateNewInterval = () => {
    if (!planId) return;

    const newInterval: CreatePlanIntervalDto = {
      planId: Number(planId),
      name: `Week ${intervals?.length ? intervals.length + 1 : 1}`,
      description: '',
      duration: '7 days', // Default duration of 7 days
      order: intervals?.length ? intervals.length : 0,
    };

    createInterval(newInterval, {
      onSuccess: (createdInterval) => {
        // Auto-expand the new interval
        setExpandedIntervals((prev) => [...prev, createdInterval.id]);
      },
    });
  };

  // Function to copy the last interval
  const handleCopyFromPrevious = () => {
    if (!planId || !intervals || intervals.length === 0) return;

    const lastInterval = intervals[intervals.length - 1];

    // Create a new interval based on the last one
    const newInterval: CreatePlanIntervalDto = {
      planId: Number(planId),
      name: `Week ${intervals.length + 1}`,
      description: lastInterval.description || '',
      duration: lastInterval.duration,
      order: intervals.length,
    };

    createInterval(newInterval, {
      onSuccess: (createdInterval) => {
        // Auto-expand the new interval
        setExpandedIntervals((prev) => [...prev, createdInterval.id]);
      },
    });
  };

  // Function to open delete interval confirmation
  const handleDeleteInterval = (intervalId: number) => {
    // Find the interval to get its name
    const intervalToDelete = localIntervals.find((interval) => Number(interval.id) === intervalId);
    if (!intervalToDelete) return;

    // If the interval has no groups, delete it without confirmation
    if (intervalToDelete.groups.length === 0) {
      // Call the delete API
      deleteInterval(intervalId, {
        onSuccess: () => {
          // Remove from expanded intervals if it was expanded
          setExpandedIntervals((prev) => prev.filter((id) => id !== intervalId));
        },
      });
      return;
    }

    // Open confirmation modal for intervals with groups
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Interval',
      message: `Are you sure you want to delete "${intervalToDelete.name}"? This action cannot be undone.`,
      onConfirm: () => {
        // Call the delete API
        deleteInterval(intervalId, {
          onSuccess: () => {
            // Remove from expanded intervals if it was expanded
            setExpandedIntervals((prev) => prev.filter((id) => id !== intervalId));
          },
        });
      },
    });
  };

  // Function to close the confirmation modal
  const closeConfirmationModal = () => {
    setConfirmationModal((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  // Function to update an interval
  const handleUpdateInterval = (updatedInterval: LocalPlanInterval) => {
    setLocalIntervals((prevIntervals) =>
      prevIntervals.map((interval) =>
        interval.id === updatedInterval.id ? updatedInterval : interval,
      ),
    );
  };

  return (
    <div className="relative">
      {/* Main content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-6 text-center">Loading intervals...</div>
        ) : localIntervals.length > 0 ? (
          localIntervals.map((interval) => (
            <IntervalEditor
              key={interval.id}
              interval={interval}
              isExpanded={expandedIntervals.includes(Number(interval.id))}
              onToggle={() => toggleInterval(Number(interval.id))}
              onSelectGroup={handleSelectGroup}
              parameterTypes={parameterTypes}
              allExercises={sampleExercises}
              onUpdateGroup={handleUpdateGroup}
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
            disabled={!intervals || intervals.length === 0}
            disableAnimation
          >
            <Copy size={18} />
            <span>Copy From Previous</span>
          </Button>
        </div>
      </div>

      {/* Group sidebar */}
      {selectedGroup && (
        <GroupSidebar
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onUpdateGroup={handleUpdateGroup}
          isOpen={selectedGroup !== null}
        />
      )}

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
