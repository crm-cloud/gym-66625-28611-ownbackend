
import { useState } from 'react';
import { MoreHorizontal, Eye, Edit, UserPlus, Calendar, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Lead, LeadStatus, LeadSource, LeadPriority } from '@/types/lead';
import { format, formatDistanceToNow } from 'date-fns';

interface LeadTableProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onConvertLead: (lead: Lead) => void;
  onScheduleTask: (lead: Lead) => void;
}

const getStatusBadge = (status: LeadStatus) => {
  const variants = {
    new: { color: 'bg-blue-500', label: 'New' },
    contacted: { color: 'bg-yellow-500', label: 'Contacted' },
    qualified: { color: 'bg-orange-500', label: 'Qualified' },
    converted: { color: 'bg-green-500', label: 'Converted' },
    lost: { color: 'bg-red-500', label: 'Lost' }
  };
  
  const variant = variants[status];
  return (
    <Badge variant="secondary" className="gap-1">
      <div className={`w-2 h-2 rounded-full ${variant.color}`} />
      {variant.label}
    </Badge>
  );
};

const getPriorityBadge = (priority: LeadPriority) => {
  const variants = {
    low: 'default',
    medium: 'secondary',
    high: 'destructive',
    urgent: 'destructive'
  } as const;
  
  return (
    <Badge variant={variants[priority]} className="capitalize">
      {priority}
    </Badge>
  );
};

const getSourceBadge = (source: LeadSource) => {
  return (
    <Badge variant="outline" className="capitalize">
      {source.replace('-', ' ')}
    </Badge>
  );
};

export const LeadTable = ({ leads, onViewLead, onEditLead, onConvertLead, onScheduleTask }: LeadTableProps) => {
  const [sortField, setSortField] = useState<keyof Lead>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Lead) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedLeads = [...leads].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (aValue instanceof Date) aValue = aValue.getTime();
    if (bValue instanceof Date) bValue = bValue.getTime();
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('status')}
            >
              Status
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('source')}
            >
              Source
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('priority')}
            >
              Priority
            </TableHead>
            <TableHead>Programs</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('createdAt')}
            >
              Created
            </TableHead>
            <TableHead>Next Follow-up</TableHead>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedLeads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead.firstName} ${lead.lastName}`} />
                    <AvatarFallback>{lead.firstName[0]}{lead.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                    <div className="text-sm text-muted-foreground">{lead.email}</div>
                    <div className="text-sm text-muted-foreground">{lead.phone}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(lead.status)}</TableCell>
              <TableCell>{getSourceBadge(lead.source)}</TableCell>
              <TableCell>{getPriorityBadge(lead.priority)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {lead.interestedPrograms.slice(0, 2).map((program) => (
                    <Badge key={program} variant="outline" className="text-xs">
                      {program}
                    </Badge>
                  ))}
                  {lead.interestedPrograms.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{lead.interestedPrograms.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {lead.assignedTo ? (
                  <div className="text-sm">
                    <div className="font-medium">Assigned</div>
                    <div className="text-muted-foreground">{lead.assignedTo}</div>
                  </div>
                ) : (
                  <Badge variant="secondary">Unassigned</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{format(lead.createdAt, 'MMM dd, yyyy')}</div>
                  <div className="text-muted-foreground">
                    {formatDistanceToNow(lead.createdAt, { addSuffix: true })}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {lead.nextFollowUpDate ? (
                  <div className="text-sm">
                    <div>{format(lead.nextFollowUpDate, 'MMM dd')}</div>
                    <div className="text-muted-foreground">
                      {formatDistanceToNow(lead.nextFollowUpDate, { addSuffix: true })}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No follow-up</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewLead(lead)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditLead(lead)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Lead
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onScheduleTask(lead)}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Task
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Lead
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </DropdownMenuItem>
                    {lead.status !== 'converted' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onConvertLead(lead)}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Convert to Member
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {sortedLeads.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No leads found matching your criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
