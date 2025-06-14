
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
import { PlusCircle, Trash2, Save, FileText, Image as ImageIcon, AlertTriangle, Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { GymPlan, Exercise } from "@/lib/types";
import { APP_NAME } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getExerciseInstructions } from "@/ai/flows/exercise-instruction-assistance";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"

const exerciseSchema = z.object({
  id: z.string().optional(), // Keep exercise ID if it comes from a predefined list
  name: z.string().min(1, "Exercise name is required"),
  variations: z.string().optional(),
  sets: z.coerce.number().min(1, "Sets must be at least 1"),
  reps: z.string().min(1, "Reps are required (e.g., 8-12, AMRAP)"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  instructions: z.string().optional(),
  day: z.string().optional(), // e.g., "Push Day", "Monday"
});

const gymPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(false),
  exercises: z.array(exerciseSchema).min(1, "Add at least one exercise to the plan"),
});

type GymPlanFormValues = z.infer<typeof gymPlanSchema>;

interface GymPlanFormProps {
  initialData?: GymPlan;
}

export function GymPlanForm({ initialData }: GymPlanFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [aiInstructions, setAiInstructions] = useState<{ exerciseIndex: number, text: string, isLoading: boolean } | null>(null);
  const [availableExercises, setAvailableExercises] = useState<{label: string, value: string}[]>([]); // For exercise name dropdown

  // useEffect(() => {
    // This could fetch a global list of exercises or user's custom exercises
    // For now, it will be empty if MOCK_EXERCISES_DATA is empty.
    // const exerciseOptions = MOCK_EXERCISES_DATA.map(ex => ({label: `${ex.name} ${ex.variations ? `(${ex.variations})` : ''}`, value: ex.id}));
    // setAvailableExercises(exerciseOptions);
  // }, []);


  const form = useForm<GymPlanFormValues>({
    resolver: zodResolver(gymPlanSchema),
    defaultValues: initialData
      ? { 
          ...initialData, 
          exercises: initialData.exercises.map(ex => ({
            ...ex, 
            id: ex.id || `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // ensure id
            imageUrl: ex.imageUrl || "",
            day: ex.day || "" 
          })) 
        }
      : {
          name: "",
          description: "",
          isActive: false,
          exercises: [{ 
            id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
            name: "", 
            sets: 3, 
            reps: "8-12", 
            imageUrl: "", 
            instructions: "", 
            day: "" 
          }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
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
      exercises: data.exercises.map(ex => ({
        ...ex,
        id: ex.id || `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Ensure exercises have IDs
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
  };

  const addExercise = () => {
    append({ 
      id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: "", 
      sets: 3, 
      reps: "8-12", 
      imageUrl: "", 
      instructions: "", 
      day: "" 
    });
  };
  
  const handleGetAiInstructions = async (exerciseIndex: number) => {
    const exerciseName = form.getValues(`exercises.${exerciseIndex}.name`);
    if (!exerciseName) {
      toast({ variant: "destructive", title: "Missing Name", description: "Please enter an exercise name first." });
      return;
    }
    setAiInstructions({ exerciseIndex, text: "", isLoading: true });
    try {
      const result = await getExerciseInstructions({ exerciseName });
      form.setValue(`exercises.${exerciseIndex}.instructions`, result.instructions);
      setAiInstructions({ exerciseIndex, text: result.instructions, isLoading: false });
      toast({ title: "Instructions Fetched", description: `AI instructions for ${exerciseName} added.` });
    } catch (error) {
      console.error("AI instruction error:", error);
      toast({ variant: "destructive", title: "AI Error", description: "Could not fetch instructions." });
      setAiInstructions(null);
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
            <h3 className="text-xl font-semibold flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Exercises</h3>
            {fields.map((field, index) => (
              <GlassCard key={field.id} variant="opaque" className="p-4 space-y-4 relative">
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                    onClick={() => fields.length > 1 ? remove(index) : toast({variant: "destructive", title: "Cannot remove", description:"Plan must have at least one exercise."})}
                    aria-label="Remove exercise"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                <FormItem>
                  <Label htmlFor={`exercises.${index}.name`}>Exercise Name</Label>
                   <Controller
                      name={`exercises.${index}.name`}
                      control={form.control}
                      render={({ field: selectField }) => (
                        <Select 
                          onValueChange={(value) => {
                            if (value === 'custom') {
                              selectField.onChange(''); 
                               toast({title: "Custom Exercise", description: "Type the name of your custom exercise below."})
                            } else {
                              // If selected from list, potentially auto-fill other details like instructions if available
                              const selectedExerciseData = availableExercises.find(ex => ex.label === value); // This is a simple match
                              selectField.onChange(value);
                              // Example: form.setValue(`exercises.${index}.instructions`, selectedExerciseData?.instructions || "");
                            }
                          }} 
                          value={selectField.value}
                        >
                          <SelectTrigger className="input-animated">
                            <SelectValue placeholder="Select or type exercise" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableExercises.map(ex => (
                              <SelectItem key={ex.value} value={ex.label}>{ex.label}</SelectItem>
                            ))}
                            <SelectItem value="custom">Type Custom Exercise Name...</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                     <Input 
                        placeholder="Type or confirm exercise name" 
                        {...form.register(`exercises.${index}.name`)} 
                        className="input-animated mt-1" 
                     />
                  {form.formState.errors.exercises?.[index]?.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.exercises?.[index]?.name?.message}</p>}
                </FormItem>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormItem>
                    <Label htmlFor={`exercises.${index}.variations`}>Variations (Opt.)</Label>
                    <Input id={`exercises.${index}.variations`} {...form.register(`exercises.${index}.variations`)} placeholder="e.g., Incline" className="input-animated"/>
                  </FormItem>
                  <FormItem>
                    <Label htmlFor={`exercises.${index}.sets`}>Sets</Label>
                    <Input id={`exercises.${index}.sets`} type="number" {...form.register(`exercises.${index}.sets`)} className="input-animated"/>
                    {form.formState.errors.exercises?.[index]?.sets && <p className="text-sm text-destructive mt-1">{form.formState.errors.exercises?.[index]?.sets?.message}</p>}
                  </FormItem>
                  <FormItem>
                    <Label htmlFor={`exercises.${index}.reps`}>Reps</Label>
                    <Input id={`exercises.${index}.reps`} {...form.register(`exercises.${index}.reps`)} placeholder="e.g., 8-12, AMRAP" className="input-animated"/>
                    {form.formState.errors.exercises?.[index]?.reps && <p className="text-sm text-destructive mt-1">{form.formState.errors.exercises?.[index]?.reps?.message}</p>}
                  </FormItem>
                </div>
                 <FormItem>
                    <Label htmlFor={`exercises.${index}.day`}>Workout Day (Opt.)</Label>
                    <Input id={`exercises.${index}.day`} {...form.register(`exercises.${index}.day`)} placeholder="e.g., Push Day, Monday, Day 1" className="input-animated"/>
                     {form.formState.errors.exercises?.[index]?.day && <p className="text-sm text-destructive mt-1">{form.formState.errors.exercises?.[index]?.day?.message}</p>}
                  </FormItem>
                <FormItem>
                  <Label htmlFor={`exercises.${index}.imageUrl`} className="flex items-center"><ImageIcon className="mr-2 h-4 w-4 text-primary"/>Image URL (Optional)</Label>
                  <Input id={`exercises.${index}.imageUrl`} {...form.register(`exercises.${index}.imageUrl`)} placeholder="https://example.com/image.gif" className="input-animated"/>
                   {form.formState.errors.exercises?.[index]?.imageUrl && <p className="text-sm text-destructive mt-1">{form.formState.errors.exercises?.[index]?.imageUrl?.message}</p>}
                </FormItem>
                <FormItem>
                  <Label htmlFor={`exercises.${index}.instructions`}>Instructions (Optional)</Label>
                  <Textarea id={`exercises.${index}.instructions`} {...form.register(`exercises.${index}.instructions`)} placeholder="Step-by-step guidance..." className="input-animated"/>
                  <Button type="button" variant="link" size="sm" className="px-0 text-primary" onClick={() => handleGetAiInstructions(index)} disabled={aiInstructions?.isLoading && aiInstructions.exerciseIndex === index}>
                    {aiInstructions?.isLoading && aiInstructions.exerciseIndex === index ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    {aiInstructions?.isLoading && aiInstructions.exerciseIndex === index ? "Loading..." : "Get AI Instructions"}
                  </Button>
                </FormItem>
                {aiInstructions?.exerciseIndex === index && !aiInstructions.isLoading && aiInstructions.text && (
                  <Alert variant="default" className="mt-2">
                    <Info className="h-4 w-4" />
                    <AlertTitle>AI Generated Instructions</AlertTitle>
                    <AlertDescription className="text-xs max-h-20 overflow-y-auto">{aiInstructions.text}</AlertDescription>
                  </Alert>
                )}
              </GlassCard>
            ))}
            <Button type="button" variant="secondary" onClick={addExercise} className="btn-animated">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Exercise
            </Button>
             {form.formState.errors.exercises?.root?.message && <p className="text-sm text-destructive mt-1">{form.formState.errors.exercises?.root?.message}</p>}
             {typeof form.formState.errors.exercises === 'string' && <p className="text-sm text-destructive mt-1">{form.formState.errors.exercises}</p>}
             {form.formState.errors.exercises && !Array.isArray(form.formState.errors.exercises) && typeof form.formState.errors.exercises !== 'string' && !form.formState.errors.exercises?.root && (
                <p className="text-sm text-destructive mt-1">Please check exercise details for errors.</p>
             )}


          </div>
          
          <Alert variant="default" className="bg-primary/10 border-primary/30">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">Important</AlertTitle>
            <AlertDescription className="text-primary/80">
              AI-generated instructions are for informational purposes only. Always consult with a qualified fitness professional before starting any new exercise program. Prioritize correct form and safety.
            </AlertDescription>
          </Alert>

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

// Minimal FormItem component
function FormItem({children, className}: {children: React.ReactNode, className?: string}) {
  return <div className={`space-y-1.5 ${className}`}>{children}</div>;
}
