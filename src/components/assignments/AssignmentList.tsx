import { useState, useEffect } from 'react';
import { Assignment, AssignmentFilters } from '@/types/assignment';
import { assignmentService } from '@/services/assignmentService';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AssignmentForm } from './AssignmentForm';
import { useToast } from '@/components/ui/use-toast';

export function AssignmentList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState<AssignmentFilters>({});
  const { toast } = useToast();

  useEffect(() => {
    loadAssignments();
  }, [filters]);

  const loadAssignments = async () => {
    try {
      setIsLoading(true);
      const data = await assignmentService.getAssignments(filters);
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignments. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignmentCreated = (newAssignment: Assignment) => {
    setAssignments([...assignments, newAssignment]);
    setIsFormOpen(false);
    toast({
      title: 'Success',
      description: 'Assignment created successfully',
    });
  };

  const handleAssignmentUpdated = (updatedAssignment: Assignment) => {
    setAssignments(assignments.map(a => 
      a.id === updatedAssignment.id ? updatedAssignment : a
    ));
  };

  const handleAssignmentDeleted = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Member Plan Assignments</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Assignment
        </Button>
      </div>

      <div className="rounded-md border">
        <DataTable
          columns={columns({
            onEdit: handleAssignmentUpdated,
            onDelete: handleAssignmentDeleted,
          })}
          data={assignments}
          isLoading={isLoading}
          searchKey="memberName"
          searchPlaceholder="Filter by member name..."
        />
      </div>

      <AssignmentForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleAssignmentCreated}
      />
    </div>
  );
}
