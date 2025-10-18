import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemberForm } from '@/components/member/MemberForm';
import { MemberFormData } from '@/types/member';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export const MemberCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authState } = useAuth();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: MemberFormData) => {
    try {
      const payload = {
        full_name: data.fullName,
        phone: data.phone,
        email: data.email,
        date_of_birth: data.dateOfBirth?.toISOString?.() || data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        government_id: data.governmentId,
        measurements: data.measurements,
        emergency_contact: data.emergencyContact,
        profile_photo: data.profilePhoto ?? null,
        branch_id: data.branchId,
        trainer_id: data.trainerId ?? null,
        enable_login: data.enableLogin,
        password: data.password,
      };

      await api.post('/api/members', payload);

      toast({
        title: 'Member Created',
        description: `${data.fullName} has been successfully added as a member.`,
      });

      await queryClient.invalidateQueries({ queryKey: ['members'] });
      navigate('/members');
    } catch (err: any) {
      console.error('Failed to create member:', err);
      toast({
        title: 'Failed to create member',
        description: err.response?.data?.error || err.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/members')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Members
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Member</h1>
          <p className="text-muted-foreground">Fill in the details to create a new member profile</p>
        </div>
      </div>

      <MemberForm onSubmit={handleSubmit} />
    </div>
  );
};