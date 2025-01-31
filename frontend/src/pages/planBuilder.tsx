import { useState } from 'react';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

const PlanBuilder = () => {
  const presetExercises = [
    'Campus Board Repeaters',
    'Max Hangs',
    '4x4s on Wall',
    'Limit Bouldering',
    'Power Endurance Circuits',
    'Core Workout',
    'Pull-ups',
  ];

  const [planName, setPlanName] = useState('');
  const [days, setDays] = useState([]);
  const [newExercise, setNewExercise] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);

  const addDay = () => {
    const newDay = {
      id: Date.now(),
      name: `Day ${days.length + 1}`,
      exercises: [],
    };
    setDays([...days, newDay]);
    setExpandedDay(newDay.id);
  };

  const removeDay = (dayId) => {
    setDays(days.filter((day) => day.id !== dayId));
  };

  const updateDayName = (dayId, newName) => {
    setDays(days.map((day) => (day.id === dayId ? { ...day, name: newName } : day)));
  };

  const addExercise = (dayId, exercise) => {
    setDays(
      days.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            exercises: [...day.exercises, { name: exercise, sets: 3, reps: 5 }],
          };
        }
        return day;
      }),
    );
    setNewExercise('');
    setShowPresets(false);
  };

  const removeExercise = (dayId, index) => {
    setDays(
      days.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            exercises: day.exercises.filter((_, i) => i !== index),
          };
        }
        return day;
      }),
    );
  };

  const updateExercise = (dayId, exerciseIndex, field, value) => {
    setDays(
      days.map((day) => {
        if (day.id === dayId) {
          const updatedExercises = [...day.exercises];
          updatedExercises[exerciseIndex] = {
            ...updatedExercises[exerciseIndex],
            [field]: value,
          };
          return { ...day, exercises: updatedExercises };
        }
        return day;
      }),
    );
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Plan Name */}
      <input
        type="text"
        value={planName}
        onChange={(e) => setPlanName(e.target.value)}
        placeholder="Plan Name (e.g., Strength Focus)"
        className="w-full p-3 mb-4 border rounded-lg text-lg"
      />

      {/* Days */}
      <div className="space-y-4 mb-4">
        {days.map((day) => (
          <div key={day.id} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-3 flex items-center justify-between">
              <input
                type="text"
                value={day.name}
                onChange={(e) => updateDayName(day.id, e.target.value)}
                className="bg-transparent font-medium flex-1"
                placeholder="Day Name"
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => removeDay(day.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                  className="p-2 hover:bg-gray-200 rounded-full"
                >
                  {expandedDay === day.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {expandedDay === day.id && (
              <div className="p-3 space-y-3">
                {/* Exercises for this day */}
                {day.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                  >
                    <button
                      onClick={() => removeExercise(day.id, index)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                    >
                      <X size={16} />
                    </button>

                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExercise(day.id, index, 'name', e.target.value)}
                      className="flex-1 bg-transparent"
                    />

                    <input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(day.id, index, 'sets', e.target.value)}
                      className="w-16 p-1 text-center border rounded"
                      placeholder="Sets"
                    />

                    <input
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(day.id, index, 'reps', e.target.value)}
                      className="w-16 p-1 text-center border rounded"
                      placeholder="Reps"
                    />
                  </div>
                ))}

                {/* Add Exercise Interface */}
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newExercise}
                      onChange={(e) => setNewExercise(e.target.value)}
                      placeholder="Add new exercise..."
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <button
                      onClick={() => newExercise && addExercise(day.id, newExercise)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <button
                    onClick={() => setShowPresets(!showPresets)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    {showPresets ? 'Hide preset exercises' : 'Show preset exercises'}
                  </button>

                  {showPresets && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-2">
                        {presetExercises.map((exercise, index) => (
                          <button
                            key={index}
                            onClick={() => addExercise(day.id, exercise)}
                            className="text-left p-2 hover:bg-gray-100 rounded"
                          >
                            {exercise}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Day Button */}
      <button
        onClick={addDay}
        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500"
      >
        + Add Day
      </button>

      {/* Save Plan Button */}
      {planName && days.length > 0 && (
        <button
          onClick={() => {
            // Save plan logic here
            console.log({ name: planName, days });
          }}
          className="w-full mt-4 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Save Plan
        </button>
      )}
    </div>
  );
};

export default PlanBuilder;
