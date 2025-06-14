
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Dumbbell, CalendarPlus, StickyNote, PlusCircle, Trash2, Save, Loader2 } from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/shared/DatePicker"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import type { LoggedExercise, WorkoutSet, GymPlan, Exercise as PlanExercise } from "@/lib/types";
import { APP_NAME } from "@/lib/constants";
import { useEffect, useState } from "react";

const workoutSetSchema = z.object({
  reps: z.coerce.number().min(0, "Reps must be a non-negative number"),
  weight: z.coerce.number().min(0, "Weight must be a non-negative number"),
});

const loggedExerciseSchema = z.object({
  exerciseId: z.string().optional(), // Store ID from plan if available
  exerciseName: z.string().min(1, "Exercise name is required"),
  variations: z.string().optional(),
  sets: z.array(workoutSetSchema).min(1, "Add at least one set"),
  notes: z.string().optional(),
});

const workoutSessionSchema = z.object({
  date: z.date({ required_error: "Date is required" }),
  workoutDay: z.string().optional(),
  loggedExercises: z.array(loggedExerciseSchema).min(1, "Log at least one exercise"),
  notes: z.string().optional(),
});

type WorkoutSessionFormValues = z.infer<typeof workoutSessionSchema>;

export default function LogWorkoutPage() {
  const { toast } = useToast();
  const [availableExercises, setAvailableExercises] = useState<{label: string, value: string}[]>([]);
  const [gymPlans, setGymPlans] = useState<GymPlan[]>([]);
  const [activePlan, setActivePlan] = useState<GymPlan | null>(null);
  const [workoutDayOptions, setWorkoutDayOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    // Load gym plans from localStorage
    if (typeof window !== 'undefined') {
      const storedPlans = localStorage.getItem(`${APP_NAME}_gymPlans`);
      if (storedPlans) {
        const parsedPlans: GymPlan[] = JSON.parse(storedPlans);
        setGymPlans(parsedPlans);
        const currentActivePlan = parsedPlans.find(p => p.isActive) || null;
        setActivePlan(currentActivePlan);

        if (currentActivePlan) {
          const uniqueDays = Array.from(new Set(currentActivePlan.exercises.map(ex => ex.day).filter(Boolean as (value: any) => value is string)));
          setWorkoutDayOptions(uniqueDays.map(day => ({ label: day, value: day })));
        } else {
          setWorkoutDayOptions([]);
        }
      }
    }
     // Simulate fetching user's custom exercises (if any) or general exercise list
    // For now, it remains empty as MOCK_EXERCISES_DATA is empty.
    // const exerciseOptions = MOCK_EXERCISES_DATA.map(ex => ({label: `${ex.name} ${ex.variations ? `(${ex.variations})` : ''}`, value: ex.id}));
    // setAvailableExercises(exerciseOptions);
  }, []);

  const form = useForm<WorkoutSessionFormValues>({
    resolver: zodResolver(workoutSessionSchema),
    defaultValues: {
      date: new Date(),
      loggedExercises: [{ exerciseName: "", sets: [{ reps: 0, weight: 0 }] }],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "loggedExercises",
  });

  const onSubmit = (data: WorkoutSessionFormValues) => {
    console.log("Workout Logged:", data);
    // Here you would typically save the data to localStorage or a backend
    // For now, we'll just show a toast and reset the form.
    const workoutHistoryKey = `${APP_NAME}_workoutHistory`;
    let history: WorkoutSessionFormValues[] = [];
    if (typeof window !== 'undefined') {
        const storedHistory = localStorage.getItem(workoutHistoryKey);
        if (storedHistory) {
            history = JSON.parse(storedHistory);
        }
    }
    // Add new session with an ID (for future editing/deleting)
    const newSession = { ...data, id: `sess_${Date.now()}` };
    history.push(newSession);
    if (typeof window !== 'undefined') {
        localStorage.setItem(workoutHistoryKey, JSON.stringify(history));
    }

    toast({
      title: "Workout Logged!",
      description: `Session for ${data.workoutDay || 'General Workout'} on ${formatDate(data.date)} saved.`,
    });
    form.reset({
      date: new Date(),
      workoutDay: "",
      loggedExercises: [{ exerciseName: "", sets: [{ reps: 0, weight: 0 }] }],
      notes: "",
    });
    // Reset workout day options if needed, or re-evaluate active plan
    if (activePlan) {
        const uniqueDays = Array.from(new Set(activePlan.exercises.map(ex => ex.day).filter(Boolean as (value: any) => value is string)));
        setWorkoutDayOptions(uniqueDays.map(day => ({ label: day, value: day })));
    } else {
        setWorkoutDayOptions([]);
    }
  };

  const formatDate = (date: Date): string => {
    try {
        return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(date);
    } catch (e) {
        return date.toLocaleDateString();
    }
  };

  const handleWorkoutDayChange = (selectedDayValue: string) => {
    // form.setValue("workoutDay", selectedDayValue); // This is handled by Controller's field.onChange

    if (activePlan && selectedDayValue) {
      const exercisesForDay: PlanExercise[] = activePlan.exercises.filter(ex => ex.day === selectedDayValue);
      
      const newLoggedExercises: LoggedExercise[] = exercisesForDay.map(planExercise => ({
        exerciseId: planExercise.id,
        exerciseName: planExercise.name,
        variations: planExercise.variations || "",
        sets: Array.from({ length: planExercise.sets || 1 }, () => ({ reps: 0, weight: 0 })),
        notes: `Target: ${planExercise.sets} sets of ${planExercise.reps}. ${planExercise.instructions ? `Instructions: ${planExercise.instructions.substring(0,50)}...` : ''}`,
      }));
      
      form.setValue("loggedExercises", newLoggedExercises.length > 0 ? newLoggedExercises : [{ exerciseName: "", sets: [{ reps: 0, weight: 0 }] }]);
    } else {
      form.setValue("loggedExercises", [{ exerciseName: "", sets: [{ reps: 0, weight: 0 }] }]);
    }
  };

  const addExercise = () => {
    append({ exerciseName: "", sets: [{ reps: 0, weight: 0 }], notes: "" });
  };

  const addSet = (exerciseIndex: number) => {
    const currentSets = form.getValues(`loggedExercises.${exerciseIndex}.sets`);
    const newSets: WorkoutSet[] = [...currentSets, { reps: 0, weight: 0 }];
    // @ts-ignore
    update(exerciseIndex, { ...form.getValues(`loggedExercises.${exerciseIndex}`), sets: newSets });
 };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const currentSets = form.getValues(`loggedExercises.${exerciseIndex}.sets`);
    if (currentSets.length > 1) {
      const newSets = currentSets.filter((_, i) => i !== setIndex);
      // @ts-ignore
      update(exerciseIndex, { ...form.getValues(`loggedExercises.${exerciseIndex}`), sets: newSets });
    } else {
      toast({variant: "destructive", title: "Cannot remove", description: "Each exercise must have at least one set."})
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Log Workout Session"
        description="Record your performance and track your progress."
        icon={Dumbbell}
      />
      <GlassCard>
        <GlassCardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <Label className="flex items-center"><CalendarPlus className="mr-2 h-4 w-4 text-primary" />Date</Label>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    {form.formState.errors.date && <p className="text-sm text-destructive mt-1">{form.formState.errors.date.message}</p>}
                  </FormItem>
                )}
              />
              <Controller
                control={form.control}
                name="workoutDay"
                render={({ field }) => (
                    <FormItem>
                    <Label className="flex items-center"><StickyNote className="mr-2 h-4 w-4 text-primary" />Workout Day</Label>
                    <Select
                        onValueChange={(value) => {
                        field.onChange(value);
                        handleWorkoutDayChange(value);
                        }}
                        value={field.value || ""}
                        disabled={!activePlan || workoutDayOptions.length === 0}
                    >
                        <SelectTrigger className="input-animated">
                        <SelectValue placeholder="Select day from active plan or leave blank" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="">General Workout (No Plan Day)</SelectItem>
                        {activePlan && workoutDayOptions.length > 0 ? (
                            workoutDayOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                            ))
                        ) : (
                           null // Placeholder is handled by SelectValue if no options and no active plan
                        )}
                        </SelectContent>
                    </Select>
                    {!activePlan && <p className="text-xs text-muted-foreground mt-1">No active gym plan to select workout days from.</p>}
                    {activePlan && workoutDayOptions.length === 0 && <p className="text-xs text-muted-foreground mt-1">Active plan has no defined workout days.</p>}
                    {form.formState.errors.workoutDay && <p className="text-sm text-destructive mt-1">{form.formState.errors.workoutDay.message}</p>}
                    </FormItem>
                )}
                />
            </div>

            {fields.map((field, exerciseIndex) => (
              <GlassCard key={field.id} variant="opaque" className="p-4 space-y-4 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                  onClick={() => fields.length > 1 ? remove(exerciseIndex) : toast({variant: "destructive", title: "Cannot remove", description: "Must log at least one exercise."})}
                  aria-label="Remove exercise"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <Label>Exercise Name</Label>
                     <Controller
                        name={`loggedExercises.${exerciseIndex}.exerciseName`}
                        control={form.control}
                        render={({ field: selectField }) => (
                          <Select 
                            onValueChange={(value) => {
                                if (value === 'custom') {
                                    selectField.onChange(''); 
                                    // TODO: Implement dialog for custom exercise input if needed
                                    toast({title: "Custom Exercise", description: "Type the name of your custom exercise."})
                                } else {
                                    selectField.onChange(value);
                                }
                            }} 
                            value={selectField.value}
                           >
                            <SelectTrigger className="input-animated">
                              {/* Display selected value, or allow typing if it's also an input */}
                              <SelectValue placeholder="Select or type exercise" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* Populate with actual available exercises if MOCK_EXERCISES_DATA is replaced */}
                              {availableExercises.map(ex => (
                                <SelectItem key={ex.value} value={ex.label}>{ex.label}</SelectItem>
                              ))}
                               <SelectItem value="custom">Type Custom Exercise Name...</SelectItem> 
                            </SelectContent>
                          </Select>
                        )}
                      />
                     {/* Fallback Input for direct typing, used if Select is for choosing from a list only */}
                     <Input 
                        placeholder="Type or confirm exercise name" 
                        {...form.register(`loggedExercises.${exerciseIndex}.exerciseName`)} 
                        className="input-animated mt-1" 
                      />
                    {form.formState.errors.loggedExercises?.[exerciseIndex]?.exerciseName && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.loggedExercises?.[exerciseIndex]?.exerciseName?.message}</p>
                    )}
                  </FormItem>
                  <FormItem>
                    <Label>Variations (Optional)</Label>
                    <Input placeholder="e.g., Incline, Close Grip" {...form.register(`loggedExercises.${exerciseIndex}.variations`)} className="input-animated" />
                  </FormItem>
                </div>
                
                <div className="space-y-2">
                  <Label>Sets</Label>
                  {form.getValues(`loggedExercises.${exerciseIndex}.sets`).map((_set, setIndex) => (
                    <div key={`${field.id}-set-${setIndex}`} className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Reps"
                        {...form.register(`loggedExercises.${exerciseIndex}.sets.${setIndex}.reps`)}
                        className="input-animated w-1/3"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Weight (kg)"
                        {...form.register(`loggedExercises.${exerciseIndex}.sets.${setIndex}.weight`)}
                        className="input-animated w-1/3"
                      />
                      <span className="w-1/3 text-sm text-muted-foreground text-center">Set {setIndex + 1}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeSet(exerciseIndex, setIndex)} aria-label="Remove set">
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addSet(exerciseIndex)} className="btn-animated">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Set
                  </Button>
                   {form.formState.errors.loggedExercises?.[exerciseIndex]?.sets?.message && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.loggedExercises?.[exerciseIndex]?.sets?.message}</p>
                    )}
                     {form.formState.errors.loggedExercises?.[exerciseIndex]?.sets?.root?.message && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.loggedExercises?.[exerciseIndex]?.sets?.root?.message}</p>
                    )}
                </div>

                <FormItem>
                  <Label>Exercise Notes (Optional)</Label>
                  <Textarea placeholder="e.g., Target: 3 sets of 8-12 reps. Felt strong, focus on form" {...form.register(`loggedExercises.${exerciseIndex}.notes`)} className="input-animated" />
                </FormItem>
              </GlassCard>
            ))}

            <Button type="button" variant="secondary" onClick={addExercise} className="btn-animated">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Another Exercise
            </Button>

            <FormItem>
              <Label>Overall Session Notes (Optional)</Label>
              <Textarea placeholder="General notes about the session" {...form.register("notes")} className="input-animated" />
            </FormItem>

            <Button type="submit" className="w-full btn-animated md:w-auto" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Workout
            </Button>
            {form.formState.errors.loggedExercises?.root?.message && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.loggedExercises?.root?.message}</p>
            )}
             {typeof form.formState.errors.loggedExercises === 'string' && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.loggedExercises}</p>
            )}
          </form>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}

export function FormItem({children, className}: {children: React.ReactNode, className?: string}) {
  return <div className={`space-y-1.5 ${className}`}>{children}</div>;
}

