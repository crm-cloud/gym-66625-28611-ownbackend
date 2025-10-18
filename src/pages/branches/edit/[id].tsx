import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BranchEditForm } from '@/components/branches/BranchEditForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function BranchEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: branch, isLoading, error } = useQuery({
    queryKey: ['branch', id],
    queryFn: async () => {
      if (!id) throw new Error('Branch ID is required');
      
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleSuccess = () => {
    navigate('/branches');
  };

  const handleCancel = () => {
    navigate('/branches');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading branch details...</p>
        </div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Branches
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-destructive">Error</h2>
              <p className="text-muted-foreground mt-2">
                {error?.message || 'Branch not found'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Branches
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Branch</h1>
          <p className="text-muted-foreground">Update branch information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branch Information</CardTitle>
          <CardDescription>
            Update the details for {branch.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BranchEditForm 
            branch={branch}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}