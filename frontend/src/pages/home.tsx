import { useState } from 'react';
import { Dumbbell, Plus, ChevronRight, Calendar, Copy } from 'lucide-react';

const Home = () => {
  // Mock data for existing plans - would normally come from a database
  const [savedPlans] = useState([
    {
      id: 1,
      name: 'Strength Focus',
      lastUsed: '2024-12-28',
      daysCount: 4,
      type: 'Strength',
    },
    {
      id: 2,
      name: 'Endurance Block',
      lastUsed: '2024-12-27',
      daysCount: 3,
      type: 'Endurance',
    },
    {
      id: 3,
      name: 'Power Project',
      lastUsed: '2024-12-26',
      daysCount: 3,
      type: 'Power',
    },
  ]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Training Plans</h1>
          <p className="text-gray-600">Manage and create your climbing workouts</p>
        </div>
        <button
          onClick={() => {
            /* Navigate to plan builder */
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>New Plan</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => {
            /* Navigate to today's workout */
          }}
          className="p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <Calendar className="text-purple-600" size={24} />
            <div className="text-left">
              <h3 className="font-semibold">Today's Workout</h3>
              <p className="text-sm text-gray-600">Continue your training</p>
            </div>
          </div>
          <ChevronRight className="text-purple-600" size={20} />
        </button>

        <button
          onClick={() => {
            /* Navigate to plan builder */
          }}
          className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <Plus className="text-blue-600" size={24} />
            <div className="text-left">
              <h3 className="font-semibold">Create New Plan</h3>
              <p className="text-sm text-gray-600">Build a custom training plan</p>
            </div>
          </div>
          <ChevronRight className="text-blue-600" size={20} />
        </button>
      </div>

      {/* Saved Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Plans</h2>
        <div className="space-y-3">
          {savedPlans.map((plan) => (
            <div
              key={plan.id}
              className="p-4 bg-white border rounded-lg hover:border-blue-500 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Dumbbell size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{plan.name}</h3>
                    <p className="text-sm text-gray-500">
                      {plan.daysCount} days • Last used{' '}
                      {new Date(plan.lastUsed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 hover:bg-gray-100 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      /* Copy plan logic */
                    }}
                  >
                    <Copy size={16} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <ChevronRight size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {savedPlans.length === 0 && (
        <div className="text-center py-12">
          <Dumbbell size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Plans Yet</h3>
          <p className="text-gray-600 mb-4">Create your first training plan to get started</p>
          <button
            onClick={() => {
              /* Navigate to plan builder */
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg inline-flex items-center space-x-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            <span>New Plan</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
