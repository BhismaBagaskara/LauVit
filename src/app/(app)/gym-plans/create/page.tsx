"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { GymPlanForm } from "@/components/plans/GymPlanForm";
import { ListChecks } from "lucide-react";

export default function CreateGymPlanPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Create New Gym Plan"
        description="Design your next workout routine from scratch."
        icon={ListChecks}
      />
      <GymPlanForm />
    </div>
  );
}
