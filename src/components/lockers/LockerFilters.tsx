import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import { LockerFilters as LockerFiltersType } from '@/types/locker';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LockerFiltersProps {
  filters: LockerFiltersType;
  onFiltersChange: (filters: LockerFiltersType) => void;
  branches: { id: string; name: string; }[];
}

export function LockerFilters({ filters, onFiltersChange, branches }: LockerFiltersProps) {
  // Fetch locker sizes from database
  const { data: lockerSizes = [] } = useQuery({
    queryKey: ['locker_sizes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locker_sizes')
        .select('*')
        .order('monthly_fee', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });
  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'all');

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search lockers..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>

          {/* Branch Filter */}
          <Select
            value={filters.branchId || 'all'}
            onValueChange={(value) => 
              onFiltersChange({ 
                ...filters, 
                branchId: value === 'all' ? undefined : value 
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => 
              onFiltersChange({ 
                ...filters, 
                status: value === 'all' ? undefined : value as any
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>

          {/* Size Filter */}
          <Select
            value={filters.size || 'all'}
            onValueChange={(value) => 
              onFiltersChange({ 
                ...filters, 
                size: value === 'all' ? undefined : value 
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Sizes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sizes</SelectItem>
              {lockerSizes.map((size) => (
                <SelectItem key={size.id} value={size.id}>
                  {size.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}