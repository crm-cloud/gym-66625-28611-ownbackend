import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Key, BarChart3, Users, AlertTriangle, Table, Grid3X3, Package } from 'lucide-react';
import { Locker, LockerFilters as LockerFiltersType } from '@/types/locker';
import { LockerCard } from '@/components/lockers/LockerCard';
import { LockerFilters } from '@/components/lockers/LockerFilters';
import { LockerForm } from '@/components/lockers/LockerForm';
import { AssignLockerDrawer } from '@/components/lockers/AssignLockerDrawer';
import { LockerTableView } from '@/components/lockers/LockerTableView';
import { BulkLockerCreationDialog } from '@/components/lockers/BulkLockerCreationDialog';
import { PermissionGate } from '@/components/PermissionGate';
import { useToast } from '@/hooks/use-toast';
import { useLockers, useLockerSummary, useCreateLocker, useUpdateLocker, useDeleteLocker, useAssignLocker, useReleaseLocker } from '@/hooks/useLockers';
import { useBranchContext } from '@/hooks/useBranchContext';
import { useBranches } from '@/hooks/useBranches';

export default function LockerManagement() {
  const [filters, setFilters] = useState<LockerFiltersType>({});
  const [showLockerForm, setShowLockerForm] = useState(false);
  const [showAssignDrawer, setShowAssignDrawer] = useState(false);
  const [showBulkCreateDialog, setShowBulkCreateDialog] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState<Locker | undefined>();
  const [selectedMember, setSelectedMember] = useState({ id: '', name: '' });
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const { toast } = useToast();
  
  const { currentBranchId } = useBranchContext();
  const { branches } = useBranches();
  const { data: lockers = [], isLoading } = useLockers(currentBranchId || undefined);
  const { data: summary } = useLockerSummary(currentBranchId || undefined);
  
  const createLockerMutation = useCreateLocker();
  const updateLockerMutation = useUpdateLocker();
  const deleteLockerMutation = useDeleteLocker();
  const assignLockerMutation = useAssignLocker();
  const releaseLockerMutation = useReleaseLocker();

  // Filter lockers based on current filters
  const filteredLockers = lockers.filter(locker => {
    if (filters.search && !locker.number.toLowerCase().includes(filters.search.toLowerCase()) &&
        !locker.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.branchId && locker.branchId !== filters.branchId) {
      return false;
    }
    if (filters.status && filters.status !== 'all' && locker.status !== filters.status) {
      return false;
    }
    if (filters.size && locker.size.id !== filters.size) {
      return false;
    }
    return true;
  });

  const handleAddLocker = (data: any) => {
    createLockerMutation.mutate({
      ...data,
      branch_id: currentBranchId
    });
  };

  const handleEditLocker = (locker: Locker) => {
    setSelectedLocker(locker);
    setShowLockerForm(true);
  };

  const handleUpdateLocker = (data: any) => {
    if (!selectedLocker) return;
    updateLockerMutation.mutate({
      id: selectedLocker.id,
      ...data
    });
  };

  const handleDeleteLocker = (lockerId: string) => {
    deleteLockerMutation.mutate(lockerId);
  };

  const handleAssignLocker = (locker: Locker) => {
    setSelectedLocker(locker);
    setShowAssignDrawer(true);
  };

  const handleReleaseLocker = (locker: Locker) => {
    releaseLockerMutation.mutate(locker.id);
  };

  const handleAssignComplete = (data: any) => {
    if (!selectedLocker) return;

    assignLockerMutation.mutate({
      lockerId: selectedLocker.id,
      memberId: data.memberId,
      monthlyFee: data.monthlyFee,
      expirationDate: data.expirationDate,
      notes: data.notes,
      createInvoice: data.monthlyFee > 0
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locker Management</h1>
          <p className="text-muted-foreground">
            Manage locker assignments and availability across all branches
          </p>
        </div>
        
        <div className="flex gap-2">
          <PermissionGate permission="lockers.create">
            <Button variant="outline" onClick={() => setShowBulkCreateDialog(true)}>
              <Package className="w-4 h-4 mr-2" />
              Bulk Create
            </Button>
            <Button onClick={() => setShowLockerForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Locker
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lockers</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalLockers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Key className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summary?.availableLockers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summary?.occupiedLockers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.occupancyRate.toFixed(0) || 0}% occupancy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary?.monthlyRevenue || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <LockerFilters
              filters={filters}
              onFiltersChange={setFilters}
              branches={branches.map(b => ({ id: b.id, name: b.name }))}
            />
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <Table className="w-4 h-4 mr-2" />
                Table
              </Button>
            </div>
          </div>

          {/* Content */}
          <PermissionGate permission="lockers.view">
            {viewMode === 'cards' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredLockers.map((locker) => (
                  <LockerCard
                    key={locker.id}
                    locker={locker}
                    onAssign={handleAssignLocker}
                    onRelease={handleReleaseLocker}
                    onEdit={handleEditLocker}
                    onDelete={handleDeleteLocker}
                  />
                ))}
              </div>
            ) : (
              <LockerTableView
                lockers={filteredLockers}
                onAssign={handleAssignLocker}
                onRelease={handleReleaseLocker}
                onEdit={handleEditLocker}
                onDelete={handleDeleteLocker}
                isLoading={isLoading}
              />
            )}
          </PermissionGate>

          {filteredLockers.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No lockers found</h3>
                <p className="text-muted-foreground mb-4">
                  No lockers match your current filters.
                </p>
                <Button variant="outline" onClick={() => setFilters({})}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Assignments</CardTitle>
              <CardDescription>
                Current locker assignments for this branch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLockers.filter(l => l.status === 'occupied').length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No active assignments found
                  </p>
                ) : (
                  filteredLockers
                    .filter(l => l.status === 'occupied')
                    .map((locker) => (
                      <div
                        key={locker.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            <span className="font-medium">{locker.number}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Assigned to {locker.assignedMemberName || 'Unknown Member'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Since {locker.assignedDate ? new Date(locker.assignedDate).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${locker.monthlyFee}/month</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReleaseLocker(locker)}
                          >
                            Release
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Utilization by Branch</CardTitle>
              </CardHeader>
              <CardContent>
                {branches.map((branch) => {
                  const branchLockers = lockers.filter(l => l.branchId === branch.id);
                  const occupiedCount = branchLockers.filter(l => l.status === 'occupied').length;
                  const utilization = branchLockers.length > 0 ? (occupiedCount / branchLockers.length) * 100 : 0;
                  
                  return (
                    <div key={branch.id} className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium">{branch.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {occupiedCount}/{branchLockers.length}
                        </span>
                        <div className="w-16 text-xs text-right">
                          {utilization.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Required</CardTitle>
              </CardHeader>
              <CardContent>
                {lockers.filter(l => l.status === 'maintenance').length === 0 ? (
                  <p className="text-sm text-muted-foreground">No lockers require maintenance</p>
                ) : (
                  <div className="space-y-2">
                    {lockers
                      .filter(l => l.status === 'maintenance')
                      .map((locker) => (
                        <div key={locker.id} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm">{locker.number}</span>
                          <span className="text-xs text-muted-foreground">
                            {locker.notes}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bulk Create Dialog */}
      {currentBranchId && (
        <BulkLockerCreationDialog
          open={showBulkCreateDialog}
          onOpenChange={setShowBulkCreateDialog}
          branchId={currentBranchId}
        />
      )}

      {/* Locker Form */}
      <LockerForm
        open={showLockerForm}
        onOpenChange={(open) => {
          setShowLockerForm(open);
          if (!open) setSelectedLocker(undefined);
        }}
        locker={selectedLocker}
        onSubmit={selectedLocker ? handleUpdateLocker : handleAddLocker}
        branches={branches.map(b => ({ id: b.id, name: b.name }))}
      />

      {/* Assign Locker Drawer */}
      <AssignLockerDrawer
        open={showAssignDrawer}
        onOpenChange={setShowAssignDrawer}
        memberId={selectedMember.id}
        memberName={selectedMember.name}
        branchId={selectedLocker?.branchId}
        onAssign={handleAssignComplete}
      />
    </div>
  );
}