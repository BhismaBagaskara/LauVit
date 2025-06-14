
import type { NavItem } from '@/lib/types';
import {
  LayoutDashboard,
  Dumbbell,
  ListChecks,
  PlusSquare,
  BarChart3,
  Bot,
  Settings,
  LogIn,
  UserPlus,
  History // Added History icon
} from 'lucide-react';

export const APP_NAME = "Lauvit";

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Log Workout', href: '/log-workout', icon: Dumbbell },
  { title: 'Record Sesi Latihan', href: '/workout-history', icon: History }, // New menu item
  { title: 'Gym Plans', href: '/gym-plans', icon: ListChecks },
  { title: 'Add Custom Exercise', href: '/custom-exercises', icon: PlusSquare },
  { title: 'Body Composition', href: '/body-composition', icon: BarChart3 },
  { title: 'AI Trainer', href: '/ai-trainer', icon: Bot },
  { title: 'Settings', href: '/settings', icon: Settings },
];

export const AUTH_NAV_ITEMS: NavItem[] = [
  { title: 'Login', href: '/login', icon: LogIn },
  { title: 'Sign Up', href: '/signup', icon: UserPlus },
];

export const MOCK_EXERCISES_DATA = [
  { id: 'ex1', name: 'Bench Press', variations: 'Flat', sets: 3, reps: '8-12', imageUrl: 'https://placehold.co/300x200.png', instructions: 'Lie on a bench, lower the bar to your chest, and press up.', day: 'Push Day' },
  { id: 'ex2', name: 'Squat', variations: 'Back Squat', sets: 4, reps: '5', imageUrl: 'https://placehold.co/300x200.png', instructions: 'Place the bar on your upper back, squat down until thighs are parallel to the floor.', day: 'Leg Day' },
  { id: 'ex3', name: 'Deadlift', variations: 'Conventional', sets: 1, reps: '5', imageUrl: 'https://placehold.co/300x200.png', instructions: 'Lift the bar from the floor while keeping your back straight.', day: 'Pull Day' },
  { id: 'ex4', name: 'Overhead Press', variations: 'Standing', sets: 3, reps: '8-10', imageUrl: 'https://placehold.co/300x200.png', instructions: 'Press the bar overhead from shoulder height.', day: 'Push Day' },
];

export const MOCK_GYM_PLANS_DATA = [
  { id: 'plan1', name: 'Starting Strength', description: 'A beginner strength program.', isActive: true, exercises: MOCK_EXERCISES_DATA.slice(0,2), createdAt: new Date(), updatedAt: new Date() },
  { id: 'plan2', name: 'PPL Routine', description: 'Push Pull Legs split for intermediates.', isActive: false, exercises: MOCK_EXERCISES_DATA, createdAt: new Date(), updatedAt: new Date() },
];

export const MOCK_PERSONAL_RECORDS_DATA = [
  { exerciseName: 'Bench Press', highestWeight: 100, maxRepsAtWeight: { reps: 5, weight: 90 }, date: new Date(2023, 10, 15) },
  { exerciseName: 'Squat', highestWeight: 140, date: new Date(2023, 11, 1) },
];

export const MOCK_WORKOUT_LOGS_DATA = [
    { id: 'log1', date: new Date(Date.now() - 86400000 * 2), workoutDay: 'Push Day A', loggedExercises: [ { exerciseId: 'ex1', exerciseName: 'Bench Press', sets: [{reps: 8, weight: 80}, {reps: 7, weight: 80}, {reps: 6, weight: 80}], notes: 'Felt good'}]},
    { id: 'log2', date: new Date(Date.now() - 86400000 * 1), workoutDay: 'Pull Day A', loggedExercises: [ { exerciseId: 'ex3', exerciseName: 'Deadlift', sets: [{reps: 5, weight: 120}], notes: 'Heavy but solid'}]},
    { id: 'log3', date: new Date(), workoutDay: 'Leg Day A', loggedExercises: [ { exerciseId: 'ex2', exerciseName: 'Squat', sets: [{reps: 5, weight: 100}, {reps: 5, weight: 100}, {reps: 5, weight: 100}], notes: 'Focused on depth'}]}
];
