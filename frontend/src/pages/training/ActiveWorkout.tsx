import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'shad/components/ui/card';
import {
  CheckCircle,
  RefreshCw,
  Save,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  SkipForward,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Progress } from '@heroui/progress';
import WorkoutTimer from '@/components/training/WorkoutTimer';
import WorkoutCompletionScreen from '@/components/training/WorkoutCompletionScreen';

interface MockExerciseParameter {
  name: string;
  targetValue?: string | number;
  unit: string;
  logValue?: boolean;
}

interface MockExercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  parameters: MockExerciseParameter[];
  restSeconds?: number;
  rpeTarget?: number;
}

interface MockPlan {
  id: number;
  name: string;
  exercises: MockExercise[];
}

interface ExerciseResult {
  exerciseId: number;
  rpeAchieved?: number;
  parameterValues: { [paramName: string]: string | number };
  completedSets: number;
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
      parameters: [{ name: 'Weight', targetValue: 25, unit: 'lbs', logValue: true }],
      restSeconds: 60,
      rpeTarget: 7,
    },
    {
      id: 102,
      name: 'Push-ups',
      sets: 3,
      reps: 12,
      parameters: [],
      restSeconds: 60,
    },
    {
      id: 103,
      name: 'Dumbbell Rows',
      sets: 3,
      reps: 10,
      parameters: [{ name: 'Weight', targetValue: 15, unit: 'lbs', logValue: true }],
      restSeconds: 60,
      rpeTarget: 8,
    },
    {
      id: 104,
      name: 'Plank',
      sets: 3,
      reps: 1,
      parameters: [{ name: 'Duration', targetValue: 30, unit: 'sec', logValue: true }],
      restSeconds: 45,
      rpeTarget: 6,
    },
  ],
};

// Mock previous workout results for comparison
const mockPreviousResults: ExerciseResult[] = [
  {
    exerciseId: 101,
    rpeAchieved: 6,
    parameterValues: { Weight: 20 },
    completedSets: 3,
  },
  {
    exerciseId: 103,
    rpeAchieved: 7,
    parameterValues: { Weight: 12 },
    completedSets: 3,
  },
  {
    exerciseId: 104,
    rpeAchieved: 8,
    parameterValues: { Duration: 25 },
    completedSets: 3,
  },
];

