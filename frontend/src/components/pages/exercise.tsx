import { useState } from 'react';
import { Check, X, ChevronDown, MessageSquare, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const TrainingTracker = () => {
  const [activeView, setActiveView] = useState('week');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const weekSchedule = [
    {
      day: 'Monday',
      workoutType: 'Strength',
      workouts: [
        {
          id: 1,
          title: 'Morning Strength Session',
          exercises: [
            { 
              id: 1, 
              name: 'Campus Board Repeaters', 
              completed: false, 
              rpe: null,
              notes: '',
              progress: [],
              showNotes: false,
              showProgress: false
            },
            { 
              id: 2, 
              name: 'Max Hangs', 
              completed: false, 
              rpe: null,
              notes: '',
              progress: [],
              showNotes: false,
              showProgress: false
            }
          ],
          expanded: false
        }
      ]
    },
    {
      day: 'Tuesday',
      workoutType: 'Power Endurance',
      workouts: [
        {
          id: 2,
          title: 'Circuit Training',
          exercises: [
            { 
              id: 3, 
              name: '4x4s on Wall', 
              completed: false, 
              rpe: null,
              notes: '',
              progress: [],
              showNotes: false,
              showProgress: false
            }
          ],
          expanded: false
        }
      ]
    },
    {
      day: 'Wednesday',
      workoutType: 'Rest',
      workouts: []
    },
    {
      day: 'Thursday',
      workoutType: 'Technique',
      workouts: [
        {
          id: 3,
          title: 'Movement Skills',
          exercises: [
            { 
              id: 4, 
              name: 'Silent Feet Drills', 
              completed: false, 
              rpe: null,
              notes: '',
              progress: [],
              showNotes: false,
              showProgress: false
            },
            { 
              id: 5, 
              name: 'Rooting Practice', 
              completed: false, 
              rpe: null,
              notes: '',
              progress: [],
              showNotes: false,
              showProgress: false
            }
          ],
          expanded: false
        }
      ]
    },
    {
      day: 'Friday',
      workoutType: 'Power',
      workouts: [
        {
          id: 4,
          title: 'Explosive Training',
          exercises: [
            { 
              id: 6, 
              name: 'Limit Bouldering', 
              completed: false, 
              rpe: null,
              notes: '',
              progress: [],
              showNotes: false,
              showProgress: false
            }
          ],
          expanded: false
        }
      ]
    },
    {
      day: 'Saturday',
      workoutType: 'Outdoor Climbing',
      workouts: [
        {
          id: 5,
          title: 'Project Work',
          exercises: [
            { 
              id: 7, 
              name: 'Project Attempts', 
              completed: false, 
              rpe: null,
              notes: '',
              progress: [],
              showNotes: false,
              showProgress: false
            }
          ],
          expanded: false
        }
      ]
    },
    {
      day: 'Sunday',
      workoutType: 'Rest',
      workouts: []
    }
  ];

  const WeeklyView = () => (
    <div className="space-y-2">
      {weekSchedule.map((day, index) => (
        <Card 
          key={index} 
          className={`cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedDay === index ? 'border-blue-500 border-2' : ''
          }`}
          onClick={() => {
            if (day.workouts.length > 0) {
              setSelectedDay(index);
              setActiveView('workout');
            }
          }}
        >
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{day.day}</h3>
              <p className={`text-sm ${
                day.workoutType === 'Rest' ? 'text-gray-400' : 'text-blue-500'
              }`}>
                {day.workoutType}
              </p>
            </div>
            {day.workouts.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {day.workouts.reduce((acc, workout) => 
                    acc + workout.exercises.length, 0
                  )} exercises
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  const WorkoutView = () => {
    if (selectedDay === null) return null;
    const dayData = weekSchedule[selectedDay];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{dayData.day}</h2>
            <p className="text-blue-500">{dayData.workoutType}</p>
          </div>
          <button 
            onClick={() => setActiveView('week')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Calendar size={20} />
          </button>
        </div>

        {dayData.workouts.map(workout => (
          <Card key={workout.id} className="bg-white shadow-sm">
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold">
                {workout.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                {workout.exercises.map(exercise => (
                  <div key={exercise.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {}}
                        className={`p-1 rounded-full ${
                          exercise.completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200'
                        }`}
                      >
                        {exercise.completed ? <Check size={16} /> : <X size={16} />}
                      </button>
                      <span className={exercise.completed ? 'line-through text-gray-500' : ''}>
                        {exercise.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="RPE"
                        value={exercise.rpe || ''}
                        className="w-16 p-1 text-center border rounded"
                      />
                      <button className="p-1 rounded-full bg-gray-200">
                        <MessageSquare size={16} />
                      </button>
                      <button className="p-1 rounded-full bg-gray-200">
                        <TrendingUp size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {activeView === 'week' ? <WeeklyView /> : <WorkoutView />}
    </div>
  );
};

export default TrainingTracker;