import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MemberFiltersComponent } from '@/components/member/MemberFilters';
import { MemberTable } from '@/components/member/MemberTable';
import { Member, MemberFilters } from '@/types/member';
import { useRBAC } from '@/hooks/useRBAC';
import { useBranchContext } from '@/hooks/useBranchContext';
import { useMembers } from '@/hooks/useMembers';
import { useBranches } from '@/hooks/useBranches';

const ITEMS_PER_PAGE = 10;

export const MemberListPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useRBAC();
  const { currentBranchId } = useBranchContext();
  const { branches } = useBranches();
  const [filters, setFilters] = useState<MemberFilters>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Determine which branch to use for server-side filtering: explicit filter or current selected branch
  const effectiveBranchId = filters.branchId ?? currentBranchId ?? undefined;

  const { data: rawMembers = [], isLoading } = useMembers({ branchId: effectiveBranchId });

  // Map DB rows to Member shape expected by table
  const mappedMembers: Member[] = useMemo(() => {
    return (rawMembers as any[]).map((row) => {
      const branchNameFromList = branches.find(b => b.id === (row.branch_id ?? row.branchId))?.name;
      const membershipPlan = row.membership_plan ?? row.membershipPlan;
      // Compute membership status: if no plan, treat as not-assigned
      let computedStatus = row.membership_status ?? row.membershipStatus;
      if (!membershipPlan) {
        computedStatus = 'not-assigned';
      }
      return {
        id: row.id,
        fullName: row.full_name ?? row.fullName ?? '',
        phone: row.phone ?? '',
        email: row.email ?? '',
        dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : undefined,
        gender: row.gender,
        address: row.address ?? { street: '', city: '', state: '', pincode: '' },
        governmentId: row.government_id ?? row.governmentId,
        measurements: row.measurements ?? {},
        emergencyContact: row.emergency_contact ?? {},
        profilePhoto: row.profile_photo ?? row.profilePhoto,
        branchId: row.branch_id ?? row.branchId,
        branchName: branchNameFromList ?? row.branchName ?? '—',
        membershipStatus: computedStatus ?? 'not-assigned',
        membershipPlan,
        trainerId: row.trainer_id ?? row.trainerId,
        trainerName: row.trainer_profiles?.name ?? row.trainerName,
        joinedDate: row.joined_date ? new Date(row.joined_date) : (row.created_at ? new Date(row.created_at) : new Date()),
        createdBy: row.created_by ?? '',
        createdAt: row.created_at ? new Date(row.created_at) : new Date(),
        updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        pointsBalance: typeof row.points_balance === 'number' ? row.points_balance : 0,
      } as Member;
    });
  }, [rawMembers, branches]);

  const filteredMembers = useMemo(() => {
    return mappedMembers.filter(member => {
      const matchesSearch = !filters.searchQuery || 
        member.fullName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        member.phone.includes(filters.searchQuery) ||
        member.email.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      const matchesBranch = !filters.branchId || member.branchId === filters.branchId;
      const matchesStatus = !filters.membershipStatus || member.membershipStatus === filters.membershipStatus;
      
      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [filters, mappedMembers]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleFiltersChange = (newFilters: MemberFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">Manage gym members and their information</p>
        </div>
        {hasPermission('members.create') && (
          <Button onClick={() => navigate('/members/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        )}
        {hasPermission('members.create') && (
          <Button variant="outline" onClick={() => navigate('/membership/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add with Membership
          </Button>
        )}
      </div>

      <MemberFiltersComponent filters={filters} onFiltersChange={handleFiltersChange} />

      <MemberTable
        members={paginatedMembers}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};