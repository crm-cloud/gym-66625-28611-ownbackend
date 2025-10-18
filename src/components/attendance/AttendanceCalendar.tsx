import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AttendanceRecord } from '@/types/attendance';
import { cn } from '@/lib/utils';

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onRecordClick?: (record: AttendanceRecord) => void;
  viewMode?: 'all' | 'members' | 'staff';
  onViewModeChange?: (mode: 'all' | 'members' | 'staff') => void;
}

export const AttendanceCalendar = ({
  records,
  selectedDate = new Date(),
  onDateSelect,
  onRecordClick,
  viewMode = 'all',
  onViewModeChange
}: AttendanceCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getRecordsForDate = (date: Date) => {
    return records.filter(record => {
      const matchesDate = isSameDay(record.checkInTime, date);
      const matchesViewMode = 
        viewMode === 'all' || 
        (viewMode === 'members' && record.userRole === 'member') ||
        (viewMode === 'staff' && ['trainer', 'staff', 'admin'].includes(record.userRole));
      
      return matchesDate && matchesViewMode;
    });
  };

  const getDateStats = (date: Date) => {
    const dayRecords = getRecordsForDate(date);
    return {
      total: dayRecords.length,
      checkedIn: dayRecords.filter(r => r.status === 'checked-in').length,
      checkedOut: dayRecords.filter(r => r.status === 'checked-out').length,
      late: dayRecords.filter(r => r.isLate).length,
      members: dayRecords.filter(r => r.userRole === 'member').length,
      staff: dayRecords.filter(r => ['trainer', 'staff', 'admin'].includes(r.userRole)).length
    };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (date: Date) => {
    onDateSelect?.(date);
  };

  const getDayClasses = (date: Date) => {
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const stats = getDateStats(date);
    
    return cn(
      "relative p-2 h-24 border border-border transition-all duration-200 cursor-pointer",
      "hover:bg-muted/50 hover:border-muted-foreground/20",
      !isCurrentMonth && "text-muted-foreground bg-muted/20",
      isToday(date) && "bg-primary/10 border-primary/30",
      isSelected && "bg-primary/20 border-primary",
      stats.total > 0 && "bg-accent/30"
    );
  };

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Attendance Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={onViewModeChange}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="members">Members</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <h3 className="text-lg font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted/30"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {days.map((date) => {
              const stats = getDateStats(date);
              const dayRecords = getRecordsForDate(date);
              
              return (
                <Tooltip key={date.toISOString()}>
                  <TooltipTrigger asChild>
                    <div
                      className={getDayClasses(date)}
                      onClick={() => handleDateClick(date)}
                    >
                      {/* Date Number */}
                      <div className="text-sm font-medium mb-1">
                        {format(date, 'd')}
                      </div>
                      
                      {/* Attendance Summary */}
                      {stats.total > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Total:</span>
                            <Badge variant="secondary" className="text-xs h-4">
                              {stats.total}
                            </Badge>
                          </div>
                          
                          {stats.checkedIn > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-success">Active:</span>
                              <Badge variant="default" className="text-xs h-4 bg-success">
                                {stats.checkedIn}
                              </Badge>
                            </div>
                          )}
                          
                          {stats.late > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-warning">Late:</span>
                              <Badge variant="destructive" className="text-xs h-4">
                                {stats.late}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Today Indicator */}
                      {isToday(date) && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-2">
                      <div className="font-medium">
                        {format(date, 'EEEE, MMMM do, yyyy')}
                      </div>
                      
                      {stats.total > 0 ? (
                        <div className="space-y-1 text-sm">
                          <div>Total Records: {stats.total}</div>
                          <div>Members: {stats.members}</div>
                          <div>Staff: {stats.staff}</div>
                          <div>Currently Active: {stats.checkedIn}</div>
                          <div>Completed: {stats.checkedOut}</div>
                          {stats.late > 0 && (
                            <div className="text-warning">Late Arrivals: {stats.late}</div>
                          )}
                          
                          {dayRecords.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <div className="font-medium mb-1">Recent Activity:</div>
                              {dayRecords.slice(0, 3).map((record) => (
                                <div key={record.id} className="text-xs">
                                  {record.userName} - {format(record.checkInTime, 'h:mm a')}
                                </div>
                              ))}
                              {dayRecords.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{dayRecords.length - 3} more...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm">
                          No attendance records
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};