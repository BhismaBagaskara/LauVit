"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { GymPlanForm } from "@/components/plans/GymPlanForm";
import { ListChecks, Loader2 } from "lucide-react";
import { MOCK_GYM_PLANS_DATA } from "@/lib/constants";
import type { GymPlan } from "@/lib/types";

export default function EditGymPlanPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<GymPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const planId = params.id as string;

  useEffect(() => {
    if (planId) {
      // Simulate fetching plan data
      const foundPlan = MOCK_GYM_PLANS_DATA.find(p => p.id === planId);
      if (foundPlan) {
        setPlan(foundPlan);
      } else {
        // Handle plan not found, e.g., redirect or show error
        router.push("/gym-plans"); 
      }
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
    // This case should ideally be handled by the redirect in useEffect
    return <p>Plan not found.</p>;
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
