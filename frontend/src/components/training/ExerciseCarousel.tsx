import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@heroui/button';

interface ExerciseItem {
  id: number;
  name: string;
  sets: number;
  reps: number;
  isCompleted?: boolean;
  isCurrent?: boolean;
}

interface ExerciseCarouselProps {
  exercises: ExerciseItem[];
  currentIndex: number;
  onSelectExercise: (index: number) => void;
}

const ExerciseCarousel: React.FC<ExerciseCarouselProps> = ({
  exercises,
  currentIndex,
  onSelectExercise,
}) => {
  // Calculate which exercises to show in the carousel
  // We'll show current exercise, 1 before (if available), and 2 after (if available)
  const getVisibleExercises = () => {
    const startIdx = Math.max(0, currentIndex - 1);
    const endIdx = Math.min(exercises.length - 1, currentIndex + 2);
    return exercises.slice(startIdx, endIdx + 1);
  };

  const visibleExercises = getVisibleExercises();
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < exercises.length - 1;

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Workout Sequence</h3>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} of {exercises.length}
        </div>
      </div>
      
      <div className="relative">
        <div className="flex overflow-x-auto gap-3 py-2 px-1 no-scrollbar">
          {visibleExercises.map((exercise) => {
            const isCurrentExercise = exercise.id === exercises[currentIndex].id;
            const isCompletedExercise = exercise.isCompleted;
            
            return (
              <div 
                key={exercise.id}
                className={`
                  flex-shrink-0 w-28 h-36 rounded-lg border overflow-hidden cursor-pointer transition-all
                  ${isCurrentExercise ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
                  ${isCompletedExercise ? 'bg-muted/30' : 'bg-background'}
                `}
                onClick={() => onSelectExercise(exercises.findIndex(e => e.id === exercise.id))}
              >
                {/* Exercise thumbnail placeholder */}
                <div className={`
                  h-20 bg-muted flex items-center justify-center
                  ${isCurrentExercise ? 'bg-primary/10' : ''}
                  ${isCompletedExercise ? 'bg-muted/50' : ''}
                `}>
                  {isCompletedExercise && (
                    <CheckCircle className="h-6 w-6 text-primary/70" />
                  )}
                  {!isCompletedExercise && (
                    <span className="text-xs text-muted-foreground">
                      {exercise.sets} × {exercise.reps}
                    </span>
                  )}
                </div>
                
                {/* Exercise info */}
                <div className="p-2">
                  <div className="text-xs font-medium line-clamp-2">{exercise.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {isCurrentExercise ? 'Current' : isCompletedExercise ? 'Completed' : 'Upcoming'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Navigation arrows */}
        {canScrollLeft && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm shadow-sm h-8 w-8 p-0"
            onClick={() => onSelectExercise(currentIndex - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        {canScrollRight && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm shadow-sm h-8 w-8 p-0"
            onClick={() => onSelectExercise(currentIndex + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExerciseCarousel;
