import { useState } from 'react';
import { ChevronDown, ChevronRight, Dumbbell, Plus } from 'lucide-react';
import GroupSidebar from './group-sidebar';
import { Group, Plan, Interval } from './types';

const initialPlan: Plan = {
  id: 1,
  intervals: [
    {
      id: 1,
      name: "Week 1",
      duration: "1 week",
      order: 1,
      groups: [
        {
          id: 1,
          name: "Power Endurance",
          frequency: "2x",
          exercises: [
            {
              id: 1,
              name: "4x4s on V3-V4",
              description: "4 problems, 4 times each with 1 min rest between problems",
              variation: "Standard",
              sets: 1,
              reps: "4 problems x 4 times",
              rest: "1 min between problems",
              rpe: 8
            }
          ]
        },
        {
          id: 2,
          name: "Finger Strength",
          frequency: "1x",
          exercises: [
            {
              id: 2,
              name: "Hangboard Repeaters",
              description: "7/3 repeaters on 20mm edge",
              variation: "20mm Edge",
              sets: 6,
              reps: "7 sec hang / 3 sec rest",
              rest: "3 min between sets",
              rpe: 7
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Week 2",
      duration: "1 week",
      order: 2,
      groups: []
    }
  ]
};

const PlanEditor = () => {
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [expandedIntervals, setExpandedIntervals] = useState<number[]>([1]);
  const [expandedExercises, setExpandedExercises] = useState<number[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const toggleInterval = (intervalId: number) => {
    setExpandedIntervals(prev => 
      prev.includes(intervalId) 
        ? prev.filter(id => id !== intervalId)
        : [...prev, intervalId]
    );
  };

  const toggleExercise = (exerciseId: number) => {
    setExpandedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  return (
    <div className="relative">
      {/* Main content */}
      <div className="space-y-4">
        {plan.intervals.map((interval) => (
          <div key={interval.id} className="border rounded-lg bg-white">
            {/* Interval Header */}
            <div 
              className="flex items-center px-6 py-4 cursor-pointer border-b"
              onClick={() => toggleInterval(interval.id)}
            >
              <div className="w-5 h-5 mr-2 text-gray-500">
                {expandedIntervals.includes(interval.id) ? (
                  <ChevronDown />
                ) : (
                  <ChevronRight />
                )}
              </div>
              <h2 className="text-lg font-medium">{interval.name}</h2>
            </div>

            {/* Interval Content */}
            {expandedIntervals.includes(interval.id) && (
              <div className="p-6 pt-4">
                <div className="grid grid-cols-2 gap-6">
                  {interval.groups.map((group) => (
                    <div 
                      key={group.id} 
                      className="border rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
                      onClick={() => setSelectedGroup(group)}
                    >
                      {/* Group Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium">{group.name}</h3>
                          <p className="text-sm text-gray-500">{group.frequency}</p>
                        </div>
                      </div>

                      {/* Group Exercises Preview */}
                      <div className="space-y-2">
                        {group.exercises.map((exercise) => (
                          <div 
                            key={exercise.id} 
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="w-4 h-4 mr-2 text-gray-400">
                                <Dumbbell />
                              </div>
                              <span className="font-medium">{exercise.name}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {exercise.sets} sets
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Add Group Button Card */}
                  <div className="border rounded-lg p-4 flex items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer min-h-[200px]">
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
                        <Plus />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Add Group</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Group sidebar */}
      <GroupSidebar 
        group={selectedGroup} 
        onClose={() => setSelectedGroup(null)} 
      />
    </div>
  );
};

export default PlanEditor;
