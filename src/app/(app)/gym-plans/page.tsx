
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent, GlassCardFooter } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListChecks, PlusCircle, Edit3, Trash2, CheckCircle, XCircle, PlayCircle } from "lucide-react";
import type { GymPlan } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { APP_NAME } from "@/lib/constants";
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

export default function GymPlansPage() {
  const [plans, setPlans] = useState<GymPlan[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPlans = localStorage.getItem(`${APP_NAME}_gymPlans`);
      if (storedPlans) {
        setPlans(JSON.parse(storedPlans));
      }
    }
  }, []);

  const savePlansToLocalStorage = (updatedPlans: GymPlan[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${APP_NAME}_gymPlans`, JSON.stringify(updatedPlans));
    }
  };

  const handleDeletePlan = (planId: string) => {
    const updatedPlans = plans.filter(plan => plan.id !== planId);
    setPlans(updatedPlans);
    savePlansToLocalStorage(updatedPlans);
    toast({ title: "Plan Deleted", description: "The gym plan has been successfully deleted." });
  };
  
  const handleActivatePlan = (planId: string) => {
    const updatedPlans = plans.map(plan => 
      plan.id === planId ? {...plan, isActive: true} : {...plan, isActive: false}
    );
    setPlans(updatedPlans);
    savePlansToLocalStorage(updatedPlans);
    toast({ title: "Plan Activated", description: "The gym plan is now active." });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gym Plans"
        description="Create, manage, and activate your workout routines."
        icon={ListChecks}
        actions={
          <Link href="/gym-plans/create">
            <Button className="btn-animated"><PlusCircle className="mr-2 h-4 w-4" />Create New Plan</Button>
          </Link>
        }
      />

      {plans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan, index) => (
            <GlassCard key={plan.id} className="flex flex-col animate-slide-in-up" style={{animationDelay: `${index * 0.1}s`}}>
              <GlassCardHeader>
                <div className="flex justify-between items-start">
                  <GlassCardTitle>{plan.name}</GlassCardTitle>
                  <Badge variant={plan.isActive ? "default" : "secondary"} className={plan.isActive ? "bg-primary text-primary-foreground" : ""}>
                    {plan.isActive ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                    {plan.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <GlassCardDescription>{plan.description || "No description available."}</GlassCardDescription>
              </GlassCardHeader>
              <GlassCardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  Exercises: <span className="font-semibold text-foreground">{plan.exercises.length}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {new Date(plan.updatedAt).toLocaleDateString()}
                </p>
                 <p className="text-xs text-muted-foreground mt-1">
                  Days: {Array.from(new Set(plan.exercises.map(e => e.day).filter(Boolean))).join(', ') || 'N/A'}
                </p>
              </GlassCardContent>
              <GlassCardFooter className="flex flex-col sm:flex-row gap-2">
                <Link href={`/gym-plans/${plan.id}`} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full btn-animated"><Edit3 className="mr-2 h-4 w-4" />View/Edit</Button>
                </Link>
                {!plan.isActive && (
                  <Button 
                    variant="secondary" 
                    className="w-full sm:w-auto btn-animated"
                    onClick={() => handleActivatePlan(plan.id)}
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />Activate
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto btn-animated"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the gym plan "{plan.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeletePlan(plan.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </GlassCardFooter>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard>
          <GlassCardContent className="pt-6 text-center">
            <p className="text-lg text-muted-foreground">No gym plans found.</p>
            <Link href="/gym-plans/create">
              <Button className="mt-4 btn-animated"><PlusCircle className="mr-2 h-4 w-4" />Create Your First Plan</Button>
            </Link>
          </GlassCardContent>
        </GlassCard>
      )}
    </div>
  );
}
