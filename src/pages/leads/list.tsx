
import { useState, useMemo } from 'react';
import { Plus, Download, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { LeadTable } from '@/components/leads/LeadTable';
import { ConvertToMemberDialog } from '@/components/leads/ConvertToMemberDialog';
import { PermissionGate } from '@/components/PermissionGate';
import { useToast } from '@/hooks/use-toast';
import { Lead, LeadFilters as LeadFiltersType } from '@/types/lead';
import { MemberFormData } from '@/types/member';
import { mockLeads, mockLeadStats } from '@/utils/mockData';
import { processLeadConversion } from '@/utils/leadConversion';

export const LeadListPage = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [filters, setFilters] = useState<LeadFiltersType>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);

  // Filter leads based on current filters
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search filter
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const searchableText = `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.phone}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(lead.status)) return false;
      }

      // Source filter
      if (filters.source && filters.source.length > 0) {
        if (!filters.source.includes(lead.source)) return false;
      }

      // Priority filter
      if (filters.priority && filters.priority.length > 0) {
        if (!filters.priority.includes(lead.priority)) return false;
      }

      // Assigned to filter
      if (filters.assignedTo && filters.assignedTo.length > 0) {
        if (!lead.assignedTo || !filters.assignedTo.includes(lead.assignedTo)) return false;
      }

      return true;
    });
  }, [leads, filters]);

  const handleViewLead = (lead: Lead) => {
    // Navigate to lead detail page
    console.log('View lead:', lead);
    toast({
      title: 'Lead Details',
      description: `Viewing details for ${lead.firstName} ${lead.lastName}`,
    });
  };

  const handleEditLead = (lead: Lead) => {
    // Open edit lead dialog
    console.log('Edit lead:', lead);
    toast({
      title: 'Edit Lead',
      description: `Editing ${lead.firstName} ${lead.lastName}`,
    });
  };

  const handleConvertLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsConvertDialogOpen(true);
  };

  const handleConversion = async (
    memberData: MemberFormData,
    membershipData: any,
    notes?: string
  ) => {
    if (!selectedLead) return;

    try {
      // Process the conversion
      const convertedBy = 'current-user@gym.com'; // This would come from auth context
      const result = await processLeadConversion(
        selectedLead,
        memberData,
        membershipData,
        convertedBy,
        notes
      );

      // Update the leads list to reflect the conversion
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === selectedLead.id ? result.updatedLead : lead
        )
      );

      toast({
        title: 'Conversion Successful',
        description: `${selectedLead.firstName} ${selectedLead.lastName} has been converted to a member successfully.`,
      });

      // Log the conversion details for debugging
      console.log('Conversion completed:', {
        member: result.member,
        membership: result.membershipAssignment,
        invoice: result.invoice,
        conversionLog: result.conversionLog,
      });

    } catch (error) {
      console.error('Conversion failed:', error);
      toast({
        title: 'Conversion Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred during conversion.',
        variant: 'destructive',
      });
    }
  };

  const handleScheduleTask = (lead: Lead) => {
    // Open task scheduling dialog
    console.log('Schedule task for lead:', lead);
    toast({
      title: 'Schedule Task',
      description: `Scheduling task for ${lead.firstName} ${lead.lastName}`,
    });
  };

  const handleExportLeads = () => {
    // Export filtered leads
    console.log('Export leads:', filteredLeads);
    toast({
      title: 'Export Started',
      description: `Exporting ${filteredLeads.length} leads to CSV`,
    });
  };

  const stats = mockLeadStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lead Management</h1>
          <p className="text-muted-foreground">
            Track and manage potential new members
          </p>
        </div>
        <div className="flex gap-3">
          <PermissionGate permission="leads.export">
            <Button variant="outline" onClick={handleExportLeads}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </PermissionGate>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <PermissionGate permission="leads.create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <div className="text-sm text-muted-foreground">
              +{stats.leadsThisMonth - stats.leadsLastMonth} from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newLeads}</div>
            <div className="text-sm text-muted-foreground">
              Requiring initial contact
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <div className="text-sm text-muted-foreground">
              {stats.convertedLeads} of {stats.totalLeads} converted
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageResponseTime}h</div>
            <div className="text-sm text-muted-foreground">
              First contact response
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <LeadFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={leads.length}
        filteredCount={filteredLeads.length}
      />

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <LeadTable
            leads={filteredLeads}
            onViewLead={handleViewLead}
            onEditLead={handleEditLead}
            onConvertLead={handleConvertLead}
            onScheduleTask={handleScheduleTask}
          />
        </CardContent>
      </Card>

      {/* Convert to Member Dialog */}
      <ConvertToMemberDialog
        lead={selectedLead}
        open={isConvertDialogOpen}
        onOpenChange={setIsConvertDialogOpen}
        onConvert={handleConversion}
      />
    </div>
  );
};
