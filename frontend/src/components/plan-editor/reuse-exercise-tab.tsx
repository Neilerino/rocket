import { Button } from 'shad/components/ui/button';
import { Exercise } from './types';
import { useState } from 'react';
import { Search } from 'lucide-react';

interface ReuseExerciseTabProps {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
}

const ReuseExerciseTab = ({ exercises, onSelect }: ReuseExerciseTabProps) => {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter exercises based on search term
  const filteredExercises = exercises.filter(
    (exercise) => 
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exercise.description && exercise.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle exercise selection
  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise.id);
  };

  // Handle use exercise button click
  const handleUseExercise = () => {
    if (!selectedExercise) return;
    
    const exercise = exercises.find(e => e.id === selectedExercise);
    if (!exercise) return;
    
    onSelect(exercise);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 mb-2">
        Select an existing exercise to use in this group.
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
      
      <div className="space-y-2 overflow-y-auto pr-1">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchTerm 
              ? `No exercises found matching "${searchTerm}"`
              : "No exercises available to reuse."}
          </div>
        ) : (
          filteredExercises.map((exercise) => (
            <div 
              key={exercise.id}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                selectedExercise === exercise.id 
                  ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => handleExerciseClick(exercise)}
            >
              <h3 className="font-medium text-gray-900">{exercise.name}</h3>
              {exercise.description && (
                <p className="text-sm text-gray-500 mt-1">{exercise.description}</p>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="pt-4 flex justify-end">
        <Button 
          onClick={handleUseExercise} 
          disabled={!selectedExercise}
          className="w-full sm:w-auto"
        >
          Use Selected Exercise
        </Button>
      </div>
    </div>
  );
};

export default ReuseExerciseTab;
