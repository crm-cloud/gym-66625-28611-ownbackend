
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminDashboard } from '@/components/dashboards/SuperAdminDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { ManagerDashboard } from '@/components/dashboards/ManagerDashboard';
import { StaffDashboard } from '@/components/dashboards/StaffDashboard';
import { TrainerDashboard } from '@/components/dashboards/TrainerDashboard';
import { MemberDashboard } from '@/components/dashboards/MemberDashboard';

export default function Dashboard() {
  const { authState } = useAuth();
  
  if (!authState.user) return null;
  
  switch (authState.user.role) {
    case 'super-admin':
      return <SuperAdminDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'team':
      // Enhanced team role handling
      switch (authState.user.teamRole) {
        case 'manager':
          return <ManagerDashboard />;
        case 'trainer':
          return <TrainerDashboard />;
        case 'staff':
          return <StaffDashboard />;
        default:
          return (
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold mb-2">Invalid Team Role</h1>
              <p className="text-muted-foreground">
                Please contact your administrator to assign a proper team role.
              </p>
            </div>
          );
      }
    case 'member':
      const member = { id: authState.user.id, fullName: authState.user.email || 'Member', profilePhoto: null };
      if (!member) {
        return (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-2">Member Not Found</h1>
            <p className="text-muted-foreground">Could not find member profile for this account.</p>
          </div>
        );
      }
      return <MemberDashboard 
        memberId={member.id}
        memberName={member.fullName}
        memberAvatar={member.profilePhoto}
      />;
    default:
      return (
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-2">Invalid Role</h1>
          <p className="text-muted-foreground">
            Please contact your administrator to assign a valid role.
          </p>
        </div>
      );
  }
}
