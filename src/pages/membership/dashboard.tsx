import { MemberDashboard } from '@/components/membership/MemberDashboard';
import { useAuth } from '@/hooks/useAuth';

export const MemberDashboardPage = () => {
  const { authState } = useAuth();
  
  // Find member data based on logged in user  
  const member = { id: authState.user?.id, fullName: authState.user?.email || 'Member', profilePhoto: null };

  if (!member) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Member Not Found</h1>
        <p className="text-muted-foreground">Could not find member profile for this account.</p>
      </div>
    );
  }

  return (
    <MemberDashboard 
      memberId={member.id}
      memberName={member.fullName}
      memberAvatar={member.profilePhoto}
    />
  );
};