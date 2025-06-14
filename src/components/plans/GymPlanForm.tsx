
"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/shared/GlassCard";
import { PlusCircle, Trash2, Save, FileText, CalendarDays, Loader2, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { GymPlan, Day, Exercise, ExerciseVariation } from "@/lib/types";
import { APP_NAME, EXERCISE_VARIATIONS_OPTIONS } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const exerciseSchema = z.object({
  id: z.string().default(() => `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
  name: z.string().min(1, "Exercise name is required"),
  variation: z.enum(EXERCISE_VARIATIONS_OPTIONS.map(opt => opt.value) as [ExerciseVariation, ...ExerciseVariation[]], {
    required_error: "Variation is required",
  }),
  sets: z.coerce.number().min(1, "Sets must be at least 1"),
  reps: z.string().min(1, "Reps are required (e.g., 8-12, AMRAP)"),
});

const daySchema = z.object({
  id: z.string().default(() => `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
  name: z.string().min(1, "Day name is required (e.g., Day 1, Push Day)"),
  exercises: z.array(exerciseSchema).min(1, "Add at least one exercise to this day"),
});

const gymPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(false),
  days: z.array(daySchema).min(1, "Add at least one day to the plan"),
});

type GymPlanFormValues = z.infer<typeof gymPlanSchema>;

interface GymPlanFormProps {
  initialData?: GymPlan;
}

