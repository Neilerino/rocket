import { Exercise, ExerciseVariation } from '@/services/types';
import { useState, useRef } from 'react';
import { Input } from '@heroui/input';
import ExpandableExerciseCard from './expandable-exercise-card';
import { useExercises } from '@/services/hooks';
import { X } from 'lucide-react';

interface ReuseExerciseTabProps {
  onSelect: (variant: ExerciseVariation) => void;
}

const ReuseExerciseTab = ({ onSelect }: ReuseExerciseTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: exercises } = useExercises({ userId: 1 });

  const filteredExercises = exercises
    ? exercises.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (exercise.description &&
            exercise.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    : [];

  const clearSearch = () => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed top section - more compact */}
      <div className="flex-shrink-0 mb-3">
        {/* Search input - more interactive */}
        <div>
          <Input
            ref={searchInputRef}
            type="text"
            variant="bordered"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1.5 ml-1">
          Select an exercise variant to use in this group
        </div>
      </div>

      {/* Scrollable exercise list - takes up all available space */}
      <div className="flex-grow overflow-y-auto min-h-0 -mx-2 px-2">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchTerm
              ? `No exercises found matching "${searchTerm}"`
              : 'No exercises available to reuse.'}
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredExercises.map((exercise, index) => (
              <ExpandableExerciseCard
                key={exercise.id}
                exercise={exercise}
                onVariantSelect={onSelect}
                className={index < filteredExercises.length - 1 ? 'mb-3' : ''}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReuseExerciseTab;
