import { ChevronDown, ChevronRight, Dumbbell, Plus } from 'lucide-react';
import { Group, Interval, ParameterType, Exercise, ExercisePrescription } from './types';
import { useState, useRef, useEffect } from 'react';
import ExerciseCard from './exercise-card';
import { CardHeader } from '@heroui/card';
import ExerciseSidebar from './exercise-sidebar';

interface IntervalEditorProps {
  interval: Interval;
  allGroups: Group[];
  isExpanded: boolean;
  onToggle: () => void;
  onSelectGroup: (group: Group) => void;
  parameterTypes?: ParameterType[];
  allExercises?: Exercise[];
  onUpdateGroup: (updatedGroup: Group) => void;
}

const IntervalEditor = ({
  interval,
  allGroups,
  isExpanded,
  onToggle,
  onSelectGroup,
  parameterTypes = [],
  allExercises = [],
  onUpdateGroup,
}: IntervalEditorProps) => {
  // Get groups that aren't already in this interval
  const availableGroups = allGroups.filter(
    (group) => !interval.groups.some((g) => g.id === group.id)
  );

  // State to track the selected tab
  const [selectedKey, setSelectedKey] = useState(
    interval.groups.length > 0 ? interval.groups[0].id : '',
  );
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // State for inline editing
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'name' | 'frequency' | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // State for exercise sidebar
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);

  // Add a new group
  const handleAddGroup = () => {
    // Create a marker group that signals we're adding a new group to this interval
    const markerGroup: Group = {
      id: 'new',
      name: '',
      frequency: '',
      exercises: [],
      _isAddingNewGroup: true  // Special flag to identify which interval is adding a group
    };
    onSelectGroup(markerGroup);
  };

  // Handle tab selection
  const handleTabSelect = (groupId: string) => {
    if (editingGroupId) return;
    setSelectedKey(groupId);
  };

  // Start editing a group field
  const handleDoubleClick = (e: React.MouseEvent, group: Group, field: 'name' | 'frequency') => {
    e.stopPropagation();
    setEditingGroupId(group.id);
    setEditingField(field);
    setEditValue(field === 'name' ? group.name : group.frequency || '');
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  // Handle input blur (save changes)
  const handleInputBlur = () => {
    if (editingGroupId && editingField) {
      const updatedGroup = interval.groups.find((g) => g.id === editingGroupId);
      if (updatedGroup) {
        const newGroup = { ...updatedGroup };
        if (editingField === 'name') {
          newGroup.name = editValue;
        } else if (editingField === 'frequency') {
          newGroup.frequency = editValue;
        }
        onUpdateGroup(newGroup);
      }
    }
    setEditingGroupId(null);
    setEditingField(null);
  };

  // Handle input key press (save on Enter, cancel on Escape)
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setEditingGroupId(null);
      setEditingField(null);
    }
  };

  // Focus the input when editing starts
  useEffect(() => {
    if (editingGroupId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingGroupId, editingField]);

  // Update the indicator position when tab selection changes
  useEffect(() => {
    if (!indicatorRef.current || !tabsRef.current || !selectedKey) return;

    const tabsContainer = tabsRef.current;
    const selectedTab = tabsContainer.querySelector(
      `[data-tab-id="${selectedKey}"]`,
    ) as HTMLElement;

    if (selectedTab) {
      const indicator = indicatorRef.current;
      indicator.style.width = `${selectedTab.offsetWidth}px`;
      indicator.style.transform = `translateX(${selectedTab.offsetLeft}px)`;
      indicator.style.opacity = '1';
    }
  }, [selectedKey]);

  // Handle edit group (for the Add Exercises button)
  const handleEditGroup = (e: React.MouseEvent, group: Group) => {
    e.stopPropagation(); // Prevent tab selection
    console.log('Edit group clicked for group:', group);
    
    // Create a dummy exercise to open the sidebar
    const dummyExercise: Exercise = {
      id: 'new',
      name: 'New Exercise',
      description: '',
      variations: []
    };
    
    console.log("Setting selectedExercise:", dummyExercise);
    console.log("Setting currentGroup:", group);
    
    setSelectedExercise(dummyExercise);
    setCurrentGroup(group);
  };
  
  // Handle saving a new exercise prescription
  const handleSaveExercise = (prescription: ExercisePrescription) => {
    if (!currentGroup) return;
    
    // Create a new prescription with a unique ID
    const newPrescription = {
      ...prescription,
      id: Date.now().toString(),
      planIntervalId: interval.id.toString(),
    };
    
    // Update the group with the new exercise
    const updatedGroup = {
      ...currentGroup,
      exercises: [...currentGroup.exercises, newPrescription]
    };
    
    // Call the parent's onUpdateGroup function
    onUpdateGroup(updatedGroup);
    
    // Close the sidebar
    setSelectedExercise(null);
    setCurrentGroup(null);
  };

  return (
    <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
      {/* Interval Header */}
      <div
        className="flex items-center px-6 py-3 cursor-pointer bg-gray-50 border-b"
        onClick={onToggle}
      >
        <div className="w-5 h-5 mr-2 text-gray-500">
          {isExpanded ? <ChevronDown /> : <ChevronRight />}
        </div>
        <h2 className="text-lg font-medium">{interval.name}</h2>
      </div>

      {isExpanded && (
        <>
          {/* Custom Tabs Container */}
          <div className="border-b flex items-center justify-between bg-white">
            <div className="flex-grow relative">
              <div ref={tabsRef} className="flex px-2 gap-4 relative">
                {interval.groups.map((group) => (
                  <div
                    key={group.id}
                    data-tab-id={group.id}
                    className={`px-4 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                      selectedKey === group.id
                        ? 'font-medium text-primary'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => handleTabSelect(group.id)}
                  >
                    <div className="flex items-center gap-1">
                      {editingGroupId === group.id && editingField === 'name' ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          onKeyDown={handleInputKeyDown}
                          className="border px-1 py-0.5 rounded text-sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          className="whitespace-nowrap"
                          onDoubleClick={(e) => handleDoubleClick(e, group, 'name')}
                        >
                          {group.name || 'Untitled Group'}
                        </span>
                      )}

                      {group.frequency && editingGroupId !== group.id && (
                        <span
                          className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 whitespace-nowrap cursor-pointer"
                          onDoubleClick={(e) => handleDoubleClick(e, group, 'frequency')}
                        >
                          {group.frequency}
                        </span>
                      )}

                      {editingGroupId === group.id && editingField === 'frequency' && (
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          onKeyDown={handleInputKeyDown}
                          className="ml-2 border px-1 py-0.5 rounded text-xs w-24"
                          placeholder="e.g. 3x/week"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  </div>
                ))}

                {/* Animated indicator */}
                <div
                  ref={indicatorRef}
                  className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 opacity-0"
                  style={{ height: '2px' }}
                />
              </div>
            </div>

            {/* Add Group Button - Right Aligned */}
            <button
              className="flex items-center px-4 py-2 h-full text-gray-600 hover:text-primary hover:bg-gray-100 border-l transition-colors"
              onClick={handleAddGroup}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="whitespace-nowrap font-medium">Add Group</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {interval.groups.map(
              (group) =>
                selectedKey === group.id && (
                  <div key={group.id} className="space-y-4">
                    {/* Add Exercises Card - Now at the top */}
                    <div 
                      className="cursor-pointer hover:shadow-md transition-all overflow-hidden border-2 border-dashed border-gray-200 rounded-lg"
                      onClick={(e) => handleEditGroup(e, group)}
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
                      // In a real app, you'd likely have the full exercise data
                      const exercise = {
                        id: prescription.exerciseId || `exercise-${index}`,
                        name: prescription.exerciseId
                          ? `Exercise ${index + 1}: ${prescription.exerciseId.slice(0, 8)}`
                          : `Exercise ${index + 1}`,
                        description: 'Example exercise description',
                      };

                      return (
                        <ExerciseCard
                          key={prescription.id}
                          exercise={exercise}
                          prescription={prescription}
                          parameterTypes={parameterTypes}
                        />
                      );
                    })}

                    {group.exercises.length === 0 && (
                      <div className="text-center py-10 text-gray-500 bg-gray-50/50 rounded-lg border border-dashed">
                        <Dumbbell className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        <p>No exercises in this group yet.</p>
                      </div>
                    )}
                    
                    {/* Exercise Sidebar at the group level */}
                    {selectedExercise && currentGroup && currentGroup.id === group.id && (
                      <ExerciseSidebar
                        exercise={selectedExercise}
                        onClose={() => {
                          console.log("Closing exercise sidebar at group level");
                          setSelectedExercise(null);
                          setCurrentGroup(null);
                        }}
                        onSave={handleSaveExercise}
                        allExercises={allExercises}
                        group={currentGroup}
                        intervalId={interval.id}
                        parameterTypes={parameterTypes}
                      />
                    )}
                  </div>
                ),
            )}

            {interval.groups.length === 0 && (
              <div className="text-center py-10 text-gray-500 bg-gray-50/50 rounded-lg border border-dashed">
                <Plus className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p>No groups in this interval yet. Add a group to get started.</p>
                <button
                  onClick={handleAddGroup}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  Add Group
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default IntervalEditor;
