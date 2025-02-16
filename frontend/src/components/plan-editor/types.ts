export interface Exercise {
  id: number;
  name: string;
  description: string;
  variation: string;
  sets: number;
  reps: string;
  rest: string;
  rpe: number;
}

export interface Group {
  id: number;
  name: string;
  frequency: string;
  exercises: Exercise[];
}

export interface Interval {
  id: number;
  name: string;
  duration: string;
  order: number;
  groups: Group[];
}

export interface Plan {
  id: number;
  intervals: Interval[];
}
