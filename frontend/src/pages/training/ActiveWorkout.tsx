import React, { useState } from 'react';
import { Button } from '@heroui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'shad/components/ui/card';
import { ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import RestTimer from '@/components/training/RestTimer';

// --- Mock Data --- interfaces (can be moved to types later)
interface MockExerciseParameter {
  name: string;
  value: string | number;
  unit: string;
}

interface MockExercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  parameters: MockExerciseParameter[];
  restSeconds?: number;
}

interface MockPlan {
  id: number;
  name: string;
  exercises: MockExercise[];
}

const mockPlan: MockPlan = {
  id: 1,
  name: 'Beginner Strength Workout A',
  exercises: [
    {
      id: 101,
      name: 'Goblet Squats',
      sets: 3,
      reps: 10,
      parameters: [{ name: 'Weight', value: 25, unit: 'lbs' }],
      restSeconds: 60,
    },
    {
      id: 102,
      name: 'Push-ups',
      sets: 3,
      reps: 12, // Aim for as many reps as possible (AMRAP) if needed
      parameters: [],
      restSeconds: 60,
    },
    {
      id: 103,
      name: 'Dumbbell Rows',
      sets: 3,
      reps: 10, // Per arm
      parameters: [{ name: 'Weight', value: 15, unit: 'lbs' }],
      restSeconds: 60,
    },
    {
      id: 104,
      name: 'Plank',
      sets: 3,
      reps: 1, // Reps often represent holds for time
      parameters: [{ name: 'Duration', value: 30, unit: 'sec' }],
      restSeconds: 45,
    },
  ],
};

const ActiveWorkout: React.FC = () => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false);
  const [isResting, setIsResting] = useState(false);

  const currentExercise = React.useMemo(() => {
    return mockPlan.exercises[currentExerciseIndex];
  }, [currentExerciseIndex]);

  const handleNextSet = () => {
    const isLastSet = currentSet >= currentExercise.sets;

    if (isLastSet) {
      const isLastExercise = currentExerciseIndex >= mockPlan.exercises.length - 1;
      if (isLastExercise) {
        setIsWorkoutComplete(true);
      } else {
        if (currentExercise.restSeconds && currentExercise.restSeconds > 0) {
          setIsResting(true);
        } else {
          handleNextExercise();
        }
      }
    } else {
      setCurrentSet(currentSet + 1);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < mockPlan.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
    } else {
      setIsWorkoutComplete(true);
    }
  };

  const handleRestComplete = () => {
    setIsResting(false);
    handleNextExercise();
  };

  const handleRestartWorkout = () => {
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setIsWorkoutComplete(false);
  };

  if (isWorkoutComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-2xl text-green-600">
              <CheckCircle className="mr-2 h-8 w-8" /> Workout Complete!
            </CardTitle>
            <CardDescription>Great job finishing {mockPlan.name}!</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRestartWorkout} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" /> Start Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isResting) {
    const restDuration = currentExercise.restSeconds ?? 0;
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center">
          Resting...
        </h1>
        <RestTimer duration={restDuration} onComplete={handleRestComplete} />
        {currentExerciseIndex < mockPlan.exercises.length - 1 && (
          <div className="mt-4 p-3 border rounded-md bg-gray-50 w-full max-w-md text-center">
            <p className="text-sm font-medium text-gray-700">
              Next Up: {mockPlan.exercises[currentExerciseIndex + 1].name}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{mockPlan.name}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Exercise {currentExerciseIndex + 1} of {mockPlan.exercises.length}
      </p>

      <Card className="mb-6 bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl text-blue-700">
            {currentExercise.name}
          </CardTitle>
          <CardDescription className="text-lg">
            Set {currentSet} of {currentExercise.sets}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-4xl font-semibold text-gray-800">{currentExercise.reps} Reps</div>
          {currentExercise.parameters.map((param, index) => (
            <div key={index} className="text-lg text-gray-600">
              {param.name}:{' '}
              <span className="font-medium">
                {param.value} {param.unit}
              </span>
            </div>
          ))}
          {currentExercise.restSeconds && (
            <div className="text-md text-gray-500 pt-2">
              Rest: {currentExercise.restSeconds} seconds after this set
            </div>
          )}
        </CardContent>
      </Card>

      {currentExerciseIndex < mockPlan.exercises.length - 1 && (
        <div className="mb-6 p-3 border rounded-md bg-gray-50">
          <p className="text-sm font-medium text-gray-700">
            Next Up: {mockPlan.exercises[currentExerciseIndex + 1].name}
          </p>
        </div>
      )}

      <div className="flex justify-center space-x-4">
        {!isResting && (
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
            onPress={handleNextSet}
          >
            {currentSet < currentExercise.sets ? 'Complete Set' : 'Complete Exercise'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActiveWorkout;
