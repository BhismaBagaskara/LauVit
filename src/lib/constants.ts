
import type { NavItem } from '@/lib/types';
import {
  LayoutDashboard,
  Dumbbell,
  ListChecks,
  BarChart3,
  Bot,
  Settings,
  LogIn,
  UserPlus,
  History
} from 'lucide-react';
import type { ExerciseVariation } from '@/lib/types';

export const APP_NAME = "Lauvit";

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Log Workout', href: '/log-workout', icon: Dumbbell },
  { title: 'Record Sesi Latihan', href: '/workout-history', icon: History },
  { title: 'Gym Plans', href: '/gym-plans', icon: ListChecks },
  // { title: 'Add Custom Exercise', href: '/custom-exercises', icon: PlusSquare }, // Removed
  { title: 'Body Composition', href: '/body-composition', icon: BarChart3 },
  { title: 'AI Trainer', href: '/ai-trainer', icon: Bot },
  { title: 'Settings', href: '/settings', icon: Settings },
];

export const AUTH_NAV_ITEMS: NavItem[] = [
  { title: 'Login', href: '/login', icon: LogIn },
  { title: 'Sign Up', href: '/signup', icon: UserPlus },
];

export const EXERCISE_VARIATIONS_OPTIONS: { label: string; value: ExerciseVariation }[] = [
  { label: "Cable", value: "Cable" },
  { label: "Cable Unilateral", value: "Cable Unilateral" },
  { label: "Machine", value: "Machine" },
  { label: "Machine Unilateral", value: "Machine Unilateral" },
  { label: "Dumbbell", value: "Dumbbell" },
  { label: "Barbell", value: "Barbell" },
];


export const MOCK_GYM_PLANS_DATA: any[] = [];
export const MOCK_PERSONAL_RECORDS_DATA: any[] = [];
export const MOCK_WORKOUT_LOGS_DATA: any[] = [];
