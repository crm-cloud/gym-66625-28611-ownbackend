import { useState } from 'react';
import { UserX, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { mockTrainers } from '@/utils/mockData';
import { format } from 'date-fns';

interface TrainerChangeRequest {
  id: string;
  memberId: string;
  memberName: string;
  currentTrainerId?: string;
  currentTrainerName?: string;
  requestedTrainerId?: string;
  requestedTrainerName?: string;
  reason: string;
  additionalNotes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}

// Mock data for existing change requests
const mockChangeRequests: TrainerChangeRequest[] = [
  {
    id: 'TCR001',
    memberId: 'MEM001',
    memberName: 'John Doe',
    currentTrainerId: 'TR001',
    currentTrainerName: 'Sarah Johnson',
    requestedTrainerId: 'TR002',
    requestedTrainerName: 'Mike Chen',
    reason: 'schedule-conflict',
    additionalNotes: 'My work schedule has changed and I can no longer attend sessions with my current trainer.',
    status: 'approved',
    submittedAt: new Date('2024-01-10'),
    reviewedAt: new Date('2024-01-12'),
    reviewedBy: 'Admin',
    reviewNotes: 'Request approved. Mike Chen has availability for the requested time slots.'
  },
  {
    id: 'TCR002',
    memberId: 'MEM001',
    memberName: 'John Doe',
    currentTrainerId: 'TR003',
    currentTrainerName: 'Alex Thompson',
    reason: 'training-style',
    additionalNotes: 'Looking for a trainer who specializes in strength training.',
    status: 'pending',
    submittedAt: new Date('2024-01-15')
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    case 'in-review':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800"><AlertCircle className="w-3 h-3 mr-1" />In Review</Badge>;
    case 'approved':
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
    case 'rejected':
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const changeReasons = [
  { value: 'schedule-conflict', label: 'Schedule Conflict' },
  { value: 'training-style', label: 'Training Style Preference' },
  { value: 'communication-issues', label: 'Communication Issues' },
  { value: 'availability', label: 'Trainer Availability Issues' },
  { value: 'personal-reasons', label: 'Personal Reasons' },
  { value: 'progress-concerns', label: 'Progress/Results Concerns' },
  { value: 'other', label: 'Other' }
];

export const TrainerChangeRequest = () => {
  const { toast } = useToast();
  const { data: member, isLoading } = useMemberProfile();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    requestedTrainerId: '',
    reason: '',
    additionalNotes: ''
  });

  const memberRequests = mockChangeRequests.filter(req => req.memberId === member?.id);
  const availableTrainers = mockTrainers.filter(trainer => 
    trainer.id !== member?.trainerId && trainer.status === 'active'
  );

  const currentTrainer = mockTrainers.find(trainer => trainer.id === member?.trainerId);

  const handleSubmitRequest = () => {
    if (!formData.reason) {
      toast({
        title: "Validation Error",
        description: "Please select a reason for the trainer change request.",
        variant: "destructive"
      });
      return;
    }

    console.log('Submitting trainer change request:', {
      memberId: member?.id,
      currentTrainerId: member?.trainerId,
      ...formData
    });

    toast({
      title: "Request Submitted",
      description: "Your trainer change request has been submitted and is under review.",
    });

    setShowRequestForm(false);
    setFormData({ requestedTrainerId: '', reason: '', additionalNotes: '' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading trainer information...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    console.warn('[TrainerChangeRequest] No member profile found');
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Profile Setup Required</h1>
        <p className="text-muted-foreground">
          Your member profile is being set up. Please contact support if this persists.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trainer Change Request</h1>
          <p className="text-muted-foreground">Request a change to your assigned trainer</p>
        </div>
        {currentTrainer && !showRequestForm && (
          <Button onClick={() => setShowRequestForm(true)}>
            <UserX className="w-4 h-4 mr-2" />
            Request Change
          </Button>
        )}
      </div>

      {/* Current Trainer Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Trainer Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          {currentTrainer ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                {currentTrainer.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-semibold">{currentTrainer.fullName}</h3>
                <p className="text-sm text-muted-foreground">{currentTrainer.specialties.join(', ')}</p>
                <p className="text-sm text-muted-foreground">
                  Experience: {currentTrainer.experience} years
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <UserX className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No trainer currently assigned</p>
              <p className="text-sm">Contact the front desk to get a trainer assigned</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Request Form */}
      {showRequestForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Trainer Change Request</CardTitle>
            <CardDescription>
              Please provide details about why you'd like to change your trainer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requested-trainer">Preferred New Trainer (Optional)</Label>
              <Select 
                value={formData.requestedTrainerId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, requestedTrainerId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a trainer or leave blank for admin assignment" />
                </SelectTrigger>
                <SelectContent>
                  {availableTrainers.map((trainer) => (
                    <SelectItem key={trainer.id} value={trainer.id}>
                      {trainer.fullName} - {trainer.specialties.join(', ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Change *</Label>
              <Select 
                value={formData.reason} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {changeReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional-notes">Additional Notes</Label>
              <Textarea
                id="additional-notes"
                placeholder="Please provide more details about your request..."
                value={formData.additionalNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmitRequest}>
                <Send className="w-4 h-4 mr-2" />
                Submit Request
              </Button>
              <Button variant="outline" onClick={() => setShowRequestForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request History */}
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>Your previous trainer change requests</CardDescription>
        </CardHeader>
        <CardContent>
          {memberRequests.length > 0 ? (
            <div className="space-y-4">
              {memberRequests
                .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
                .map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">Request #{request.id}</h4>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {format(request.submittedAt, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">From Trainer</p>
                      <p className="text-sm">{request.currentTrainerName || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">To Trainer</p>
                      <p className="text-sm">{request.requestedTrainerName || 'Admin will assign'}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground">Reason</p>
                    <p className="text-sm">
                      {changeReasons.find(r => r.value === request.reason)?.label || request.reason}
                    </p>
                  </div>

                  {request.additionalNotes && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-muted-foreground">Additional Notes</p>
                      <p className="text-sm">{request.additionalNotes}</p>
                    </div>
                  )}

                  {request.reviewNotes && (
                    <div className="bg-muted rounded p-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        Admin Response {request.reviewedAt && `(${format(request.reviewedAt, 'MMM dd, yyyy')})`}
                      </p>
                      <p className="text-sm">{request.reviewNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <UserX className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No trainer change requests found</p>
              <p className="text-sm">Your request history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};