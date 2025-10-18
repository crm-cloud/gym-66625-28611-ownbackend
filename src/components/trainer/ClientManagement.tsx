import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { mockTrainerAssignments } from '@/utils/mockData';
import { 
  Users,
  Search,
  MessageSquare,
  Calendar,
  TrendingUp,
  Star,
  Edit,
  Plus,
  Phone,
  Mail
} from 'lucide-react';

interface ClientManagementProps {
  trainerId: string;
}

// Mock client data
const mockClients = [
  {
    id: 'member_001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    avatar: '/placeholder-avatar.jpg',
    joinDate: new Date('2023-06-15'),
    totalSessions: 24,
    completedSessions: 22,
    goalType: 'Weight Loss',
    currentWeight: 65,
    targetWeight: 60,
    notes: 'Very motivated. Prefers morning sessions. Has knee injury history.',
    progressNotes: [
      {
        date: new Date('2024-01-15'),
        note: 'Great progress on cardio endurance. Increased running time by 5 minutes.',
        sessionType: 'cardio'
      },
      {
        date: new Date('2024-01-10'),
        note: 'Worked on proper squat form. Needs more focus on knee alignment.',
        sessionType: 'strength_training'
      }
    ],
    lastSession: new Date('2024-01-15'),
    nextSession: new Date('2024-01-22'),
    status: 'active'
  },
  {
    id: 'member_002',
    name: 'Mike Wilson',
    email: 'mike.wilson@email.com',
    phone: '+1 (555) 987-6543',
    avatar: '/placeholder-avatar.jpg',
    joinDate: new Date('2023-08-20'),
    totalSessions: 18,
    completedSessions: 16,
    goalType: 'Marathon Training',
    currentWeight: 75,
    targetWeight: 72,
    notes: 'Training for Boston Marathon. Very disciplined with nutrition.',
    progressNotes: [
      {
        date: new Date('2024-01-12'),
        note: 'Excellent pace improvement. Ready for longer distance runs.',
        sessionType: 'cardio'
      }
    ],
    lastSession: new Date('2024-01-12'),
    nextSession: new Date('2024-01-19'),
    status: 'active'
  },
  {
    id: 'member_003',
    name: 'Emily Chen',
    email: 'emily.chen@email.com',
    phone: '+1 (555) 456-7890',
    avatar: '/placeholder-avatar.jpg',
    joinDate: new Date('2023-11-10'),
    totalSessions: 12,
    completedSessions: 10,
    goalType: 'Strength Building',
    currentWeight: 58,
    targetWeight: 62,
    notes: 'New to strength training. Very eager to learn proper form.',
    progressNotes: [
      {
        date: new Date('2024-01-08'),
        note: 'Mastered basic compound movements. Ready for progressive overload.',
        sessionType: 'strength_training'
      }
    ],
    lastSession: new Date('2024-01-08'),
    nextSession: new Date('2024-01-25'),
    status: 'active'
  }
];

export const ClientManagement = ({ trainerId }: ClientManagementProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Get trainer's clients based on assignments
  const trainerAssignments = mockTrainerAssignments.filter(a => a.trainerId === trainerId);
  const uniqueClientIds = [...new Set(trainerAssignments.map(a => a.memberId))];
  const trainerClients = mockClients.filter(client => uniqueClientIds.includes(client.id));

  const filteredClients = useMemo(() => {
    return trainerClients.filter(client =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.goalType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [trainerClients, searchQuery]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getCompletionRate = (client: any) => {
    return Math.round((client.completedSessions / client.totalSessions) * 100);
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-blue-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedClient) return;

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const note = {
      date: new Date(),
      note: newNote,
      sessionType: 'general'
    };

    // Update client notes (in real app, this would be an API call)
    selectedClient.progressNotes.unshift(note);

    setNewNote('');
    setNewNoteOpen(false);
    
    toast({
      title: "Note Added",
      description: "Progress note has been added for the client.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Client Management
        </h2>
        <Badge variant="secondary">
          {trainerClients.length} Active Clients
        </Badge>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search clients by name or goal type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClients.map(client => {
          const completionRate = getCompletionRate(client);
          const clientAssignments = trainerAssignments.filter(a => a.memberId === client.id);
          const upcomingSessions = clientAssignments.filter(a => 
            new Date(a.scheduledDate) > new Date() && a.status === 'scheduled'
          );

          return (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={client.avatar} alt={client.name} />
                      <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{client.name}</h3>
                      <p className="text-sm text-muted-foreground">{client.goalType}</p>
                      <Badge variant="outline" className="mt-1">
                        {client.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedClient(client)}>
                        <Edit className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{client.name} - Client Profile</DialogTitle>
                      </DialogHeader>
                      <ClientDetailView client={client} assignments={clientAssignments} />
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Progress Overview */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Session Completion</span>
                    <span className={`text-sm font-medium ${getProgressColor(completionRate)}`}>
                      {client.completedSessions}/{client.totalSessions} ({completionRate}%)
                    </span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        completionRate >= 90 ? 'bg-green-500' :
                        completionRate >= 75 ? 'bg-blue-500' :
                        completionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="text-sm font-bold">{upcomingSessions.length}</div>
                      <div className="text-xs text-muted-foreground">Upcoming</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="text-sm font-bold">
                        {client.lastSession ? Math.floor((Date.now() - client.lastSession.getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">Days Ago</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="text-sm font-bold">{client.progressNotes.length}</div>
                      <div className="text-xs text-muted-foreground">Notes</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No clients found</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery ? 'Try adjusting your search criteria.' : 'You don\'t have any assigned clients yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Note Dialog */}
      <Dialog open={newNoteOpen} onOpenChange={setNewNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Progress Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your note about the client's progress..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
            />
            <div className="flex gap-3">
              <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                Add Note
              </Button>
              <Button variant="outline" onClick={() => setNewNoteOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Client Detail View Component
const ClientDetailView = ({ client, assignments }: { client: any, assignments: any[] }) => {
  return (
    <div className="space-y-6">
      {/* Client Info */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={client.avatar} alt={client.name} />
          <AvatarFallback className="text-xl">{client.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-bold">{client.name}</h3>
          <p className="text-muted-foreground">{client.goalType}</p>
          <div className="flex gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {client.email}
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {client.phone}
            </div>
          </div>
        </div>
      </div>

      {/* Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Goal Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Current Weight</Label>
              <p className="text-2xl font-bold">{client.currentWeight}kg</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Target Weight</Label>
              <p className="text-2xl font-bold">{client.targetWeight}kg</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress to Goal</span>
              <span>{Math.abs(client.currentWeight - client.targetWeight)}kg remaining</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: '60%' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assignments.slice(0, 5).map(assignment => (
              <div key={assignment.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{assignment.sessionType_detail.replace('_', ' ')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(assignment.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={assignment.status === 'completed' ? 'default' : 'secondary'}>
                  {assignment.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Progress Notes
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {client.progressNotes.map((note: any, index: number) => (
              <div key={index} className="border-l-4 border-primary pl-4 py-2">
                <div className="flex justify-between items-start mb-1">
                  <Badge variant="outline" className="text-xs">
                    {note.sessionType.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {note.date.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{note.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};