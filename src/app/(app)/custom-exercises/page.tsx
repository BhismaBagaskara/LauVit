"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent, GlassCardFooter } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusSquare, Edit3, Trash2, Save, Image as ImageIcon, Info } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import type { ManualExercise } from "@/lib/types";
import Image from "next/image";
import { getExerciseInstructions } from "@/ai/flows/exercise-instruction-assistance";
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

const manualExerciseSchema = z.object({
  id: z.string().optional(), // For editing
  name: z.string().min(1, "Exercise name is required"),
  variations: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  instructions: z.string().optional(),
});

type ManualExerciseFormValues = z.infer<typeof manualExerciseSchema>;

export default function CustomExercisesPage() {
  const { toast } = useToast();
  const [customExercises, setCustomExercises] = useState<ManualExercise[]>([]);
  const [editingExercise, setEditingExercise] = useState<ManualExercise | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [aiInstructions, setAiInstructions] = useState<{ text: string, isLoading: boolean } | null>(null);


  const form = useForm<ManualExerciseFormValues>({
    resolver: zodResolver(manualExerciseSchema),
    defaultValues: { name: "", variations: "", imageUrl: "", instructions: "" },
  });

  useEffect(() => {
    // Simulate fetching custom exercises
    setCustomExercises([
      { id: "cust1", name: "Cable Crossover", variations: "High to Low", imageUrl: "https://placehold.co/100x100.png", instructions: "Pull cables down and across your body." },
      { id: "cust2", name: " concentración ", variations: "Concentration Curl", imageUrl: "https://placehold.co/100x100.png", instructions: "Isolate bicep by curling dumbbell towards shoulder." },
    ]);
  }, []);
  
  useEffect(() => {
    if (editingExercise) {
      form.reset(editingExercise);
    } else {
      form.reset({ name: "", variations: "", imageUrl: "", instructions: "" });
    }
    setAiInstructions(null); // Reset AI instructions when form opens/resets
  }, [editingExercise, isFormOpen, form]);


  const onSubmit = (data: ManualExerciseFormValues) => {
    if (editingExercise) {
      setCustomExercises(prev => prev.map(ex => ex.id === editingExercise.id ? { ...data, id: editingExercise.id } : ex));
      toast({ title: "Exercise Updated", description: `${data.name} has been updated.` });
    } else {
      setCustomExercises(prev => [...prev, { ...data, id: `cust${Date.now()}` }]);
      toast({ title: "Exercise Added", description: `${data.name} has been added to your custom list.` });
    }
    setEditingExercise(null);
    setIsFormOpen(false);
    form.reset();
  };
  
  const handleEdit = (exercise: ManualExercise) => {
    setEditingExercise(exercise);
    setIsFormOpen(true);
  };
  
  const handleDelete = (exerciseId: string) => {
    setCustomExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    toast({ title: "Exercise Deleted", description: "The custom exercise has been removed." });
  };

  const handleGetAiInstructions = async () => {
    const exerciseName = form.getValues("name");
    if (!exerciseName) {
      toast({ variant: "destructive", title: "Missing Name", description: "Please enter an exercise name first." });
      return;
    }
    setAiInstructions({ text: "", isLoading: true });
    try {
      const result = await getExerciseInstructions({ exerciseName });
      form.setValue("instructions", result.instructions);
      setAiInstructions({ text: result.instructions, isLoading: false });
      toast({ title: "Instructions Fetched", description: `AI instructions for ${exerciseName} added.` });
    } catch (error) {
      console.error("AI instruction error:", error);
      toast({ variant: "destructive", title: "AI Error", description: "Could not fetch instructions." });
      setAiInstructions(null);
    }
  };


  return (
    <div className="space-y-8">
      <PageHeader
        title="Custom Exercises"
        description="Manage your personally added exercises."
        icon={PlusSquare}
        actions={
          <Button onClick={() => { setEditingExercise(null); setIsFormOpen(true); }} className="btn-animated">
            <PlusCircle className="mr-2 h-4 w-4" />Add New Exercise
          </Button>
        }
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[525px] glass-effect p-0">
          <GlassCard variant="opaque" className="border-0 shadow-none">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="font-headline text-2xl">{editingExercise ? "Edit" : "Add New"} Custom Exercise</DialogTitle>
              <DialogDescription>
                {editingExercise ? "Update the details of your custom exercise." : "Define a new exercise to use in your workout logs and plans."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <GlassCardContent className="space-y-4 p-6">
                <FormItem>
                  <Label htmlFor="name">Exercise Name</Label>
                  <Input id="name" {...form.register("name")} placeholder="e.g., Barbell Curl" className="input-animated" />
                  {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
                </FormItem>
                <FormItem>
                  <Label htmlFor="variations">Variations (Optional)</Label>
                  <Input id="variations" {...form.register("variations")} placeholder="e.g., Incline, Wide Grip" className="input-animated" />
                </FormItem>
                <FormItem>
                  <Label htmlFor="imageUrl" className="flex items-center"><ImageIcon className="mr-2 h-4 w-4 text-primary"/>Image URL (Optional)</Label>
                  <Input id="imageUrl" {...form.register("imageUrl")} placeholder="https://example.com/exercise.gif" className="input-animated" />
                  {form.formState.errors.imageUrl && <p className="text-sm text-destructive mt-1">{form.formState.errors.imageUrl.message}</p>}
                </FormItem>
                <FormItem>
                  <Label htmlFor="instructions">Instructions (Optional)</Label>
                  <Textarea id="instructions" {...form.register("instructions")} placeholder="Step-by-step guidance..." className="input-animated min-h-[100px]" />
                   <Button type="button" variant="link" size="sm" className="px-0 text-primary" onClick={handleGetAiInstructions} disabled={aiInstructions?.isLoading}>
                    {aiInstructions?.isLoading ? "Loading..." : "Get AI Instructions"}
                  </Button>
                </FormItem>
                {aiInstructions && !aiInstructions.isLoading && aiInstructions.text && (
                  <Alert variant="default" className="mt-2">
                    <Info className="h-4 w-4" />
                    <AlertTitle>AI Generated Instructions</AlertTitle>
                    <AlertDescription className="text-xs max-h-20 overflow-y-auto">{aiInstructions.text}</AlertDescription>
                  </Alert>
                )}
              </GlassCardContent>
              <DialogFooter className="p-6 pt-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" className="btn-animated" disabled={form.formState.isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />{editingExercise ? "Save Changes" : "Add Exercise"}
                </Button>
              </DialogFooter>
            </form>
          </GlassCard>
        </DialogContent>
      </Dialog>


      {customExercises.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {customExercises.map((exercise, index) => (
            <GlassCard key={exercise.id} className="flex flex-col animate-slide-in-up" style={{animationDelay: `${index * 0.1}s`}}>
              <GlassCardHeader>
                <GlassCardTitle>{exercise.name}</GlassCardTitle>
                {exercise.variations && <GlassCardDescription>{exercise.variations}</GlassCardDescription>}
              </GlassCardHeader>
              <GlassCardContent className="flex-grow space-y-2">
                {exercise.imageUrl && (
                  <div className="relative w-full h-32 rounded-md overflow-hidden border border-white/10">
                    <Image src={exercise.imageUrl} alt={exercise.name} layout="fill" objectFit="cover" data-ai-hint="exercise fitness"/>
                  </div>
                )}
                {exercise.instructions && <p className="text-xs text-muted-foreground line-clamp-3">Instructions: {exercise.instructions}</p>}
              </GlassCardContent>
              <GlassCardFooter className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(exercise)} className="btn-animated flex-1"><Edit3 className="mr-2 h-4 w-4" />Edit</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="btn-animated flex-1"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the custom exercise "{exercise.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => exercise.id && handleDelete(exercise.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </GlassCardFooter>
            </GlassCard>
          ))}
        </div>
      ) : (
        !isFormOpen && (
          <GlassCard>
            <GlassCardContent className="pt-6 text-center">
              <p className="text-lg text-muted-foreground">No custom exercises added yet.</p>
              <Button onClick={() => { setEditingExercise(null); setIsFormOpen(true); }} className="mt-4 btn-animated">
                <PlusCircle className="mr-2 h-4 w-4" />Add Your First Custom Exercise
              </Button>
            </GlassCardContent>
          </GlassCard>
        )
      )}
    </div>
  );
}

// Minimal FormItem component, if not globally available
function FormItem({children, className}: {children: React.ReactNode, className?: string}) {
  return <div className={`space-y-1.5 ${className}`}>{children}</div>;
}
