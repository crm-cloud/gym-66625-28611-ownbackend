import { PlanForm } from '@/components/membership/PlanForm';

export const MembershipPlanCreatePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Membership Plan</h1>
          <p className="text-muted-foreground">Define pricing, duration, and features. These features can later be used to allocate sessions to members.</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <PlanForm />
      </div>
    </div>
  );
};
