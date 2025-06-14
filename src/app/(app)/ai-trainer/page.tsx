"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Sparkles, Loader2, Send } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { aiFitnessAdvice } from "@/ai/flows/ai-fitness-advice";
import type { AiFitnessAdviceInput, AiFitnessAdviceOutput } from "@/ai/flows/ai-fitness-advice";

const aiTrainerSchema = z.object({
  workoutLogs: z.string().min(10, "Please provide some details about your recent workouts."),
  bodyComposition: z.string().min(10, "Describe your current body composition (e.g., weight, estimated body fat)."),
  fitnessGoals: z.string().min(5, "What are your primary fitness goals?"),
  age: z.coerce.number().min(12, "Age must be at least 12.").max(100, "Age must be at most 100."),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
});

type AiTrainerFormValues = z.infer<typeof aiTrainerSchema>;

export default function AiTrainerPage() {
  const { toast } = useToast();
  const [advice, setAdvice] = useState<AiFitnessAdviceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AiTrainerFormValues>({
    resolver: zodResolver(aiTrainerSchema),
    defaultValues: {
      gender: "prefer_not_to_say",
    }
  });

  const onSubmit = async (data: AiTrainerFormValues) => {
    setIsLoading(true);
    setAdvice(null);
    try {
      const result = await aiFitnessAdvice(data);
      setAdvice(result);
      toast({ title: "AI Advice Received!", description: "Check out your personalized fitness guidance." });
    } catch (error) {
      console.error("AI Trainer Error:", error);
      toast({ variant: "destructive", title: "AI Consultation Failed", description: "Could not get advice at this time. Please try again later." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Trainer Consultation"
        description="Get personalized fitness advice and guidance from our AI."
        icon={Bot}
      />
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <GlassCard className="animate-slide-in-up">
          <GlassCardHeader>
            <GlassCardTitle>Your Information</GlassCardTitle>
            <GlassCardDescription>Provide details for personalized advice.</GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormItem>
                <Label htmlFor="workoutLogs">Recent Workout Logs</Label>
                <Textarea id="workoutLogs" {...form.register("workoutLogs")} placeholder="e.g., Mon: Bench 3x5 80kg, Squat 3x5 100kg..." className="input-animated min-h-[100px]" />
                {form.formState.errors.workoutLogs && <p className="text-sm text-destructive mt-1">{form.formState.errors.workoutLogs.message}</p>}
              </FormItem>
              <FormItem>
                <Label htmlFor="bodyComposition">Current Body Composition</Label>
                <Textarea id="bodyComposition" {...form.register("bodyComposition")} placeholder="e.g., 75kg, ~15% body fat, feel energetic..." className="input-animated min-h-[80px]" />
                {form.formState.errors.bodyComposition && <p className="text-sm text-destructive mt-1">{form.formState.errors.bodyComposition.message}</p>}
              </FormItem>
              <FormItem>
                <Label htmlFor="fitnessGoals">Fitness Goals</Label>
                <Input id="fitnessGoals" {...form.register("fitnessGoals")} placeholder="e.g., Build muscle, lose 5kg, run a 5k" className="input-animated" />
                {form.formState.errors.fitnessGoals && <p className="text-sm text-destructive mt-1">{form.formState.errors.fitnessGoals.message}</p>}
              </FormItem>
              <div className="grid grid-cols-2 gap-4">
                <FormItem>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" {...form.register("age")} placeholder="e.g., 28" className="input-animated" />
                  {form.formState.errors.age && <p className="text-sm text-destructive mt-1">{form.formState.errors.age.message}</p>}
                </FormItem>
                <FormItem>
                  <Label htmlFor="gender">Gender</Label>
                  <Controller
                    name="gender"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="input-animated">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.gender && <p className="text-sm text-destructive mt-1">{form.formState.errors.gender.message}</p>}
                </FormItem>
              </div>
              <Button type="submit" className="w-full btn-animated" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Get AI Advice
              </Button>
            </form>
          </GlassCardContent>
        </GlassCard>

        <GlassCard className="animate-fade-in sticky top-24" style={{animationDelay: '0.2s'}}>
          <GlassCardHeader>
            <GlassCardTitle className="flex items-center"><Sparkles className="mr-2 h-6 w-6 text-primary" />AI Fitness Advice</GlassCardTitle>
            <GlassCardDescription>Personalized recommendations will appear here.</GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent className="min-h-[200px]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating your personalized advice...</p>
              </div>
            )}
            {advice && !isLoading && (
              <div className="prose prose-sm prose-invert max-w-none">
                 {advice.advice.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
            {!advice && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Fill out the form to get your AI-powered fitness plan.</p>
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}

// Minimal FormItem component
function FormItem({children, className}: {children: React.ReactNode, className?: string}) {
  return <div className={`space-y-1.5 ${className}`}>{children}</div>;
}
