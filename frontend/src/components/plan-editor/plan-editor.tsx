import { useState } from 'react';
import IntervalEditor from './interval-editor';
import GroupSidebar from './group-sidebar';
import { Interval, Group, Exercise, ExercisePrescription, ParameterType } from './types';
import { sampleExercises, sampleParameterTypes, generateSamplePlanData } from './sample-data';

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
    console.log("handleSelectGroup called with:", { group });
    
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
      const intervalForNewGroup = plan.intervals.find(interval => 
        interval.groups.some(g => g._isAddingNewGroup === true)
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
                groups: [...interval.groups.map(g => ({ ...g, _isAddingNewGroup: undefined })), newGroup]
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
    console.log("Updating group:", updatedGroup);
    setPlan((prev) => ({
      ...prev,
      intervals: prev.intervals.map((interval) => ({
        ...interval,
        groups: interval.groups.map((group) =>
          group.id === updatedGroup.id ? updatedGroup : group
        ),
      })),
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
          />
        ))}
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
    </div>
  );
}
