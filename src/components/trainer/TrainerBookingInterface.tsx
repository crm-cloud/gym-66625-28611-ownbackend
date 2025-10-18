
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { TrainerCard } from './TrainerCard';
import { enhancedTrainers } from '@/utils/mockData';
import { TrainerSpecialty } from '@/types/trainer';
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Search,
  Filter,
  Star,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface BookingRequest {
  specialty: TrainerSpecialty | '';
  date?: Date;
  timeSlot: string;
  duration: number;
  notes: string;
  maxBudget?: number;
  preferredGender?: 'male' | 'female' | '';
  experienceLevel: 'any' | 'beginner_friendly' | 'experienced' | 'expert';
}

interface TrainerBookingInterfaceProps {
  branchId?: string;
  memberId?: string;
  onBookingComplete?: (bookingId: string) => void;
}

const specialtyOptions: { value: TrainerSpecialty; label: string }[] = [
  { value: 'strength_training', label: 'Strength Training' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'pilates', label: 'Pilates' },
  { value: 'crossfit', label: 'CrossFit' },
  { value: 'martial_arts', label: 'Martial Arts' },
  { value: 'dance', label: 'Dance' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'rehabilitation', label: 'Rehabilitation' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'bodybuilding', label: 'Bodybuilding' },
  { value: 'sports_performance', label: 'Sports Performance' },
  { value: 'senior_fitness', label: 'Senior Fitness' },
  { value: 'youth_fitness', label: 'Youth Fitness' }
];

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00'
];

