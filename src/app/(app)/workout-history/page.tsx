
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from "@/components/shared/GlassCard";
import { History, CalendarDays, ListOrdered, Edit3, Trash2 } from "lucide-react";
import { MOCK_WORKOUT_LOGS_DATA } from "@/lib/constants";
import type { WorkoutSession, LoggedExercise, WorkoutSet } from "@/lib/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function WorkoutHistoryPage() {
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, fetch this data
    setWorkoutSessions(MOCK_WORKOUT_LOGS_DATA);
  }, []);

  const handleDeleteSession = (sessionId: string) => {
    // Simulate deleting a session
    setWorkoutSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
    toast({ title: "Session Deleted", description: "The workout session has been removed from your history." });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Record Sesi Latihan"
        description="Lihat kembali semua sesi latihan yang telah Anda catat."
        icon={History}
      />

      {workoutSessions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {workoutSessions.slice().reverse().map((session, index) => ( // Show newest first
            <GlassCard key={session.id} className="animate-slide-in-up flex flex-col" style={{animationDelay: `${index * 0.05}s`}}>
              <GlassCardHeader>
                <div className="flex justify-between items-start">
                  <GlassCardTitle className="text-xl">
                    {session.workoutDay || "Sesi Latihan Umum"}
                  </GlassCardTitle>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <CalendarDays className="mr-1 h-3 w-3" />
                    {format(new Date(session.date), "PPP")}
                  </span>
                </div>
                {session.notes && <GlassCardDescription>Catatan Sesi: {session.notes}</GlassCardDescription>}
              </GlassCardHeader>
              <GlassCardContent className="flex-grow space-y-3">
                <h4 className="font-semibold text-sm flex items-center"><ListOrdered className="mr-2 h-4 w-4 text-primary"/>Latihan Tercatat:</h4>
                {session.loggedExercises.length > 0 ? (
                  <ul className="space-y-2 text-xs">
                    {session.loggedExercises.map((exercise, exIndex) => (
                      <li key={exIndex} className="p-2 bg-card/50 rounded-md border border-white/10">
                        <p className="font-medium">{exercise.exerciseName} {exercise.variations && `(${exercise.variations})`}</p>
                        <ul className="list-disc list-inside pl-2 text-muted-foreground">
                          {exercise.sets.map((set, setIndex) => (
                            <li key={setIndex}>{set.reps} reps @ {set.weight}kg</li>
                          ))}
                        </ul>
                        {exercise.notes && <p className="mt-1 text-xs italic">Catatan Latihan: {exercise.notes}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">Tidak ada latihan spesifik yang dicatat untuk sesi ini.</p>
                )}
              </GlassCardContent>
               <GlassCardContent className="pt-0 flex gap-2"> {/* Changed to GlassCardContent for consistent padding */}
                {/* Edit button could link to log-workout page with prefilled data in a real scenario */}
                {/* <Link href={`/log-workout?edit=${session.id}`} passHref>
                  <Button variant="outline" size="sm" className="btn-animated flex-1"><Edit3 className="mr-2 h-4 w-4" />Edit</Button>
                </Link> */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="btn-animated flex-1"><Trash2 className="mr-2 h-4 w-4" />Hapus Sesi</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini akan menghapus sesi latihan pada tanggal {format(new Date(session.date), "PPP")} secara permanen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteSession(session.id)}>Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard>
          <GlassCardContent className="pt-6 text-center">
            <p className="text-lg text-muted-foreground">Belum ada sesi latihan yang dicatat.</p>
            <Link href="/log-workout" passHref>
              <Button className="mt-4 btn-animated">Catat Sesi Latihan Pertama Anda</Button>
            </Link>
          </GlassCardContent>
        </GlassCard>
      )}
    </div>
  );
}
