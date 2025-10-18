import { MembershipPlanList } from '@/components/membership/MembershipPlanList';
import { Button } from '@/components/ui/button';
import { useRBAC } from '@/hooks/useRBAC';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export const MembershipPlansPage = () => {
  const { hasPermission } = useRBAC();
  const navigate = useNavigate();

  if (!hasPermission('members.view')) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to view membership plans.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Membership Plans</h1>
          <p className="text-muted-foreground">Create and manage membership plans, features, and member assignments</p>
        </div>
        <div className="flex gap-2">
          {hasPermission('members.create') && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/membership/add')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Member with Plan
            </Button>
          )}
          {hasPermission('members.create') && (
            <Button 
              onClick={() => navigate('/membership/plans/create')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Plan
            </Button>
          )}
        </div>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <MembershipPlanList />
      </div>
    </div>
  );
};