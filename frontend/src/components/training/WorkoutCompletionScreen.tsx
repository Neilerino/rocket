import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'shad/components/ui/card';
import { Button } from '@heroui/button';
import { CheckCircle, Star, TrendingUp, Clock, Save, Home } from 'lucide-react';
import { Textarea } from 'shad/components/ui/textarea';

interface ExerciseResult {
  exerciseId: number;
  rpeAchieved?: number;
  parameterValues: { [paramName: string]: string | number };
  completedSets: number;
}

interface ExerciseSummary {
  id: number;
  name: string;
  sets: number;
  reps: number;
  parameters: Array<{
    name: string;
    targetValue?: string | number;
    unit: string;
  }>;
  rpeTarget?: number;
}

interface WorkoutCompletionScreenProps {
  workoutName: string;
  totalTime: number; // in seconds
  exercises: ExerciseSummary[];
  results: ExerciseResult[];
  previousResults?: ExerciseResult[];
  onSave: (notes: string) => void;
  onReturn: () => void;
}

const WorkoutCompletionScreen: React.FC<WorkoutCompletionScreenProps> = ({
  workoutName,
  totalTime,
  exercises,
  results,
  previousResults = [],
  onSave,
  onReturn,
}) => {
  const [notes, setNotes] = useState('');
  
  // Format time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };
  
  // Calculate performance improvements
  const getPerformanceHighlights = () => {
    const highlights = [];
    
    // Check for completed exercises
    const completedCount = results.length;
    if (completedCount === exercises.length) {
      highlights.push({
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        text: 'Completed all exercises'
      });
    }
    
    // Check for RPE improvements
    let rpeImprovements = 0;
    results.forEach(result => {
      const prevResult = previousResults.find(pr => pr.exerciseId === result.exerciseId);
      if (prevResult && result.rpeAchieved && prevResult.rpeAchieved) {
        // Lower RPE for same exercise is an improvement
        if (result.rpeAchieved < prevResult.rpeAchieved) {
          rpeImprovements++;
        }
      }
    });
    
    if (rpeImprovements > 0) {
      highlights.push({
        icon: <Star className="h-5 w-5 text-yellow-500" />,
        text: `Improved perceived exertion on ${rpeImprovements} exercise${rpeImprovements > 1 ? 's' : ''}`
      });
    }
    
    // Check for weight/duration improvements
    let parameterImprovements = 0;
    results.forEach(result => {
      const prevResult = previousResults.find(pr => pr.exerciseId === result.exerciseId);
      if (prevResult) {
        Object.entries(result.parameterValues).forEach(([paramName, value]) => {
          const prevValue = prevResult.parameterValues[paramName];
          if (prevValue !== undefined && typeof value === 'number' && typeof prevValue === 'number') {
            // For weight/duration parameters, higher is better
            if (value > prevValue) {
              parameterImprovements++;
            }
          }
        });
      }
    });
    
    if (parameterImprovements > 0) {
      highlights.push({
        icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
        text: `Improved performance metrics on ${parameterImprovements} parameter${parameterImprovements > 1 ? 's' : ''}`
      });
    }
    
    // Add time-based highlight
    highlights.push({
      icon: <Clock className="h-5 w-5 text-purple-500" />,
      text: `Completed in ${formatTime(totalTime)}`
    });
    
    return highlights;
  };
  
  const highlights = getPerformanceHighlights();
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader className="pb-2 text-center">
          <div className="mx-auto bg-primary/10 rounded-full p-4 mb-4">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Workout Complete!</CardTitle>
          <CardDescription className="text-lg">{workoutName}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Performance Highlights */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Highlights</h3>
            <div className="space-y-3">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  {highlight.icon}
                  <span>{highlight.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Exercise Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Exercise Summary</h3>
            <div className="space-y-2">
              {exercises.map(exercise => {
                const result = results.find(r => r.exerciseId === exercise.id);
                return (
                  <div key={exercise.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{exercise.name}</h4>
                      {result ? (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full">
                          Completed
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 rounded-full">
                          Skipped
                        </span>
                      )}
                    </div>
                    {result && (
                      <div className="mt-2 text-sm grid grid-cols-2 gap-2">
                        <div className="text-muted-foreground">Sets: {result.completedSets}/{exercise.sets}</div>
                        {exercise.rpeTarget && result.rpeAchieved && (
                          <div className="text-muted-foreground">
                            RPE: {result.rpeAchieved}/{exercise.rpeTarget}
                          </div>
                        )}
                        {Object.entries(result.parameterValues).map(([name, value]) => {
                          const param = exercise.parameters.find(p => p.name === name);
                          return param ? (
                            <div key={name} className="text-muted-foreground">
                              {name}: {value} {param.unit}
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Notes */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Workout Notes</h3>
            <Textarea
              placeholder="How did this workout feel? Any observations or things to remember for next time?"
              className="min-h-[100px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={onReturn}>
              <Home className="h-4 w-4 mr-2" /> Return to Dashboard
            </Button>
            <Button className="flex-1" onClick={() => onSave(notes)}>
              <Save className="h-4 w-4 mr-2" /> Save Workout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutCompletionScreen;
