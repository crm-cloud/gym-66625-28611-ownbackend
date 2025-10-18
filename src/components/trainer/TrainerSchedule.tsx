import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { mockTrainerAssignments, mockTrainers } from '@/utils/mockData';
import { 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

interface TrainerScheduleProps {
  trainerId: string;
}

export const TrainerSchedule = ({ trainerId }: TrainerScheduleProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [newBlockoutOpen, setNewBlockoutOpen] = useState(false);

  const trainer = mockTrainers.find(t => t.id === trainerId);
  const assignments = mockTrainerAssignments.filter(a => a.trainerId === trainerId);

  // Mock availability data - in real app this would come from trainer.availability
  const [availability, setAvailability] = useState([
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isAvailable: true },
    { dayOfWeek: 0, startTime: '10:00', endTime: '14:00', isAvailable: false }
  ]);

  const [blockouts, setBlockouts] = useState([
    {
      id: 'blockout_001',
      startDate: new Date('2024-01-25T13:00:00'),
      endDate: new Date('2024-01-25T14:00:00'),
      reason: 'Lunch break',
      type: 'break'
    },
    {
      id: 'blockout_002',
      startDate: new Date('2024-01-26T10:00:00'),
      endDate: new Date('2024-01-26T12:00:00'),
      reason: 'Training certification',
      type: 'personal'
    }
  ]);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const selectedDateAssignments = useMemo(() => {
    return assignments.filter(a => {
      const assignmentDate = new Date(a.scheduledDate);
      return assignmentDate.toDateString() === selectedDate.toDateString();
    });
  }, [assignments, selectedDate]);

  const weeklyAssignments = useMemo(() => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return assignments.filter(a => {
      const assignmentDate = new Date(a.scheduledDate);
      return assignmentDate >= weekStart && assignmentDate <= weekEnd;
    });
  }, [assignments, selectedDate]);

  const handleAvailabilityChange = (dayIndex: number, field: string, value: any) => {
    setAvailability(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, [field]: value } : day
    ));
  };

  const saveAvailability = async () => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsEditingAvailability(false);
    toast({
      title: "Availability Updated",
      description: "Your availability schedule has been saved successfully.",
    });
  };

  const addBlockout = async (blockoutData: any) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newBlockout = {
      id: `blockout_${Date.now()}`,
      ...blockoutData
    };
    
    setBlockouts(prev => [...prev, newBlockout]);
    setNewBlockoutOpen(false);
    
    toast({
      title: "Time Blocked",
      description: "Your time block has been added to the schedule.",
    });
  };

  const formatSpecialty = (specialty: string) => {
    return specialty.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      case 'in_progress': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (!trainer) {
    return <div>Trainer not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-6 w-6" />
          Schedule Management
        </h2>
        <div className="flex gap-3">
          <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'calendar' | 'list')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">Calendar</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={newBlockoutOpen} onOpenChange={setNewBlockoutOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Block Time
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Block Time Period</DialogTitle>
              </DialogHeader>
              <BlockoutForm onSubmit={addBlockout} onCancel={() => setNewBlockoutOpen(false)} />
            </DialogContent>
          </Dialog>

          <Button 
            variant={isEditingAvailability ? "default" : "outline"}
            onClick={() => setIsEditingAvailability(!isEditingAvailability)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            {isEditingAvailability ? 'Save Availability' : 'Edit Availability'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar/Date Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                hasSession: (date) => assignments.some(a => 
                  new Date(a.scheduledDate).toDateString() === date.toDateString()
                ),
                isBlocked: (date) => blockouts.some(b => 
                  date >= new Date(b.startDate) && date <= new Date(b.endDate)
                )
              }}
              modifiersStyles={{
                hasSession: { backgroundColor: 'hsl(var(--primary))', color: 'white' },
                isBlocked: { backgroundColor: 'hsl(var(--destructive))', color: 'white' }
              }}
            />
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span>Has Sessions</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-destructive rounded"></div>
                <span>Blocked Time</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Date Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Sessions for {selectedDate.toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateAssignments.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateAssignments.map(assignment => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(assignment.status)}`} />
                        <div>
                          <h4 className="font-medium">
                            {formatSpecialty(assignment.sessionType_detail)}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(assignment.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                            • {assignment.duration}min • ${assignment.amount}
                          </p>
                          {assignment.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              "{assignment.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant={assignment.status === 'completed' ? 'default' : 'secondary'}>
                        {assignment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sessions scheduled for this date</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Week Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date(selectedDate);
                  date.setDate(selectedDate.getDate() - selectedDate.getDay() + i);
                  
                  const dayAssignments = assignments.filter(a => 
                    new Date(a.scheduledDate).toDateString() === date.toDateString()
                  );
                  
                  return (
                    <div key={i} className="text-center p-2 border rounded">
                      <div className="text-xs font-medium text-muted-foreground">
                        {dayNames[i].slice(0, 3)}
                      </div>
                      <div className="text-sm font-bold">
                        {date.getDate()}
                      </div>
                      <div className="text-xs mt-1">
                        {dayAssignments.length} sessions
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Availability Settings */}
      {isEditingAvailability && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availability.map((day, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-24 font-medium">
                    {dayNames[day.dayOfWeek]}
                  </div>
                  
                  <Switch
                    checked={day.isAvailable}
                    onCheckedChange={(checked) => 
                      handleAvailabilityChange(index, 'isAvailable', checked)
                    }
                  />
                  
                  {day.isAvailable && (
                    <>
                      <Input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => 
                          handleAvailabilityChange(index, 'startTime', e.target.value)
                        }
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => 
                          handleAvailabilityChange(index, 'endTime', e.target.value)
                        }
                        className="w-32"
                      />
                    </>
                  )}
                </div>
              ))}
              
              <div className="flex gap-3 pt-4">
                <Button onClick={saveAvailability} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Availability
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingAvailability(false)}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Blockouts */}
      {blockouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Blocked Time Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blockouts.map(blockout => (
                <div key={blockout.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{blockout.reason}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(blockout.startDate).toLocaleDateString()} 
                      {' '}
                      {new Date(blockout.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      {' - '}
                      {new Date(blockout.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {blockout.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Blockout form component
const BlockoutForm = ({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    reason: '',
    type: 'break'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    onSubmit({
      startDate: startDateTime,
      endDate: endDateTime,
      reason: formData.reason,
      type: formData.type
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="break">Break</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="vacation">Vacation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          placeholder="Brief description of why this time is blocked"
          value={formData.reason}
          onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
          required
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit">Add Block</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};