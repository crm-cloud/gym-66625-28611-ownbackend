import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Key, UserPlus, UserMinus, Edit, Trash2 } from 'lucide-react';
import { Locker } from '@/types/locker';
import { LockerStatusBadge } from './LockerStatusBadge';
import { ColumnDef } from '@tanstack/react-table';

interface LockerTableViewProps {
  lockers: Locker[];
  onAssign: (locker: Locker) => void;
  onRelease: (locker: Locker) => void;
  onEdit: (locker: Locker) => void;
  onDelete: (lockerId: string) => void;
  isLoading?: boolean;
}

export function LockerTableView({
  lockers,
  onAssign,
  onRelease,
  onEdit,
  onDelete,
  isLoading = false
}: LockerTableViewProps) {
  const [globalFilter, setGlobalFilter] = useState('');

  const columns: ColumnDef<Locker>[] = [
    {
      accessorKey: 'number',
      header: 'Locker #',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          <Key className="w-4 h-4 text-muted-foreground" />
          {row.original.number}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <LockerStatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: 'assignedMemberName',
      header: 'Assigned Member',
      cell: ({ row }) => (
        row.original.assignedMemberName || (
          <span className="text-muted-foreground">Unassigned</span>
        )
      ),
    },
    {
      accessorKey: 'size.name',
      header: 'Size',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.size.name}
        </Badge>
      ),
    },
    {
      accessorKey: 'monthlyFee',
      header: 'Monthly Fee',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.monthlyFee > 0 ? (
            `$${row.original.monthlyFee}`
          ) : (
            <span className="text-green-600">Free</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'assignedDate',
      header: 'Assigned Date',
      cell: ({ row }) => (
        row.original.assignedDate ? 
          new Date(row.original.assignedDate).toLocaleDateString() :
          '-'
      ),
    },
    {
      accessorKey: 'expirationDate',
      header: 'Expiry Date',
      cell: ({ row }) => (
        row.original.expirationDate ? 
          new Date(row.original.expirationDate).toLocaleDateString() :
          '-'
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const locker = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(locker)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {locker.status === 'available' ? (
                <DropdownMenuItem onClick={() => onAssign(locker)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign
                </DropdownMenuItem>
              ) : locker.status === 'occupied' ? (
                <DropdownMenuItem onClick={() => onRelease(locker)}>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Release
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem 
                onClick={() => onDelete(locker.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search lockers by number, name, or member..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={lockers.filter(locker => 
          globalFilter === '' || 
          locker.number.toLowerCase().includes(globalFilter.toLowerCase()) ||
          locker.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
          locker.assignedMemberName?.toLowerCase().includes(globalFilter.toLowerCase())
        )}
        isLoading={isLoading}
        enableSearch={false} // We handle search manually above
        enableColumnVisibility={true}
        enablePagination={true}
        pageSize={20}
      />
    </div>
  );
}