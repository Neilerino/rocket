import { useState } from 'react';
import IntervalEditor from './interval-editor';
import GroupSidebar from './group-sidebar';
import { Interval, Group, Exercise, ExercisePrescription, ParameterType } from './types';
import { sampleExercises, sampleParameterTypes, generateSamplePlanData } from './sample-data';
import { Button } from '@heroui/button';
import { Plus, Copy } from 'lucide-react';
import ConfirmationModal from '../ui/confirmation-modal';

interface PlanEditorProps {
  planId?: string;
}

export default function PlanEditor({ planId }: PlanEditorProps) {
  // State for plan data
  const [plan, setPlan] = useState(generateSamplePlanData());

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

  // Get all unique groups across all intervals
  const allGroups = plan.intervals.reduce<Group[]>((acc, interval) => {
    interval.groups.forEach((group) => {
      if (!acc.some((g) => g.id === group.id)) {
        acc.push(group);
      }
    });
    return acc;
  }, []);

  const toggleInterval = (intervalId: number) => {
    setExpandedIntervals((prev) =>
      prev.includes(intervalId) ? prev.filter((id) => id !== intervalId) : [...prev, intervalId],
    );
  };

  const handleSelectGroup = (group: Group) => {
    console.log('handleSelectGroup called with:', { group });

    if (group.id === 'new') {
      // Create a new group
      const newGroup: Group = {
        id: Date.now().toString(),
        name: '',
        frequency: '',
        exercises: [],
      };
      setSelectedGroup(newGroup);

      // Find the interval this group belongs to - look for the clicked "Add Group" button
      // This is a special case for new groups
      // We'll determine which interval we're in based on the groups in that interval
      const intervalForNewGroup = plan.intervals.find((interval) =>
        interval.groups.some((g) => g._isAddingNewGroup === true),
      );

      if (intervalForNewGroup) {
        // Add it to the interval
        setPlan((prev) => ({
          ...prev,
          intervals: prev.intervals.map((interval) => {
            // Clear the flag and add the new group
            if (interval.id === intervalForNewGroup.id) {
              return {
                ...interval,
                groups: [
                  ...interval.groups.map((g) => ({ ...g, _isAddingNewGroup: undefined })),
                  newGroup,
                ],
              };
            }
            return interval;
          }),
        }));
      }
    } else {
      // Just select the group for editing
      setSelectedGroup(group);
    }
  };

  const handleUpdateGroup = (updatedGroup: Group) => {
    console.log('Updating group:', updatedGroup);
    setPlan((prev) => ({
      ...prev,
      intervals: prev.intervals.map((interval) => ({
        ...interval,
        groups: interval.groups.map((group) =>
          group.id === updatedGroup.id ? updatedGroup : group,
        ),
      })),
    }));
  };

  // Function to create a new empty interval
  const handleCreateNewInterval = () => {
    const newIntervalId = Date.now();
    setPlan((prev) => ({
      ...prev,
      intervals: [
        ...prev.intervals,
        {
          id: newIntervalId,
          name: `Interval ${prev.intervals.length + 1}`,
          groups: [],
        },
      ],
    }));

    // Auto-expand the new interval
    setExpandedIntervals((prev) => [...prev, newIntervalId]);
  };

  // Function to copy the last interval
  const handleCopyFromPrevious = () => {
    if (plan.intervals.length === 0) return;

    const lastInterval = plan.intervals[plan.intervals.length - 1];
    const newIntervalId = Date.now();

    // Deep clone the last interval's groups to avoid reference issues
    const clonedGroups = JSON.parse(JSON.stringify(lastInterval.groups));

    setPlan((prev) => ({
      ...prev,
      intervals: [
        ...prev.intervals,
        {
          id: newIntervalId,
          name: `Interval ${prev.intervals.length + 1}`,
          groups: clonedGroups,
        },
      ],
    }));

    // Auto-expand the new interval
    setExpandedIntervals((prev) => [...prev, newIntervalId]);
  };

  // Function to open delete interval confirmation
  const handleDeleteInterval = (intervalId: number) => {
    // Find the interval to get its name
    const intervalToDelete = plan.intervals.find((interval) => interval.id === intervalId);
    if (!intervalToDelete) return;

    // If the interval has no groups, delete it without confirmation
    if (intervalToDelete.groups.length === 0) {
      // Remove the interval from the plan
      setPlan((prev) => ({
        ...prev,
        intervals: prev.intervals.filter((interval) => interval.id !== intervalId),
      }));

      // Remove from expanded intervals if it was expanded
      setExpandedIntervals((prev) => prev.filter((id) => id !== intervalId));
      return;
    }

    // Open confirmation modal for intervals with groups
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Interval',
      message: `Are you sure you want to delete "${intervalToDelete.name}"? This action cannot be undone.`,
      onConfirm: () => {
        // Remove the interval from the plan
        setPlan((prev) => ({
          ...prev,
          intervals: prev.intervals.filter((interval) => interval.id !== intervalId),
        }));

        // Remove from expanded intervals if it was expanded
        setExpandedIntervals((prev) => prev.filter((id) => id !== intervalId));
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

  return (
    <div className="relative">
      {/* Main content */}
      <div className="space-y-4">
        {plan.intervals.map((interval) => (
          <IntervalEditor
            key={interval.id}
            interval={interval}
            allGroups={allGroups}
            isExpanded={expandedIntervals.includes(interval.id)}
            onToggle={() => toggleInterval(interval.id)}
            onSelectGroup={(group) => handleSelectGroup(group)}
            parameterTypes={parameterTypes}
            allExercises={sampleExercises}
            onUpdateGroup={handleUpdateGroup}
            onDeleteInterval={handleDeleteInterval}
          />
        ))}

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
            disabled={plan.intervals.length === 0}
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
          allGroups={allGroups}
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
