import { Button } from 'shad/components/ui/button';
import { Exercise, ExercisePrescription, ParameterType } from './types';
import { useState } from 'react';
import { Search } from 'lucide-react';
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
  onSelect 
}: ReuseExerciseTabProps) => {
  const [selectedVariant, setSelectedVariant] = useState<ExerciseVariant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter exercises based on search term
  const filteredExercises = exercises.filter(
    (exercise) => 
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exercise.description && exercise.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle variant selection
  const handleVariantSelect = (variant: ExerciseVariant) => {
    setSelectedVariant(variant);
  };

  // Handle use exercise button click
  const handleUseExercise = () => {
    if (!selectedVariant) return;
    
    // Find the parent exercise of the selected variant
    const exerciseEntry = Object.entries(exerciseVariants).find(([_, variants]) => 
      variants.some(v => v.id === selectedVariant.id)
    );
    
    if (!exerciseEntry) return;
    
    const exerciseId = exerciseEntry[0];
    const exercise = exercises.find(e => e.id === exerciseId);
    
    if (!exercise) return;
    
    onSelect(exercise, selectedVariant);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 mb-2">
        Select an exercise variant to use in this group.
      </div>
      
      {/* Search input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search exercises..."
          className="pl-10 block w-full rounded-md border-gray-200 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="space-y-3 overflow-y-auto pr-1 max-h-[calc(100vh-280px)]">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchTerm 
              ? `No exercises found matching "${searchTerm}"`
              : "No exercises available to reuse."}
          </div>
        ) : (
          filteredExercises.map((exercise) => (
            <ExpandableExerciseCard
              key={exercise.id}
              exercise={exercise}
              variants={exerciseVariants[exercise.id] || []}
              parameterTypes={parameterTypes}
              onVariantSelect={handleVariantSelect}
            />
          ))
        )}
      </div>
      
      <div className="pt-4 flex justify-end">
        <Button 
          variant="outline" 
          className="mr-2"
          onClick={() => setSelectedVariant(null)}
        >
          Cancel
        </Button>
        <Button 
          disabled={!selectedVariant}
          onClick={handleUseExercise}
        >
          Use Selected Variant
        </Button>
      </div>
    </div>
  );
};

export default ReuseExerciseTab;
