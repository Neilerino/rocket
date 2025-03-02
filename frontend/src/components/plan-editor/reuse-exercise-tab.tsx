import { Exercise, ExercisePrescription, ParameterType } from './types';
import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@heroui/input';
import ExpandableExerciseCard from './expandable-exercise-card';

interface ExerciseVariant {
  id: string;
  name?: string;
  prescription: ExercisePrescription;
}

interface ReuseExerciseTabProps {
  exercises: Exercise[];
  exerciseVariants?: Record<string, ExerciseVariant[]>;
  parameterTypes?: ParameterType[];
  onSelect: (exercise: Exercise, variant?: ExerciseVariant) => void;
}

const ReuseExerciseTab = ({
  exercises,
  exerciseVariants = {},
  parameterTypes = [],
  onSelect,
}: ReuseExerciseTabProps) => {
  const [selectedVariant, setSelectedVariant] = useState<ExerciseVariant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter exercises based on search term
  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exercise.description &&
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Handle variant selection
  const handleVariantSelect = (variant: ExerciseVariant) => {
    setSelectedVariant(variant);

    // Find the parent exercise of the selected variant
    const exerciseEntry = Object.entries(exerciseVariants).find(([_, variants]) =>
      variants.some((v) => v.id === variant.id),
    );

    if (!exerciseEntry) return;

    const exerciseId = exerciseEntry[0];
    const exercise = exercises.find((e) => e.id === exerciseId);

    if (!exercise) return;

    // Auto-select the exercise and variant when a variant is clicked
    onSelect(exercise, variant);
  };

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
                variants={exerciseVariants[exercise.id] || []}
                parameterTypes={parameterTypes}
                onVariantSelect={handleVariantSelect}
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