export function GymPlanForm({ initialData }: GymPlanFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<GymPlanFormValues>({
    resolver: zodResolver(gymPlanSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          days: initialData.days.map(day => ({
            ...day,
            id: day.id || `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            exercises: day.exercises.map(ex => ({
              ...ex,
              id: ex.id || `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            })),
          })),
        }
      : {
          name: "",
          description: "",
          isActive: false,
          days: [{
            id: `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: "Day 1",
            exercises: [{
              id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: "",
              variation: EXERCISE_VARIATIONS_OPTIONS[0].value,
              sets: 3,
              reps: "8-12",
            }],
          }],
        },
  });

  const { fields: dayFields, append: appendDay, remove: removeDay } = useFieldArray({
    control: form.control,
    name: "days",
  });

  const onSubmit = (data: GymPlanFormValues) => {
    let plans: GymPlan[] = [];
    if (typeof window !== 'undefined') {
      const storedPlans = localStorage.getItem(`${APP_NAME}_gymPlans`);
      plans = storedPlans ? JSON.parse(storedPlans) : [];
    }

    const planToSave: GymPlan = {
      ...data,
      id: initialData?.id || `plan_${Date.now()}`,
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date(),
      days: data.days.map(day => ({
        ...day,
        id: day.id || `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        exercises: day.exercises.map(ex => ({
          ...ex,
          id: ex.id || `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }))
      }))
    };
    
    if (planToSave.isActive) {
      plans = plans.map(p => ({ ...p, isActive: false }));
    }

    if (initialData) {
      plans = plans.map(p => p.id === initialData.id ? planToSave : p);
    } else {
      plans.push(planToSave);
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${APP_NAME}_gymPlans`, JSON.stringify(plans));
    }

    toast({
      title: initialData ? "Plan Updated!" : "Plan Created!",
      description: `Gym plan "${data.name}" has been saved.`,
    });
    router.push("/gym-plans");
    router.refresh(); // To ensure the gym plans page re-fetches data
  };

  const addDefaultExercise = (dayIndex: number) => {
    const dayPath = `days.${dayIndex}.exercises` as const;
    const currentExercises = form.getValues(dayPath) || [];
    form.setValue(dayPath, [
        ...currentExercises,
        {
            id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: "",
            variation: EXERCISE_VARIATIONS_OPTIONS[0].value,
            sets: 3,
            reps: "8-12",
        }
    ]);
  };
  
  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    const dayPath = `days.${dayIndex}.exercises` as const;
    const currentExercises = form.getValues(dayPath);
    if (currentExercises.length > 1) {
        const updatedExercises = currentExercises.filter((_, idx) => idx !== exerciseIndex);
        form.setValue(dayPath, updatedExercises);
    } else {
        toast({ variant: "destructive", title: "Cannot remove", description: "Each day must have at least one exercise." });
    }
  };


  return (
    <GlassCard>
      <GlassCardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <FormItem>
              <Label htmlFor="name">Plan Name</Label>
              <Input id="name" {...form.register("name")} placeholder="e.g., My Awesome Strength Plan" className="input-animated" />
              {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
            </FormItem>
            <FormItem>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" {...form.register("description")} placeholder="A brief overview of this plan" className="input-animated" />
            </FormItem>
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card/50">
              <div className="space-y-0.5">
                <Label>Set as Active Plan</Label>
                <p className="text-xs text-muted-foreground">
                  This will make it your current primary workout plan.
                </p>
              </div>
              <Controller
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </FormItem>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary"/>Workout Days</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => appendDay({ id: `day_${Date.now()}_${Math.random().toString(36).substr(2,9)}`, name: `Day ${dayFields.length + 1}`, exercises: [{ id: `ex_${Date.now()}_${Math.random().toString(36).substr(2,9)}`, name: "", variation: EXERCISE_VARIATIONS_OPTIONS[0].value, sets: 3, reps: "8-12" }] })} className="btn-animated">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Day
                </Button>
            </div>

            {dayFields.map((dayField, dayIndex) => (
              <GlassCard key={dayField.id} variant="opaque" className="p-4 space-y-4 relative">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                    onClick={() => dayFields.length > 1 ? removeDay(dayIndex) : toast({variant: "destructive", title: "Cannot remove", description:"Plan must have at least one day."})}
                    aria-label="Remove day"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                <FormItem>
                  <Label htmlFor={`days.${dayIndex}.name`}>Day Name</Label>
                  <Input {...form.register(`days.${dayIndex}.name`)} placeholder="e.g., Push Day, Day 1" className="input-animated" />
                  {form.formState.errors.days?.[dayIndex]?.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.days?.[dayIndex]?.name?.message}</p>}
                </FormItem>

                <h4 className="text-md font-semibold flex items-center pt-2"><FileText className="mr-2 h-4 w-4 text-primary"/>Exercises for {form.watch(`days.${dayIndex}.name`) || `Day ${dayIndex + 1}`}</h4>
                
                {/* Nested Field Array for Exercises */}
                <Controller
                    control={form.control}
                    name={`days.${dayIndex}.exercises`}
                    render={({ field }) => (
                        <>
                            {(field.value || []).map((exerciseField, exerciseIndex) => (
                                <GlassCard key={exerciseField.id} variant="default" className="p-3 space-y-3 relative bg-card/30 my-2">
                                     <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1 right-1 text-muted-foreground hover:text-destructive h-6 w-6"
                                        onClick={() => removeExercise(dayIndex, exerciseIndex)}
                                        aria-label="Remove exercise"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                    <FormItem>
                                        <Label htmlFor={`days.${dayIndex}.exercises.${exerciseIndex}.name`}>Exercise Name</Label>
                                        <Input {...form.register(`days.${dayIndex}.exercises.${exerciseIndex}.name`)} placeholder="e.g., Bench Press" className="input-animated"/>
                                        {form.formState.errors.days?.[dayIndex]?.exercises?.[exerciseIndex]?.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.days?.[dayIndex]?.exercises?.[exerciseIndex]?.name?.message}</p>}
                                    </FormItem>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormItem>
                                            <Label htmlFor={`days.${dayIndex}.exercises.${exerciseIndex}.variation`}>Variation</Label>
                                            <Controller
                                                name={`days.${dayIndex}.exercises.${exerciseIndex}.variation`}
                                                control={form.control}
                                                render={({ field: selectField }) => (
                                                    <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
                                                        <SelectTrigger className="input-animated">
                                                            <SelectValue placeholder="Select variation" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {EXERCISE_VARIATIONS_OPTIONS.map(opt => (
                                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {form.formState.errors.days?.[dayIndex]?.exercises?.[exerciseIndex]?.variation && <p className="text-sm text-destructive mt-1">{form.formState.errors.days?.[dayIndex]?.exercises?.[exerciseIndex]?.variation?.message}</p>}
                                        </FormItem>
                                        <FormItem>
                                            <Label htmlFor={`days.${dayIndex}.exercises.${exerciseIndex}.sets`}>Sets</Label>
                                            <Input type="number" {...form.register(`days.${dayIndex}.exercises.${exerciseIndex}.sets`)} className="input-animated"/>
                                            {form.formState.errors.days?.[dayIndex]?.exercises?.[exerciseIndex]?.sets && <p className="text-sm text-destructive mt-1">{form.formState.errors.days?.[dayIndex]?.exercises?.[exerciseIndex]?.sets?.message}</p>}
                                        </FormItem>
                                        <FormItem>
                                            <Label htmlFor={`days.${dayIndex}.exercises.${exerciseIndex}.reps`}>Reps</Label>
                                            <Input {...form.register(`days.${dayIndex}.exercises.${exerciseIndex}.reps`)} placeholder="e.g., 8-12" className="input-animated"/>
                                            {form.formState.errors.days?.[dayIndex]?.exercises?.[exerciseIndex]?.reps && <p className="text-sm text-destructive mt-1">{form.formState.errors.days?.[dayIndex]?.exercises?.[exerciseIndex]?.reps?.message}</p>}
                                        </FormItem>
                                    </div>
                                </GlassCard>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => addDefaultExercise(dayIndex)} className="btn-animated mt-2">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Exercise to {form.watch(`days.${dayIndex}.name`) || `Day ${dayIndex + 1}`}
                            </Button>
                             {form.formState.errors.days?.[dayIndex]?.exercises?.root?.message && <p className="text-sm text-destructive mt-1">{form.formState.errors.days?.[dayIndex]?.exercises?.root?.message}</p>}
                             {typeof form.formState.errors.days?.[dayIndex]?.exercises === 'string' && <p className="text-sm text-destructive mt-1">{form.formState.errors.days?.[dayIndex]?.exercises as string}</p>}
                        </>
                    )}
                />
              </GlassCard>
            ))}
            {form.formState.errors.days?.root?.message && <p className="text-sm text-destructive mt-1">{form.formState.errors.days?.root?.message}</p>}
            {typeof form.formState.errors.days === 'string' && <p className="text-sm text-destructive mt-1">{form.formState.errors.days}</p>}
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" className="btn-animated" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {initialData ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </form>
      </GlassCardContent>
    </GlassCard>
  );
}

function FormItem({children, className}: {children: React.ReactNode, className?: string}) {
  return <div className={`space-y-1.5 ${className}`}>{children}</div>;
}
