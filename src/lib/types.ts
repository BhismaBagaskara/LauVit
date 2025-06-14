export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  // Add other user-specific fields if needed
}

export const EXERCISE_VARIATIONS = [
  "Cable", "Cable Unilateral", "Machine", "Machine Unilateral", "Dumbbell", "Barbell"
] as const;
export type ExerciseVariation = typeof EXERCISE_VARIATIONS[number];

export interface Exercise {
  id: string; // For react-hook-form key
  name: string;
  variation: ExerciseVariation;
  sets: number;
  reps: string; // e.g., "8-12" or "AMRAP"
}

export interface Day {
  id: string; // For react-hook-form key
  name: string; // e.g., "Day 1", "Push Day"
  exercises: Exercise[];
}

export interface GymPlan {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  days: Day[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ManualExercise {
  // This type is no longer actively used with the removal of custom exercises page
  // but kept for potential reference or future use if functionality is re-added.
  // It should be reviewed if custom exercises are re-introduced.
  id: string;
  name: string;
  variations?: string;
  imageUrl?: string;
  instructions?: string;
}


export interface WorkoutSet {
  reps: number;
  weight: number;
}

export interface LoggedExercise {
  exerciseId: string; // Corresponds to Exercise.id from the plan
  exerciseName: string;
  variation?: string; // Will store the selected ExerciseVariation as string
  sets: WorkoutSet[];
  notes?: string; // Could include target sets/reps from plan
}

export interface WorkoutSession {
  id: string;
  date: Date;
  workoutDay?: string; // e.g., "Push Day", "Leg Day" from Plan Day Name
  loggedExercises: LoggedExercise[];
  notes?: string; // Overall session notes
}

export interface PersonalRecord {
  exerciseName: string;
  highestWeight: number;
  maxRepsAtWeight?: { reps: number; weight: number };
  date: Date;
}

export interface BodyCompositionRecord {
  id: string;
  date: Date;
  weightKg: number;
  heightCm: number;
  bmi?: number;
  muscleMassKg?: number; // Simplified, actual calculation might be complex
  notes?: string;
}

export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
};
