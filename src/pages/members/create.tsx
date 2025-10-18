import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemberForm } from '@/components/member/MemberForm';
import { MemberFormData } from '@/types/member';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { enableMemberLogin } from '@/hooks/useMembers';

export const MemberCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authState } = useAuth();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: MemberFormData) => {
    try {
      // Map form data to DB columns (snake_case)
      const payload: any = {
        full_name: data.fullName,
        phone: data.phone,
        email: data.email,
        date_of_birth: data.dateOfBirth?.toISOString?.() || data.dateOfBirth,
        gender: data.gender,
        address: data.address, // JSON
        government_id: data.governmentId, // JSON
        measurements: data.measurements, // JSON includes BMI if present
        emergency_contact: data.emergencyContact, // JSON
        profile_photo: data.profilePhoto ?? null,
        branch_id: data.branchId,
        trainer_id: data.trainerId ?? null,
        created_by: authState.user?.id ?? null,
      };

      const { data: insertResult, error } = await supabase
        .from('members')
        .insert([payload])
        .select('id')
        .single();

      if (error) throw error;

      // Enable login if requested
      if (data.enableLogin && data.password) {
        const loginResult = await enableMemberLogin(
          insertResult.id,
          data.email,
          data.fullName,
          data.password,
          data.branchId
        );

        if (loginResult.error) {
          toast({
            title: 'Member Created (Login Setup Failed)',
            description: `${data.fullName} was created but login setup failed: ${loginResult.error.message}`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Member Created with Login Access',
            description: `${data.fullName} has been added and can now log in.`,
          });
        }
      } else {
        toast({
          title: 'Member Created',
          description: `${data.fullName} has been successfully added as a member.`,
        });
      }

      // Refresh members list
      await queryClient.invalidateQueries({ queryKey: ['members'] });

      navigate('/members');
    } catch (err: any) {
      console.error('Failed to create member:', err);
      toast({
        title: 'Failed to create member',
        description: err?.message || 'Please try again.',
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