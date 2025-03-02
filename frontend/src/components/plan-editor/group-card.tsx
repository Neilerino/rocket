import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Dumbbell, Clock } from 'lucide-react';
import { Group, Exercise } from './types';
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';

interface GroupCardProps {
  group: Group;
  onClick: () => void;
  selected?: boolean;
  className?: string;
  allExercises?: Exercise[];
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onClick,
  selected = false,
  className = '',
  allExercises = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Card expanded');
    setIsExpanded(!isExpanded);
  };

  // Helper function to get exercise name from ID
  const getExerciseName = (exerciseId?: string) => {
    if (!exerciseId) return 'Custom Exercise';
    const exercise = allExercises.find((e) => e.id === exerciseId);
    return exercise?.name || 'Unknown Exercise';
  };

  return (
    <div 
      onClick={onClick} 
      className={`cursor-pointer ${selected ? 'card-selected' : ''}`}
    >
      <Card
        className={`
          overflow-hidden transition-all duration-200 border border-gray-200 shadow-sm w-full
          ${selected ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'hover:border-gray-300'}
          ${className}
        `}
      >
        <CardHeader className="p-0">
          {/* Header - Always visible */}
          <div className="p-4 flex items-center justify-between w-full">
            <div className="flex-1 mr-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{group.name}</h3>
                <span
                  className={`
                    text-xs px-2 py-0.5 rounded-full 
                    ${group.exercises.length > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}
                  `}
                >
                  {group.exercises.length} {group.exercises.length === 1 ? 'exercise' : 'exercises'}
                </span>
              </div>
            </div>

            <button
              type="button"
              className={`
                p-1 rounded-full hover:bg-gray-100 text-gray-500 ml-auto
                transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}
              `}
              onClick={handleToggle}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        {/* Expanded content with animation */}
        <div 
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <CardBody className="px-4 pb-4 border-t border-gray-100 pt-3 bg-gray-50/50">
            {/* Description */}
            {group.description && (
              <div className="mb-3 text-sm text-gray-600">{group.description}</div>
            )}

            {/* Exercises list */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-1">
                Exercises
              </h4>
              {group.exercises.length > 0 ? (
                <div className="space-y-2">
                  {group.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm p-2 bg-white rounded border border-gray-200"
                    >
                      <Dumbbell className="w-3.5 h-3.5 text-primary/70" />
                      <span className="flex-1">
                        {exercise.name || getExerciseName(exercise.exerciseId)}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {exercise.sets && <span>{exercise.sets} sets</span>}
                        {exercise.rest && (
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-0.5" />
                            {exercise.rest}s
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">No exercises added yet</div>
              )}
            </div>
          </CardBody>
        </div>
      </Card>
    </div>
  );
};

export default GroupCard;