const ActiveWorkout: React.FC = () => {
  // Workout state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [showRpeInput, setShowRpeInput] = useState(false);
  const [currentRpe, setCurrentRpe] = useState<number | null>(null);
  const [timerKey, setTimerKey] = useState(0); // Used to force timer reset
  const [workoutComplete, setWorkoutComplete] = useState(false);

  // Timer for elapsed workout time
  useEffect(() => {
    if (!workoutStartTime && !isPaused) {
      setWorkoutStartTime(new Date());
    }

    const timer =
      !isPaused &&
      setInterval(() => {
        if (workoutStartTime) {
          const now = new Date();
          const elapsed = Math.floor((now.getTime() - workoutStartTime.getTime()) / 1000);
          setElapsedTime(elapsed);
        }
      }, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [workoutStartTime, isPaused]);

  // Current exercise
  const currentExercise = mockPlan.exercises[currentExerciseIndex];

  // Calculate overall progress
  const totalSets = mockPlan.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const completedSets = results.reduce((acc, res) => acc + res.completedSets, 0) + currentSetIndex;
  const progressPercentage = Math.round((completedSets / totalSets) * 100);

  // Get previous results for current exercise if available
  const getPreviousResult = (exerciseId: number) => {
    return mockPreviousResults.find((res) => res.exerciseId === exerciseId);
  };

  const currentPreviousResult = getPreviousResult(currentExercise.id);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle completing a set
  const completeSet = () => {
    // If this was the last set of the exercise
    if (currentSetIndex === currentExercise.sets - 1) {
      // Show RPE input if the exercise has an RPE target
      if (currentExercise.rpeTarget) {
        setShowRpeInput(true);
        return; // Don't proceed until RPE is submitted
      }

      // Record result for this exercise
      const existingResultIndex = results.findIndex((r) => r.exerciseId === currentExercise.id);
      const newResult: ExerciseResult = {
        exerciseId: currentExercise.id,
        rpeAchieved: currentRpe || undefined,
        parameterValues: {},
        completedSets: currentExercise.sets,
      };

      if (existingResultIndex >= 0) {
        const updatedResults = [...results];
        updatedResults[existingResultIndex] = newResult;
        setResults(updatedResults);
      } else {
        setResults([...results, newResult]);
      }

      // Move to next exercise if available
      if (currentExerciseIndex < mockPlan.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSetIndex(0);
        setCurrentRpe(null);
      } else {
        // Workout complete!
        setWorkoutComplete(true);
      }
    } else {
      // Move to next set
      setCurrentSetIndex(currentSetIndex + 1);
    }

    // Start rest period if configured
    if (currentExercise.restSeconds) {
      setIsResting(true);
      // Reset timer key to force timer reset
      setTimerKey((prev) => prev + 1);
    }
  };

  // Handle submitting RPE
  const submitRpe = () => {
    setShowRpeInput(false);
    completeSet();
  };

  // Handle finishing rest period
  const finishRest = () => {
    setIsResting(false);
  };

  // Get the duration for the current exercise if it has a duration parameter
  const getExerciseDuration = (): number => {
    const durationParam = currentExercise.parameters.find(
      (p) =>
        p.name.toLowerCase() === 'duration' ||
        p.name.toLowerCase() === 'time' ||
        p.name.toLowerCase() === 'hold time',
    );

    return (durationParam?.targetValue as number) || 0;
  };

  // Determine if the current exercise is timed
  const isTimedExercise = getExerciseDuration() > 0;

  // Handle saving the completed workout
  const handleSaveWorkout = (notes: string) => {
    console.log('Saving workout with notes:', notes);
    // Here you would typically send the workout data to your backend
    alert('Workout saved successfully!');
  };

  // Handle returning to dashboard
  const handleReturnToDashboard = () => {
    // Reset the workout state
    setWorkoutComplete(false);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setResults([]);
    setElapsedTime(0);
    setWorkoutStartTime(null);
    // Here you would typically navigate to the dashboard
    console.log('Returning to dashboard');
  };

  // Handle ending the workout early
  const handleEndWorkout = () => {
    if (window.confirm('Are you sure you want to end this workout? Progress will be saved.')) {
      setWorkoutComplete(true);
    }
  };

  // If workout is complete, show the completion screen
  if (workoutComplete) {
    return (
      <WorkoutCompletionScreen
        workoutName={mockPlan.name}
        totalTime={elapsedTime}
        exercises={mockPlan.exercises}
        results={results}
        previousResults={mockPreviousResults}
        onSave={handleSaveWorkout}
        onReturn={handleReturnToDashboard}
      />
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      {/* Session Header */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{mockPlan.name}</CardTitle>
              <CardDescription>Week 3 • Estimated duration: 45 min</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <div className="text-lg font-mono">{formatTime(elapsedTime)}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-1">
            <Progress value={progressPercentage} className="h-3" />
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {completedSets} of {totalSets} sets completed
            </div>

            {/* Exercise Navigation with Next Exercise Preview */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={currentExerciseIndex === 0}
                  onPress={() => {
                    if (currentExerciseIndex > 0) {
                      setCurrentExerciseIndex(currentExerciseIndex - 1);
                      setCurrentSetIndex(0);
                    }
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-xs text-muted-foreground">
                  {currentExerciseIndex + 1} / {mockPlan.exercises.length}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={currentExerciseIndex === mockPlan.exercises.length - 1}
                  onClick={() => {
                    if (currentExerciseIndex < mockPlan.exercises.length - 1) {
                      setCurrentExerciseIndex(currentExerciseIndex + 1);
                      setCurrentSetIndex(0);
                    }
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {currentExerciseIndex < mockPlan.exercises.length - 1 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Next: </span>
                  <span className="font-medium">
                    {mockPlan.exercises[currentExerciseIndex + 1].name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Exercise Display with focus on current exercise */}
      {!isResting ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">{currentExercise.name}</CardTitle>
            <CardDescription>
              Set {currentSetIndex + 1} of {currentExercise.sets}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showRpeInput ? (
              <div className="flex flex-col items-center py-6">
                <h3 className="text-lg font-medium mb-4">How hard was that?</h3>
                <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                  <div className="grid grid-cols-10 gap-1 w-full">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rpe) => (
                      <button
                        key={rpe}
                        className={`p-2 rounded-md border ${
                          currentRpe === rpe
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/30 hover:bg-muted'
                        }`}
                        onClick={() => setCurrentRpe(rpe)}
                      >
                        {rpe}
                      </button>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentRpe === null
                      ? 'Select RPE (Rate of Perceived Exertion)'
                      : currentRpe <= 3
                        ? 'Very easy'
                        : currentRpe <= 6
                          ? 'Moderate effort'
                          : currentRpe <= 8
                            ? 'Hard but manageable'
                            : 'Maximum effort'}
                  </div>
                  <Button
                    className="w-full mt-2"
                    onClick={submitRpe}
                    disabled={currentRpe === null}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Timer for timed exercises */}
                {isTimedExercise && (
                  <div className="flex justify-center mb-6">
                    <WorkoutTimer
                      key={`exercise-timer-${currentExerciseIndex}-${currentSetIndex}-${timerKey}`}
                      initialSeconds={getExerciseDuration()}
                      onComplete={completeSet}
                      autoStart={false}
                      size="lg"
                      enableSound={true}
                    />
                  </div>
                )}

                {/* Collapsible Instructions */}
                <div className="mb-6">
                  <div className="p-3 border rounded-lg mt-2 text-sm">
                    <p>Perform {currentExercise.reps} repetitions with proper form.</p>
                    <p>Focus on controlled movement and full range of motion.</p>
                  </div>
                </div>

                {/* Exercise Details - Improved layout */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Reps</div>
                    <div className="text-2xl font-bold">{currentExercise.reps}</div>
                  </div>

                  {currentExercise.rpeTarget && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Target RPE</div>
                      <div className="text-2xl font-bold">{currentExercise.rpeTarget}</div>
                    </div>
                  )}

                  {currentExercise.parameters.map((param, index) => (
                    <div key={index} className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">{param.name}</div>
                      <div className="text-2xl font-bold">
                        {param.targetValue} {param.unit}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Previous Performance - Moved up for better visibility */}
                {currentPreviousResult && (
                  <div className="mb-6 p-3 border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Last Session</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(currentPreviousResult.parameterValues).map(
                        ([name, value]) => (
                          <div key={name} className="flex items-center">
                            <span className="text-muted-foreground mr-1">{name}:</span>
                            <span>
                              {value}{' '}
                              {currentExercise.parameters.find((p) => p.name === name)?.unit}
                            </span>
                          </div>
                        ),
                      )}
                      {currentPreviousResult.rpeAchieved && (
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-1">RPE:</span>
                          <span>{currentPreviousResult.rpeAchieved}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons - Made more prominent */}
                <div className="flex justify-between gap-4">
                  <Button variant="ghost" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" /> Modify
                  </Button>
                  <Button className="flex-1" onClick={completeSet}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Complete Set
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Rest Period Interface */
        <Card className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-xl">Rest Period</CardTitle>
            <CardDescription>
              Next: Set {currentSetIndex + 1} of {currentExercise.sets}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <WorkoutTimer
                key={`rest-timer-${currentExerciseIndex}-${currentSetIndex}-${timerKey}`}
                initialSeconds={currentExercise.restSeconds || 60}
                onComplete={finishRest}
                isRestTime={true}
                autoStart={true}
                size="lg"
                enableSound={true}
              />

              <div className="flex gap-2 mt-6">
                <Button variant="ghost" onClick={finishRest}>
                  <SkipForward className="h-4 w-4 mr-2" /> Skip Rest
                </Button>
              </div>
            </div>

            {/* Preview of next exercise or set */}
            <div className="mt-4 p-3 bg-background rounded-lg">
              <h4 className="text-sm font-medium mb-1">Coming Up Next</h4>
              <p>
                {currentExercise.name} - Set {currentSetIndex + 1} of {currentExercise.sets}
              </p>
              <p className="text-sm text-muted-foreground">{currentExercise.reps} reps</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workout Controls */}
      <div className="flex justify-between gap-4">
        <Button variant="ghost" className="flex-1" onClick={handleEndWorkout}>
          End Workout
        </Button>
        <Button variant="ghost" className="flex-1">
          <Save className="h-4 w-4 mr-2" /> Save Progress
        </Button>
      </div>
    </div>
  );
};

export default ActiveWorkout;
