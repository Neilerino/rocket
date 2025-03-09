import React, { useState } from 'react';
import {
  Exercise,
  ExercisePrescription,
  Group,
  PlanInterval as Interval,
  ParameterType,
} from './types';
import ExerciseCard from './exercise-card';
import ExerciseSidebar from './exercise-sidebar';
import GroupSidebar from './group-sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit } from 'lucide-react';
import { Tabs, TabItem } from '../ui/tabs';
import { sampleExercises } from './sample-data';
import IntervalEditDialog from './interval-edit-dialog';

interface IntervalEditorProps {
  interval: Interval;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectGroup?: (group: Group) => void;
  parameterTypes: ParameterType[];
  allExercises: Exercise[];
  onUpdateGroup: (group: Group) => void;
  onDeleteInterval?: (intervalId: number) => void;
  onUpdateInterval?: (updatedInterval: Interval) => void;
}

const IntervalEditor: React.FC<IntervalEditorProps> = ({
  interval,
  isExpanded,
  onToggle,
  parameterTypes,
  allExercises,
  onUpdateGroup,
  onDeleteInterval,
  onUpdateInterval,
}) => {
  const [activeGroup, setActiveGroup] = useState<string | null>(interval.groups[0]?.id || null);
  const [exerciseDrawerOpen, setExerciseDrawerOpen] = useState(false);
  const [groupDrawerOpen, setGroupDrawerOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Handle tab selection
  const handleSelectKey = (key: string) => {
    setActiveGroup(key);
  };

  // Handle group actions
  const handleAddGroup = () => {
    // Mark the current interval as the one adding a new group
    // by setting a flag on all groups in the interval
    // Create a new dummy group with ID 'new' to signal we want to create a new group
    const newGroup: Group = {
      id: 'new',
      name: 'New Group',
      frequency: '1x',
      exercises: [],
      _isAddingNewGroup: true,
    };

    setCurrentGroup(newGroup);
    setGroupDrawerOpen(true);
  };

  // Handle edit group (for the Add Exercises button)
  const handleEditGroup = (e: React.MouseEvent, group: Group) => {
    e.stopPropagation(); // Prevent tab selection
    console.log('Edit group clicked for group:', group);

    setCurrentGroup(group);
    setExerciseDrawerOpen(true);
  };

  // Handle exercise save
  const handleSaveExercise = (prescription: ExercisePrescription) => {
    if (!currentGroup) return;

    // Create a new prescription with a unique ID if none exists
    const newPrescription = {
      ...prescription,
      id: prescription.id || Date.now().toString(),
    };

    // Clone the current group and add the new exercise prescription
    const updatedGroup = {
      ...currentGroup,
      exercises: [...currentGroup.exercises, newPrescription],
    };

    // Update the group via the parent component
    onUpdateGroup(updatedGroup);

    // Close the exercise sidebar
    setSelectedExercise(null);
    setCurrentGroup(null);
  };

  const handleSaveGroupName = (groupId: string, newName: string) => {
    if (!newName.trim()) return;

    setInterval((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        groups: prev.groups.map((group) =>
          group.id === groupId ? { ...group, name: newName } : group,
        ),
      };
    });
  };

  // Handle delete interval
  const handleDeleteInterval = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling the interval
    if (onDeleteInterval) {
      onDeleteInterval(interval.id);
    }
  };

  // Handle edit interval
  const handleEditInterval = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling the interval
    setShowEditDialog(true);
  };

  // Handle save interval
  const handleSaveInterval = (updatedInterval: Interval) => {
    if (onUpdateInterval) {
      onUpdateInterval(updatedInterval);
    }
  };

  return (
    <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
      {/* Interval Header */}
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
                  {interval.groups.length} {interval.groups.length === 1 ? 'session' : 'sessions'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {/* Edit Interval Button */}
          <button
            className="p-1.5 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100 transition-colors duration-200"
            onClick={handleEditInterval}
            aria-label="Edit interval"
          >
            <Edit size={18} />
          </button>

          {/* Delete Interval Button */}
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
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {/* Custom Tabs Container */}
            <div className="border-b bg-white">
              {interval.groups.length > 0 && (
                <Tabs
                  tabs={interval.groups.map((group) => ({
                    id: group.id,
                    label: <span className="whitespace-nowrap">{group.name}</span>,
                  }))}
                  activeTabId={activeGroup || ''}
                  onTabChange={handleSelectKey}
                  onSave={handleSaveGroupName}
                  actionButton={
                    <button
                      className="group h-full w-full px-6 py-2 text-sm text-gray-600 hover:text-gray-800 active:text-gray-900 hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center gap-2 transition-all duration-150 outline-none focus:outline-none hover:shadow-sm"
                      onClick={handleAddGroup}
                    >
                      <Plus className="w-4 h-4 transform group-hover:scale-110 transition-transform duration-200" />
                      <span className="transform group-hover:scale-105 transition-transform duration-200">
                        Add Group
                      </span>
                    </button>
                  }
                />
              )}

              {interval.groups.length === 0 && (
                <div className="p-4 text-center">
                  <button
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    onClick={handleAddGroup}
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add First Group
                  </button>
                </div>
              )}
            </div>

            {/* Group content based on selected tab */}
            <div className="p-4">
              {interval.groups.map(
                (group) =>
                  activeGroup === group.id && (
                    <div key={group.id} className="space-y-4">
                      {/* Add Exercises Card - Now at the top */}
                      <div
                        className="cursor-pointer hover:shadow-md transition-all overflow-hidden border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-lg"
                        onClick={() => {
                          setSelectedExercise(null);
                          setCurrentGroup(group);
                          setExerciseDrawerOpen(true);
                        }}
                      >
                        <div className="flex flex-row items-center justify-center gap-2 py-4 bg-gradient-to-r from-gray-50 to-white">
                          <div className="w-5 h-5 text-primary flex-shrink-0 rounded-full bg-primary/10 p-0.5">
                            <Plus className="w-full h-full" />
                          </div>
                          <h3 className="font-medium text-gray-600">Add Exercises</h3>
                        </div>
                      </div>

                      {group.exercises.map((prescription, index) => {
                        // Create a minimal exercise object from the prescription
                        const exercise: Partial<Exercise> = {
                          name: prescription.exerciseId
                            ? allExercises.find((e) => e.id === prescription.exerciseId)?.name ||
                              'Unknown Exercise'
                            : prescription.name,
                          description: '',
                        };

                        return (
                          <div key={index} className="mb-4">
                            <ExerciseCard
                              exercise={exercise as Exercise}
                              prescription={prescription}
                              onEdit={() => {
                                // Create a full exercise object if we have one
                                const fullExercise = prescription.exerciseId
                                  ? allExercises.find((e) => e.id === prescription.exerciseId) || {
                                      id: prescription.exerciseId,
                                      name: exercise.name || 'Unknown',
                                      description: exercise.description || '',
                                      variations: [],
                                    }
                                  : {
                                      id: prescription.id || '',
                                      name: exercise.name || 'Custom Exercise',
                                      description: exercise.description || '',
                                      variations: [],
                                    };

                                setSelectedExercise(fullExercise);
                                setCurrentGroup(group);
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ExerciseSidebar
        exercise={selectedExercise}
        group={currentGroup}
        onClose={() => {
          setSelectedExercise(null);
          setCurrentGroup(null);
          setExerciseDrawerOpen(false);
        }}
        isOpen={exerciseDrawerOpen}
        onSave={handleSaveExercise}
        allExercises={allExercises}
        intervalId={interval.id}
        parameterTypes={parameterTypes}
      />
      <GroupSidebar
        group={currentGroup}
        onClose={() => {
          setCurrentGroup(null);
          setGroupDrawerOpen(false);
        }}
        isOpen={groupDrawerOpen}
        onUpdateGroup={onUpdateGroup}
        onSave={(group) => {
          onUpdateGroup(group);
          setCurrentGroup(null);
          setGroupDrawerOpen(false);
        }}
        allGroups={interval.groups}
        sampleExercises={sampleExercises}
      />
    </div>
  );
};

export default IntervalEditor;