export const TrainerBookingInterface = ({ 
  branchId = 'branch_001', 
  memberId = 'member_001',
  onBookingComplete 
}: TrainerBookingInterfaceProps) => {
  const { toast } = useToast();
  const [bookingRequest, setBookingRequest] = useState<BookingRequest>({
    specialty: '',
    timeSlot: '',
    duration: 60,
    notes: '',
    experienceLevel: 'any'
  });
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Filter trainers based on booking criteria
  const availableTrainers = useMemo(() => {
    return enhancedTrainers.filter(trainer => {
      // Branch filter
      if (trainer.branchId !== branchId) return false;
      
      // Active status filter
      if (!trainer.isActive || trainer.status !== 'active') return false;
      
      // Specialty filter
      if (bookingRequest.specialty && !trainer.specialties.includes(bookingRequest.specialty)) {
        return false;
      }
      
      // Budget filter
      if (bookingRequest.maxBudget && trainer.hourlyRate > bookingRequest.maxBudget) {
        return false;
      }
      
      // Experience level filter
      if (bookingRequest.experienceLevel !== 'any') {
        const experienceMap = {
          'beginner_friendly': 2,
          'experienced': 5,
          'expert': 8
        };
        const requiredExperience = experienceMap[bookingRequest.experienceLevel];
        if (trainer.experience < requiredExperience) return false;
      }
      
      return true;
    });
  }, [branchId, bookingRequest]);

  const handleBookingSubmit = async () => {
    if (!selectedTrainer || !bookingRequest.date || !bookingRequest.timeSlot) {
      toast({
        title: "Incomplete Information",
        description: "Please select a trainer, date, and time slot.",
        variant: "destructive"
      });
      return;
    }

    setIsBooking(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const bookingId = `booking_${Date.now()}`;
      
      toast({
        title: "Booking Confirmed!",
        description: "Your training session has been booked successfully.",
      });
      
      setShowConfirmation(false);
      onBookingComplete?.(bookingId);
      
      // Reset form
      setBookingRequest({
        specialty: '',
        timeSlot: '',
        duration: 60,
        notes: '',
        experienceLevel: 'any'
      });
      setSelectedTrainer(null);
      
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Unable to complete your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  const selectedTrainerData = enhancedTrainers.find(t => t.id === selectedTrainer);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Book a Training Session</h2>
        <p className="text-muted-foreground">Find and book the perfect trainer for your fitness goals</p>
      </div>

      {/* Booking Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Session Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialty">Training Specialty</Label>
              <Select 
                value={bookingRequest.specialty} 
                onValueChange={(value) => setBookingRequest(prev => ({ ...prev, specialty: value as TrainerSpecialty }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialtyOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select 
                value={bookingRequest.experienceLevel} 
                onValueChange={(value) => setBookingRequest(prev => ({ ...prev, experienceLevel: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Experience</SelectItem>
                  <SelectItem value="beginner_friendly">Beginner Friendly (2+ years)</SelectItem>
                  <SelectItem value="experienced">Experienced (5+ years)</SelectItem>
                  <SelectItem value="expert">Expert (8+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preferred Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bookingRequest.date ? format(bookingRequest.date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={bookingRequest.date}
                    onSelect={(date) => setBookingRequest(prev => ({ ...prev, date }))}
                    disabled={(date) => date < new Date() || date < new Date(Date.now() - 86400000)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-slot">Time Slot</Label>
              <Select 
                value={bookingRequest.timeSlot} 
                onValueChange={(value) => setBookingRequest(prev => ({ ...prev, timeSlot: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select 
                value={bookingRequest.duration.toString()} 
                onValueChange={(value) => setBookingRequest(prev => ({ ...prev, duration: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Max Budget per Hour</Label>
              <Input
                id="budget"
                type="number"
                placeholder="Optional"
                value={bookingRequest.maxBudget || ''}
                onChange={(e) => setBookingRequest(prev => ({ 
                  ...prev, 
                  maxBudget: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any specific goals, requirements, or preferences..."
              value={bookingRequest.notes}
              onChange={(e) => setBookingRequest(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Available Trainers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            Available Trainers ({availableTrainers.length})
          </h3>
          {bookingRequest.specialty && (
            <Badge variant="outline">
              Filtered by: {specialtyOptions.find(s => s.value === bookingRequest.specialty)?.label}
            </Badge>
          )}
        </div>

        {availableTrainers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availableTrainers.map(trainer => (
              <div key={trainer.id} className="relative">
                <TrainerCard
                  trainer={trainer}
                  showBookButton={false}
                  onViewProfile={() => {}}
                />
                <div className="mt-4 flex gap-2">
                  <Button
                    variant={selectedTrainer === trainer.id ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setSelectedTrainer(trainer.id)}
                  >
                    {selectedTrainer === trainer.id ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Selected
                      </>
                    ) : (
                      'Select Trainer'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-medium mb-2">No trainers available</h4>
              <p className="text-muted-foreground">
                Try adjusting your filters or selecting a different date/time.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Book Session Button */}
      {selectedTrainer && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedTrainerData?.avatar} />
                  <AvatarFallback>
                    {selectedTrainerData?.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">Ready to book with {selectedTrainerData?.fullName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {bookingRequest.date && bookingRequest.timeSlot && (
                      <>
                        {format(bookingRequest.date, "PPP")} at {bookingRequest.timeSlot} • {bookingRequest.duration} min
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Book Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Your Booking</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedTrainerData?.avatar} />
                        <AvatarFallback>
                          {selectedTrainerData?.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{selectedTrainerData?.fullName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedTrainerData?.specialties[0].replace('_', ' ')} • {selectedTrainerData?.experience}y exp
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{bookingRequest.date ? format(bookingRequest.date, "PPP") : 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{bookingRequest.timeSlot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{bookingRequest.duration} minutes</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total Cost:</span>
                        <span>${Math.round((selectedTrainerData?.hourlyRate || 0) * (bookingRequest.duration / 60))}</span>
                      </div>
                    </div>
                    
                    {bookingRequest.notes && (
                      <div>
                        <Label className="text-sm font-medium">Notes:</Label>
                        <p className="text-sm text-muted-foreground mt-1">{bookingRequest.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" onClick={() => setShowConfirmation(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={handleBookingSubmit} disabled={isBooking} className="flex-1">
                        {isBooking ? 'Processing...' : 'Confirm Booking'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
