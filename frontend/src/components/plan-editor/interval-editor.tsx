import React, { useState } from 'react';
import { Exercise, Group, PlanInterval as Interval, ParameterType } from './types';
import ExerciseSidebar from './exercise-sidebar';
import GroupSidebar from './group-sidebar';
import { AnimatePresence } from 'framer-motion';
import { ChevronRight, Trash2, Edit } from 'lucide-react';
import IntervalEditDialog from './interval-edit-dialog';
import IntervalGroupTabs from './interval-group-tabs';

interface IntervalEditorProps {
  interval: Interval;
  isExpanded: boolean;
  onToggle: () => void;
  parameterTypes: ParameterType[];
  onUpdateGroup: (group: Group) => void;
  onDeleteInterval?: (intervalId: number) => void;
  onUpdateInterval?: (updatedInterval: Interval) => void;
}

const IntervalEditor: React.FC<IntervalEditorProps> = ({
  interval,
  isExpanded,
  onToggle,
  parameterTypes,
  onUpdateGroup,
  onDeleteInterval,
  onUpdateInterval,
}) => {
  const groupContext = { intervalId: interval.id, planId: interval.planId };

  const [exerciseDrawerOpen, setExerciseDrawerOpen] = useState(false);
  const [groupDrawerOpen, setGroupDrawerOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDeleteInterval = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteInterval) {
      onDeleteInterval(interval.id);
    }
  };

  const handleEditInterval = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  const handleSaveInterval = (updatedInterval: Interval) => {
    if (onUpdateInterval) {
      onUpdateInterval(updatedInterval);
    }
  };

  return (
    <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
      <div
        className={`
          p-4 flex items-center justify-between bg-white cursor-pointer hover:bg-gray-50 transition-colors duration-200
          ${isExpanded ? 'border-b border-gray-200' : ''} 
        `}
        onClick={onToggle}
      >
        <div className="flex items-start flex-1">
          <div
            className="w-5 h-5 mr-2 text-gray-500 transition-transform duration-200 mt-1"
            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            <ChevronRight className="w-full h-full" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-medium">{interval.name}</h2>
            <div className="mt-1 space-y-1">
              {interval.description && (
                <p className="text-sm text-gray-500">{interval.description}</p>
              )}
              <div className="flex space-x-4 text-sm">
                <span className="text-gray-500">{interval.duration}</span>
                <span className="text-gray-500">
                  {interval.groupCount} {interval.groupCount === 1 ? 'session' : 'sessions'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            className="p-1.5 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100 transition-colors duration-200"
            onClick={handleEditInterval}
            aria-label="Edit interval"
          >
            <Edit size={18} />
          </button>

          <button
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors duration-200"
            onClick={handleDeleteInterval}
            aria-label="Delete interval"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Edit Interval Dialog */}
      <IntervalEditDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        interval={interval}
        onSave={handleSaveInterval}
      />

      <AnimatePresence>
        {isExpanded && (
          <IntervalGroupTabs
            intervalId={interval.id}
            onGroupDrawerOpen={() => setGroupDrawerOpen(true)}
            onExerciseDrawerOpen={() => setExerciseDrawerOpen(true)}
            setSelectedExercise={setSelectedExercise}
            setCurrentGroup={setCurrentGroup}
            allExercises={allExercises}
          />
        )}
      </AnimatePresence>

      {/* {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-b bg-white">
              {groups && groups.length > 0 && (
                <Tabs
                  tabs={groups.map((group) => ({
                    id: String(group.id),
                    label: <span className="whitespace-nowrap">{group.name}</span>,
                  }))}
                  activeTabId={String(activeGroup) || ''}
                  onTabChange={handleSelectTab}
                  onSave={(id, name) => {
                    updateGroup.mutate({ id: Number(id), name });
                  }}
                  actionButton={
                    <button
                      className="group h-full w-full px-6 py-2 text-sm text-gray-600 hover:text-gray-800 active:text-gray-900 hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center gap-2 transition-all duration-150 outline-none focus:outline-none hover:shadow-sm"
                      onClick={() => setGroupDrawerOpen(true)}
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
                    onClick={() => setGroupDrawerOpen(true)}
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
                        group={group}
                        allExercises={allExercises}
                        setSelectedExercise={setSelectedExercise}
                        setCurrentGroup={setCurrentGroup}
                        setExerciseDrawerOpen={setExerciseDrawerOpen}
                      />
                    ),
                )}
            </div>
          </motion.div>
        )} */}
      <ExerciseSidebar
        exercise={selectedExercise}
        group={currentGroup}
        onClose={() => {
          setSelectedExercise(null);
          setCurrentGroup(null);
          setExerciseDrawerOpen(false);
        }}
        isOpen={exerciseDrawerOpen}
        onSave={() => {}}
        allExercises={allExercises}
        intervalId={interval.id}
        parameterTypes={parameterTypes}
      />
      <GroupSidebar
        group={currentGroup}
        onClose={() => {
          setCurrentGroup(null);
        }}
        isOpen={groupDrawerOpen}
        onUpdateGroup={onUpdateGroup}
        onSave={(group) => {
          onUpdateGroup(group);
          setCurrentGroup(null);
        }}
        context={groupContext}
      />
    </div>
  );
};

export default IntervalEditor;
