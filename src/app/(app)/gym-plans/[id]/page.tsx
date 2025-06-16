
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { GymPlanForm } from "@/components/plans/GymPlanForm";
import { ListChecks, Loader2 } from "lucide-react";
import type { GymPlan } from "@/lib/types";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";


export default function EditGymPlanPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<GymPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const planId = params?.id as string; // Safer access to params.id

  useEffect(() => {
    if (planId && typeof window !== 'undefined') {
      const storedPlans = localStorage.getItem(`${APP_NAME}_gymPlans`);
      if (storedPlans) {
        const plans: GymPlan[] = JSON.parse(storedPlans);
        const foundPlan = plans.find(p => p.id === planId);
        if (foundPlan) {
          setPlan(foundPlan);
        } else {
          // console.warn("Plan not found, consider redirecting or showing error");
          // router.push("/gym-plans"); // Optional: redirect if plan not found
        }
      }
      setLoading(false);
    } else {
      // This handles cases where planId is undefined (e.g., params.id is not available yet or invalid)
      // or typeof window === 'undefined' (less likely here but good for completeness).
      setLoading(false);
    }
  }, [planId, router]);


  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
        <div className="space-y-8 text-center">
         <PageHeader
            title="Plan Not Found"
            description="The requested gym plan could not be found or does not exist."
            icon={ListChecks}
        />
        <Button onClick={() => router.push("/gym-plans")}>Back to Gym Plans</Button>
       </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Edit: ${plan.name}`}
        description="Modify your gym plan details and exercises."
        icon={ListChecks}
      />
      <GymPlanForm initialData={plan} />
    </div>
  );
}
