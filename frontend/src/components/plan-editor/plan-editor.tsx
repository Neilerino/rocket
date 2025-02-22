import { useState } from 'react';
import { Group, Plan } from './types';
import GroupSidebar from './group-sidebar';
import IntervalEditor from './interval-editor';

const initialPlan: Plan = {
  id: 1,
  intervals: [
    {
      id: 1,
      name: 'Week 1',
      groups: [
        {
          id: '1',
          name: 'Power Endurance',
          frequency: '2x',
          exercises: [
            {
              id: '1',
              name: '4x4s on V3-V4',
              sets: 1,
              reps: '4 problems x 4 times',
              rest: '1 min between problems',
              rpe: 8,
            },
          ],
        },
        {
          id: '2',
          name: 'Finger Strength',
          frequency: '1x',
          exercises: [
            {
              id: '2',
              name: 'Hangboard Repeaters',
              sets: 6,
              reps: '7 sec hang / 3 sec rest',
              rest: '3 min between sets',
              rpe: 7,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Week 2',
      groups: [],
    },
  ],
};

const PlanEditor = () => {
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [expandedIntervals, setExpandedIntervals] = useState<number[]>([1]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

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

  const handleSelectGroup = (intervalId: number, group: Group) => {
    if (group.id === 'new') {
      // Create a new group
      const newGroup: Group = {
        id: Date.now().toString(),
        name: '',
        frequency: '',
        exercises: [],
      };
      setSelectedGroup(newGroup);

      // Add it to the interval
      setPlan((prev) => ({
        ...prev,
        intervals: prev.intervals.map((interval) =>
          interval.id === intervalId
            ? { ...interval, groups: [...interval.groups, newGroup] }
            : interval,
        ),
      }));
    } else {
      // Either edit existing group or reuse group from another interval
      setSelectedGroup(group);

      // If the group isn't in this interval yet, add it
      setPlan((prev) => ({
        ...prev,
        intervals: prev.intervals.map((interval) =>
          interval.id === intervalId && !interval.groups.some((g) => g.id === group.id)
            ? { ...interval, groups: [...interval.groups, group] }
            : interval,
        ),
      }));
    }
  };

  const handleUpdateGroup = (updatedGroup: Group) => {
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
            onSelectGroup={(group) => handleSelectGroup(interval.id, group)}
          />
        ))}
      </div>

      {/* Group sidebar */}
      <GroupSidebar
        group={selectedGroup}
        onClose={() => setSelectedGroup(null)}
        allGroups={allGroups}
        onUpdateGroup={handleUpdateGroup}
      />
    </div>
  );
};

export default PlanEditor;
