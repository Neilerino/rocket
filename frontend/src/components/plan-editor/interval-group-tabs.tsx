import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Exercise, Group } from '@/services/types';
import { useGroups, useUpdateGroup } from '@/services/hooks';
import { GroupFilters } from '@/services/api/groups';
import { Tabs } from '@/components/ui/tabs';
import GroupDropDown from './interval-group-dropdown';

interface IntervalGroupTabsProps {
  intervalId: number;
  onGroupDrawerOpen: () => void;
  onExerciseDrawerOpen: () => void;
  setSelectedExercise: (exercise: Exercise | null) => void;
  setCurrentGroup: (group: Group | null) => void;
  allExercises: Exercise[];
}

const IntervalGroupTabs: React.FC<IntervalGroupTabsProps> = ({
  intervalId,
  onGroupDrawerOpen,
  onExerciseDrawerOpen,
  setSelectedExercise,
  setCurrentGroup,
  allExercises,
}) => {
  const groupContext: GroupFilters = { intervalId: intervalId };
  const { data: groups, isLoading } = useGroups(groupContext);

  const updateGroup = useUpdateGroup({ filters: groupContext });

  const [activeGroup, setActiveGroup] = useState<number | null>(groups?.[0]?.id || null);

  const handleSelectTab = (id: string) => {
    setActiveGroup(Number(id));
  };

  return (
    <>
      {/* Custom Tabs Container */}
      <div className="border-b bg-white">
        {groups && groups.length > 0 && (
          <Tabs
            tabs={groups.map((group) => ({
              id: String(group.id),
              label: <span className="whitespace-nowrap">{group.name}</span>,
            }))}
            activeTabId={String(activeGroup) || ''}
            onTabChange={handleSelectTab}
            onSave={(id: string, name: string) => {
              updateGroup.mutate({ id: Number(id), name });
            }}
            actionButton={
              <button
                className="group h-full w-full px-6 py-2 text-sm text-gray-600 hover:text-gray-800 active:text-gray-900 hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center gap-2 transition-all duration-150 outline-none focus:outline-none hover:shadow-sm"
                onClick={onGroupDrawerOpen}
              >
                <Plus className="w-4 h-4 transform group-hover:scale-110 transition-transform duration-200" />
                <span className="transform group-hover:scale-105 transition-transform duration-200">
                  Add Group
                </span>
              </button>
            }
          />
        )}

        {!isLoading && (!groups || groups.length === 0) && (
          <div className="p-4 text-center">
            <button
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              onClick={onGroupDrawerOpen}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add First Group
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        {groups &&
          groups.map(
            (group) =>
              activeGroup === group.id && (
                <GroupDropDown
                  key={group.id}
                  group={group}
                  allExercises={allExercises}
                  setSelectedExercise={setSelectedExercise}
                  setCurrentGroup={setCurrentGroup}
                  setExerciseDrawerOpen={onExerciseDrawerOpen}
                />
              ),
          )}
      </div>
    </>
  );
};

export default IntervalGroupTabs;
