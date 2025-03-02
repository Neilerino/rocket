import { Exercise, ParameterType, Plan, ExercisePrescription } from './types';

// Interface for exercise variants that can be used with ExpandableExerciseCard
export interface ExerciseVariant {
  id: string;
  name?: string;
  prescription: ExercisePrescription;
}

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

// Sample exercise variants for the expandable exercise card
export const sampleExerciseVariants: Record<string, ExerciseVariant[]> = {
  'ex1': [
    {
      id: 'var-ex1-1',
      name: 'Standard Campus Ladders',
      prescription: {
        id: 'pres-var-ex1-1',
        exerciseId: 'ex1',
        groupId: '',
        planIntervalId: '',
        sets: 3,
        reps: 5,
        rest: '00:02:00',
        rpe: 8,
        parameters: {},
        lockedParameters: {}
      }
    },
    {
      id: 'var-ex1-2',
      name: 'Campus Ladders with Drop Offs',
      prescription: {
        id: 'pres-var-ex1-2',
        exerciseId: 'ex1',
        groupId: '',
        planIntervalId: '',
        sets: 4,
        reps: 3,
        rest: '00:03:00',
        rpe: 9,
        parameters: {},
        lockedParameters: {}
      }
    }
  ],
  'ex2': [
    {
      id: 'var-ex2-1',
      name: 'Half Crimp Repeaters',
      prescription: {
        id: 'pres-var-ex2-1',
        exerciseId: 'ex2',
        groupId: '',
        planIntervalId: '',
        sets: 6,
        reps: 6,
        rest: '00:02:00',
        rpe: 7,
        parameters: {
          'edge_size': 20
        },
        lockedParameters: {}
      }
    },
    {
      id: 'var-ex2-2',
      name: 'Added Weight Repeaters',
      prescription: {
        id: 'pres-var-ex2-2',
        exerciseId: 'ex2',
        groupId: '',
        planIntervalId: '',
        sets: 4,
        reps: 5,
        rest: '00:03:00',
        rpe: 8,
        parameters: {
          'edge_size': 20
        },
        lockedParameters: {
          'added_weight': 10
        }
      }
    },
    {
      id: 'var-ex2-3',
      name: 'Small Edge Repeaters',
      prescription: {
        id: 'pres-var-ex2-3',
        exerciseId: 'ex2',
        groupId: '',
        planIntervalId: '',
        sets: 5,
        reps: 4,
        rest: '00:02:30',
        rpe: 9,
        parameters: {},
        lockedParameters: {
          'edge_size': 10
        }
      }
    }
  ],
  'ex3': [
    {
      id: 'var-ex3-1',
      name: 'Standard 4x4s',
      prescription: {
        id: 'pres-var-ex3-1',
        exerciseId: 'ex3',
        groupId: '',
        planIntervalId: '',
        sets: 1,
        rest: '00:01:00',
        rpe: 8,
        parameters: {},
        lockedParameters: {}
      }
    },
    {
      id: 'var-ex3-2',
      name: 'Hard 4x4s',
      prescription: {
        id: 'pres-var-ex3-2',
        exerciseId: 'ex3',
        groupId: '',
        planIntervalId: '',
        sets: 1,
        rest: '00:00:30',
        rpe: 9,
        parameters: {},
        lockedParameters: {}
      }
    }
  ]
};

export const generateSamplePlanData = (): Plan => {
  return {
    id: 1,
    name: 'Sample Training Plan',
    description: 'A sample training plan for demonstration',
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
            description: 'Focus on building power endurance with high-intensity exercises',
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
            description: 'Focus on building finger strength with hangboard exercises',
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
