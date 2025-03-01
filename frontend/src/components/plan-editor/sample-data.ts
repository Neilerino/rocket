import { Exercise, ParameterType, Plan } from './types';

// Sample parameter types for testing
export const sampleParameterTypes: ParameterType[] = [
  { id: 'edge_size', name: 'Edge Size', dataType: 'number', defaultUnit: 'mm' },
  { id: 'added_weight', name: 'Added Weight', dataType: 'number', defaultUnit: 'kg' },
  { id: 'removed_weight', name: 'Removed Weight', dataType: 'number', defaultUnit: 'kg' },
];

// Sample exercises for testing
export const sampleExercises: Exercise[] = [
  { 
    id: 'ex1', 
    name: 'Campus Ladders', 
    description: 'Dynamic movement on campus rungs',
    variations: []
  },
  { 
    id: 'ex2', 
    name: 'Hangboard Repeaters', 
    description: 'Repeated hangs on a hangboard',
    variations: []
  },
  { 
    id: 'ex3', 
    name: '4x4s', 
    description: 'Four boulder problems, four times through',
    variations: []
  },
];

export const generateSamplePlanData = (): Plan => {
  return {
    id: 1,
    intervals: [
      {
        id: 1,
        name: 'Week 1',
        planId: '1',
        duration: '7 days',
        order: 1,
        groups: [
          {
            id: '1',
            name: 'Power Endurance',
            frequency: '2x',
            description: '',
            exercises: [
              {
                id: '1',
                exerciseId: 'ex3',
                groupId: '1',
                planIntervalId: '1',
                sets: 1,
                rpe: 8,
                rest: '00:01:00',
                parameters: {},
              },
            ],
          },
          {
            id: '2',
            name: 'Finger Strength',
            frequency: '1x',
            description: '',
            exercises: [
              {
                id: '2',
                exerciseId: 'ex2',
                groupId: '2',
                planIntervalId: '1',
                sets: 6,
                rpe: 7,
                rest: '00:03:00',
                parameters: {},
              },
            ],
          },
        ],
      },
      {
        id: 2,
        name: 'Week 2',
        planId: '1',
        duration: '7 days',
        order: 2,
        groups: [],
      },
    ],
  };
};
