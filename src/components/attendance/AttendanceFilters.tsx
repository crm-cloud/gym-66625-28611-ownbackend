import { useState } from 'react';
import { CalendarIcon, Filter, X, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AttendanceFilter } from '@/types/attendance';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AttendanceFiltersProps {
  filters: AttendanceFilter;
  onFiltersChange: (filters: AttendanceFilter) => void;
  onExport: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const AttendanceFilters = ({
  filters,
  onFiltersChange,
  onExport,
  onRefresh,
  isLoading = false
}: AttendanceFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof AttendanceFilter, value: any) => {
    // If the value is 'all', set it to undefined to clear the filter
    if (value === 'all') {
      const newFilters = { ...filters };
      delete newFilters[key];
      onFiltersChange(newFilters);
    } else {
      onFiltersChange({ ...filters, [key]: value });
    }
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== '' && value !== null
    ).length;
  };

  const removeFilter = (key: keyof AttendanceFilter) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        {/* Primary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="col-span-1 md:col-span-2">
            <Input
              placeholder="Search by name, email, or ID..."
              value={filters.searchTerm || ''}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Date From */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-full",
                  !filters.dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateFrom ? format(filters.dateFrom, "PPP") : "From date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) => updateFilter('dateFrom', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Date To */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-full",
                  !filters.dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateTo ? format(filters.dateTo, "PPP") : "To date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) => updateFilter('dateTo', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Status */}
          <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="checked-in">Checked In</SelectItem>
              <SelectItem value="checked-out">Checked Out</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex-1"
            >
              <Filter className="w-4 h-4 mr-1" />
              Advanced
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
            {/* User Role */}
            <Select value={filters.userRole || 'all'} onValueChange={(value) => updateFilter('userRole', value === 'all' ? undefined : value)}>
              <SelectTrigger>
                <SelectValue placeholder="User Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="member">Members</SelectItem>
                <SelectItem value="trainer">Trainers</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>

            {/* Entry Method */}
            <Select value={filters.entryMethod || 'all'} onValueChange={(value) => updateFilter('entryMethod', value === 'all' ? undefined : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Entry Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="biometric">Biometric</SelectItem>
                <SelectItem value="manual">Manual Entry</SelectItem>
                <SelectItem value="card">Card/Badge</SelectItem>
                <SelectItem value="mobile">Mobile App</SelectItem>
              </SelectContent>
            </Select>

            {/* Branch */}
            <Select value={filters.branchId || 'all'} onValueChange={(value) => updateFilter('branchId', value === 'all' ? undefined : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="branch-001">Downtown Branch</SelectItem>
                <SelectItem value="branch-002">Westside Branch</SelectItem>
                <SelectItem value="branch-003">Northside Branch</SelectItem>
              </SelectContent>
            </Select>

            {/* Late Filter */}
            <Select 
              value={filters.isLate === undefined ? 'all' : filters.isLate.toString()} 
              onValueChange={(value) => updateFilter('isLate', value === 'all' ? undefined : value === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Late Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="true">Late Only</SelectItem>
                <SelectItem value="false">On Time Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            {filters.searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Search: {filters.searchTerm}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('searchTerm')}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="gap-1">
                Status: {filters.status}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('status')}
                />
              </Badge>
            )}
            {filters.userRole && (
              <Badge variant="secondary" className="gap-1">
                Role: {filters.userRole}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('userRole')}
                />
              </Badge>
            )}
            {filters.entryMethod && (
              <Badge variant="secondary" className="gap-1">
                Method: {filters.entryMethod}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('entryMethod')}
                />
              </Badge>
            )}
            {filters.dateFrom && (
              <Badge variant="secondary" className="gap-1">
                From: {format(filters.dateFrom, "MMM dd")}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('dateFrom')}
                />
              </Badge>
            )}
            {filters.dateTo && (
              <Badge variant="secondary" className="gap-1">
                To: {format(filters.dateTo, "MMM dd")}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('dateTo')}
                />
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="h-6 px-2 text-xs"
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};