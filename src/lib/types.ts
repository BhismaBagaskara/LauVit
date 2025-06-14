export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  // Add other user-specific fields if needed
}

export interface Exercise {
  id: string;
  name: string;
  variations?: string; // e.g., "Incline", "Decline"
  sets: number;
  reps: string; // e.g., "8-12" or "AMRAP"
  imageUrl?: string;
  instructions?: string;
  day?: string; // e.g., "Monday", "Push Day"
}

export interface ManualExercise extends Omit<Exercise, 'day' | 'sets' | 'reps'> {
  // Custom fields for manually added exercises if different
}

export interface GymPlan {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  exercises: Exercise[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutSet {
  reps: number;
  weight: number;
}

export interface LoggedExercise {
  exerciseId: string; // or name if not linked to a plan
  exerciseName: string;
  variations?: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: Date;
  workoutDay?: string; // e.g., "Push Day", "Leg Day"
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
