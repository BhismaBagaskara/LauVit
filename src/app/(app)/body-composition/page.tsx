
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, TrendingUp, RefreshCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import type { BodyCompositionRecord } from "@/lib/types";
import { format } from "date-fns";

const bodyCompositionSchema = z.object({
  weightKg: z.coerce.number().positive("Weight must be positive."),
  heightCm: z.coerce.number().positive("Height must be positive."),
  // For simplicity, muscle mass might be a direct input or a very simplified calculation
  muscleMassKg: z.coerce.number().positive("Muscle mass must be positive.").optional(), 
});

type BodyCompositionFormValues = z.infer<typeof bodyCompositionSchema>;

export default function BodyCompositionPage() {
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] = useState<Partial<BodyCompositionRecord> | null>(null);

  const form = useForm<BodyCompositionFormValues>({
    resolver: zodResolver(bodyCompositionSchema),
  });

  const onSubmit = (data: BodyCompositionFormValues) => {
    const heightM = data.heightCm / 100;
    const bmi = parseFloat((data.weightKg / (heightM * heightM)).toFixed(2));
    
    // Simplified muscle mass: if provided, use it. Otherwise, can be a placeholder or more complex formula.
    // For this example, let's just say it's 40% of body weight if not provided.
    const muscleMassKg = data.muscleMassKg || parseFloat((data.weightKg * 0.4).toFixed(2)); 

    const result: Partial<BodyCompositionRecord> = {
      date: new Date(),
      weightKg: data.weightKg,
      heightCm: data.heightCm,
      bmi,
      muscleMassKg,
    };
    setAnalysisResult(result);
    toast({ title: "Analysis Complete", description: "Your body composition has been calculated." });
  };
  
  const handleReset = () => {
    form.reset();
    setAnalysisResult(null);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Body Composition Analysis"
        description="Calculate your BMI and track muscle mass."
        icon={BarChart3}
      />
      <div className="grid md:grid-cols-2 gap-8">
        <GlassCard className="animate-slide-in-up">
          <GlassCardHeader>
            <GlassCardTitle>Enter Your Metrics</GlassCardTitle>
            <GlassCardDescription>Provide your current weight and height.</GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormItem>
                <Label htmlFor="weightKg">Weight (kg)</Label>
                <Input id="weightKg" type="number" step="0.1" {...form.register("weightKg")} placeholder="e.g., 70.5" className="input-animated" />
                {form.formState.errors.weightKg && <p className="text-sm text-destructive mt-1">{form.formState.errors.weightKg.message}</p>}
              </FormItem>
              <FormItem>
                <Label htmlFor="heightCm">Height (cm)</Label>
                <Input id="heightCm" type="number" step="0.1" {...form.register("heightCm")} placeholder="e.g., 175" className="input-animated" />
                {form.formState.errors.heightCm && <p className="text-sm text-destructive mt-1">{form.formState.errors.heightCm.message}</p>}
              </FormItem>
              <FormItem>
                <Label htmlFor="muscleMassKg">Muscle Mass (kg) (Optional)</Label>
                <Input id="muscleMassKg" type="number" step="0.1" {...form.register("muscleMassKg")} placeholder="e.g., 30.2" className="input-animated" />
                 {form.formState.errors.muscleMassKg && <p className="text-sm text-destructive mt-1">{form.formState.errors.muscleMassKg.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">If left blank, a rough estimate will be used.</p>
              </FormItem>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 btn-animated" disabled={form.formState.isSubmitting}>
                  <TrendingUp className="mr-2 h-4 w-4" />Calculate
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} className="btn-animated">
                  <RefreshCcw className="mr-2 h-4 w-4" />Reset
                </Button>
              </div>
            </form>
          </GlassCardContent>
        </GlassCard>

        {analysisResult && (
          <GlassCard className="animate-fade-in" style={{animationDelay: '0.2s'}}>
            <GlassCardHeader>
              <GlassCardTitle>Analysis Results</GlassCardTitle>
              <GlassCardDescription>Based on the metrics you provided on {analysisResult.date ? format(analysisResult.date, "PPP") : "N/A"}.</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">Body Mass Index (BMI)</h4>
                <p className="text-3xl font-bold text-primary">{analysisResult.bmi}</p>
                <p className="text-sm text-muted-foreground">{getBmiCategory(analysisResult.bmi!)}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg">Estimated Muscle Mass</h4>
                <p className="text-3xl font-bold text-primary">{analysisResult.muscleMassKg} kg</p>
                <p className="text-sm text-muted-foreground">This is an estimate. For accurate measurements, consult a professional.</p>
              </div>
               <div className="text-xs text-muted-foreground pt-4 border-t border-border">
                <p><strong>Disclaimer:</strong> This tool provides estimates for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 24.9) return "Normal weight";
  if (bmi < 29.9) return "Overweight";
  return "Obesity";
}

// Minimal FormItem component
function FormItem({children, className}: {children: React.ReactNode, className?: string}) {
  return <div className={`space-y-1.5 ${className}`}>{children}</div>;
}

