import { useState, useMemo } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ClassCard } from '@/components/classes/ClassCard';
import { ClassFilters } from '@/types/class';
import { mockClasses, mockClassEnrollments, mockBranches, mockTrainers } from '@/utils/mockData';
import { useRBAC } from '@/hooks/useRBAC';
import { useToast } from '@/hooks/use-toast';

export const ClassListPage = () => {
  const navigate = useNavigate();
  const { hasPermission, currentUser } = useRBAC();
  const { toast } = useToast();
  const [filters, setFilters] = useState<ClassFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClasses = useMemo(() => {
    return mockClasses.filter(gymClass => {
      const matchesSearch = !searchQuery || 
        gymClass.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gymClass.trainerName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBranch = !filters.branchId || gymClass.branchId === filters.branchId;
      const matchesTrainer = !filters.trainerId || gymClass.trainerId === filters.trainerId;
      const matchesStatus = !filters.status || gymClass.status === filters.status;
      
      return matchesSearch && matchesBranch && matchesTrainer && matchesStatus;
    });
  }, [filters, searchQuery]);

  const handleEditClass = (classId: string) => {
    navigate(`/classes/${classId}/edit`);
  };

  const handleViewDetails = (classId: string) => {
    navigate(`/classes/${classId}/detail`);
  };

  const handleCancelClass = (classId: string) => {
    toast({
      title: 'Class Cancelled',
      description: 'The class has been successfully cancelled.',
    });
  };

  const updateFilter = (key: keyof ClassFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground">Manage gym classes and schedules</p>
        </div>
        {hasPermission('classes.create') && (
          <Button onClick={() => navigate('/classes/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search classes or trainers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Branch Filter */}
            <Select
              value={filters.branchId || 'all'}
              onValueChange={(value) => updateFilter('branchId', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {mockBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Trainer Filter */}
            <Select
              value={filters.trainerId || 'all'}
              onValueChange={(value) => updateFilter('trainerId', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Trainers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trainers</SelectItem>
                {mockTrainers.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No classes found matching your criteria.</p>
          </div>
        ) : (
          filteredClasses.map((gymClass) => (
            <ClassCard
              key={gymClass.id}
              gymClass={gymClass}
              onEdit={hasPermission('classes.edit') ? handleEditClass : undefined}
              onViewDetails={handleViewDetails}
              userRole={currentUser?.role as any}
            />
          ))
        )}
      </div>
    </div>
  );
};