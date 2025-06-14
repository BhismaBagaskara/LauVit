"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { LayoutDashboard, Target, CalendarDays, BarChart, TrendingUp, Sparkles } from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from "@/components/shared/GlassCard";
import { Calendar } from "@/components/ui/calendar";
import { MOCK_PERSONAL_RECORDS_DATA, MOCK_WORKOUT_LOGS_DATA } from "@/lib/constants";
import type { PersonalRecord, WorkoutSession } from "@/lib/types";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function PersonalRecordsCard({ records }: { records: PersonalRecord[] }) {
  return (
    <GlassCard className="animate-slide-in-up" style={{animationDelay: '0.2s'}}>
      <GlassCardHeader>
        <GlassCardTitle className="flex items-center"><Target className="mr-2 h-6 w-6 text-primary" />Personal Records</GlassCardTitle>
        <GlassCardDescription>Your best lifts and achievements.</GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent>
        {records.length > 0 ? (
          <ul className="space-y-3">
            {records.map((record, index) => (
              <li key={index} className="p-3 bg-card/50 rounded-md border border-white/10">
                <h4 className="font-semibold text-base">{record.exerciseName}</h4>
                <p className="text-sm">
                  Highest Weight: <span className="font-bold text-primary">{record.highestWeight}kg</span>
                  {record.maxRepsAtWeight && ` for ${record.maxRepsAtWeight.reps} reps at ${record.maxRepsAtWeight.weight}kg`}
                </p>
                <p className="text-xs text-muted-foreground">Achieved on: {format(record.date, "PPP")}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No personal records logged yet. Keep training!</p>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}

function WorkoutStreakCalendar({ workoutLogs }: { workoutLogs: WorkoutSession[] }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [workoutDays, setWorkoutDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    const daysWithWorkouts = new Set(
      workoutLogs.map(log => format(log.date, "yyyy-MM-dd"))
    );
    setWorkoutDays(daysWithWorkouts);
  }, [workoutLogs]);

  return (
    <GlassCard className="animate-slide-in-up" style={{animationDelay: '0.4s'}}>
      <GlassCardHeader>
        <GlassCardTitle className="flex items-center"><CalendarDays className="mr-2 h-6 w-6 text-primary" />Workout Streak</GlassCardTitle>
        <GlassCardDescription>Visualize your consistency.</GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent className="flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md"
          modifiers={{
            workoutDay: (day) => workoutDays.has(format(day, "yyyy-MM-dd")),
          }}
          modifiersStyles={{
            workoutDay: {
              color: 'hsl(var(--primary-foreground))',
              backgroundColor: 'hsl(var(--primary))',
              borderRadius: 'var(--radius)',
            }
          }}
        />
      </GlassCardContent>
    </GlassCard>
  );
}

export default function DashboardPage() {
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    // In a real app, fetch this data
    setPersonalRecords(MOCK_PERSONAL_RECORDS_DATA);
    setWorkoutLogs(MOCK_WORKOUT_LOGS_DATA);
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Your fitness journey at a glance."
        icon={LayoutDashboard}
        actions={
          <Link href="/log-workout" passHref>
            <Button className="btn-animated"><Dumbbell className="mr-2 h-4 w-4" />Log New Workout</Button>
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <GlassCard className="lg:col-span-1 animate-slide-in-up" style={{animationDelay: '0.1s'}}>
          <GlassCardHeader>
            <GlassCardTitle className="flex items-center">
              <BarChart className="mr-2 h-6 w-6 text-primary" />
              Total Workouts
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-4xl font-bold">{workoutLogs.length}</p>
            <p className="text-sm text-muted-foreground">sessions logged</p>
          </GlassCardContent>
        </GlassCard>
        
        <GlassCard className="lg:col-span-1 animate-slide-in-up" style={{animationDelay: '0.2s'}}>
          <GlassCardHeader>
            <GlassCardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-6 w-6 text-primary" />
              Active Plan
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-2xl font-semibold">Starting Strength</p>
            <p className="text-sm text-muted-foreground">Current focus: Building foundational strength</p>
            <Link href="/gym-plans" passHref>
              <Button variant="link" className="px-0 text-primary">View Plans</Button>
            </Link>
          </GlassCardContent>
        </GlassCard>

        <GlassCard className="lg:col-span-1 animate-slide-in-up" style={{animationDelay: '0.3s'}}>
          <GlassCardHeader>
            <GlassCardTitle className="flex items-center">
              <Sparkles className="mr-2 h-6 w-6 text-primary" />
              AI Insights
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-sm text-muted-foreground">Ready for personalized advice?</p>
             <Link href="/ai-trainer" passHref>
              <Button variant="secondary" className="mt-2 btn-animated">Consult AI Trainer</Button>
            </Link>
          </GlassCardContent>
        </GlassCard>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <PersonalRecordsCard records={personalRecords} />
        <WorkoutStreakCalendar workoutLogs={workoutLogs} />
      </div>
    </div>
  );
}
