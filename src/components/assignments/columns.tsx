import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Assignment } from '@/types/assignment';

export const columns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: string) => void;
}): ColumnDef<Assignment>[] => [
  {
    accessorKey: 'memberName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="p-0 hover:bg-transparent"
        >
          Member
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.original.memberName}</div>
    ),
  },
  {
    accessorKey: 'planName',
    header: 'Plan',
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Badge
          variant={row.original.planType === 'diet' ? 'default' : 'secondary'}
          className="whitespace-nowrap"
        >
          {row.original.planType === 'diet' ? 'Diet' : 'Workout'}
        </Badge>
        <span>{row.original.planName}</span>
      </div>
    ),
  },
  {
    accessorKey: 'startDate',
    header: 'Date Range',
    cell: ({ row }) => {
      const startDate = new Date(row.original.startDate);
      const endDate = row.original.endDate ? new Date(row.original.endDate) : null;
      
      return (
        <div className="text-sm text-muted-foreground">
          <div>{format(startDate, 'MMM d, yyyy')}</div>
          {endDate && (
            <div className="text-xs text-muted-foreground/70">
              to {format(endDate, 'MMM d, yyyy')}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      const variant = {
        active: 'default',
        pending: 'outline',
        completed: 'secondary',
        expired: 'destructive',
      }[status] as 'default' | 'outline' | 'secondary' | 'destructive';

      return (
        <Badge variant={variant} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const assignment = row.original;

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onEdit(assignment)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (confirm('Are you sure you want to delete this assignment?')) {
                    onDelete(assignment.id);
                  }
                }}
                className="cursor-pointer text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];