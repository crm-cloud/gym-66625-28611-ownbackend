
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrainerConfigurationPanel } from '@/components/trainer/TrainerConfigurationPanel';
import { NotificationCenter } from '@/components/trainer/NotificationCenter';
import { TrainerBookingInterface } from '@/components/trainer/TrainerBookingInterface';
import { TrainerUtilizationDashboard } from '@/components/trainer/TrainerUtilizationDashboard';
import { QuickTrainerForm } from '@/components/trainer/QuickTrainerForm';
import { useTrainers } from '@/hooks/useTrainers';
import { PermissionGate } from '@/components/PermissionGate';
import { 
  Settings, 
  Bell, 
  Calendar, 
  BarChart3, 
  Users, 
  Plus,
  TrendingUp,
  Clock,
  Search,
  Eye,
  Star,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';

export const TrainerManagementPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateTrainer, setShowCreateTrainer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const branchId = 'branch_001';

  const { data: trainers = [], isLoading } = useTrainers();

  const filteredTrainers = trainers.filter(trainer =>
    trainer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTrainers = trainers.length;
  const activeTrainers = trainers.filter(t => t.is_active && t.status === 'active').length;
  const avgRating = trainers.length > 0 ? trainers.reduce((sum, t) => sum + (t.rating || 0), 0) / trainers.length : 0;
  const totalSessions = trainers.reduce((sum, t) => sum + (t.total_sessions || 0), 0);

  const handleTrainerCreated = (trainerId: string) => {
    navigate(`/trainers/profile/${trainerId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trainer Management</h1>
          <p className="text-muted-foreground">
            Comprehensive trainer management and booking system
          </p>
        </div>
        
        <div className="flex gap-2">
          <PermissionGate permission="team.create">
            <Button variant="outline" onClick={() => setShowCreateTrainer(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Trainer
            </Button>
          </PermissionGate>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Book Session
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTrainers}</p>
                <p className="text-sm text-muted-foreground">Total Trainers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeTrainers}</p>
                <p className="text-sm text-muted-foreground">Active Trainers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSessions.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="booking">Book Session</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trainers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>

            {/* Trainers Table */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Trainers ({filteredTrainers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredTrainers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No trainers found matching your search' : 'No trainers added yet'}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Trainer</TableHead>
                        <TableHead>Specializations</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Clients</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrainers.map((trainer) => (
                        <TableRow key={trainer.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={trainer.avatar} />
                                <AvatarFallback className="bg-muted text-xs">
                                  {trainer.full_name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">{trainer.full_name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {trainer.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {trainer.specialties?.slice(0, 2).map((spec) => (
                                <Badge key={spec} variant="secondary" className="text-xs">
                                  {spec.replace('_', ' ')}
                                </Badge>
                              ))}
                              {(trainer.specialties?.length || 0) > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(trainer.specialties?.length || 0) - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {trainer.branch_name || 'Not assigned'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={trainer.status === 'active' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {trainer.status || 'inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-sm">{trainer.rating?.toFixed(1) || '0.0'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{trainer.total_clients || 0}</span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/trainers/profile/${trainer.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="booking">
          <TrainerBookingInterface 
            branchId={branchId}
            onBookingComplete={(bookingId) => {
              console.log('Booking completed:', bookingId);
            }}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <TrainerUtilizationDashboard />
        </TabsContent>

        <TabsContent value="settings">
          <TrainerConfigurationPanel 
            branchId={branchId}
            onConfigChange={(config) => {
              console.log('Configuration updated:', config);
            }}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter trainerId="trainer_001" />
        </TabsContent>
      </Tabs>

      {/* Quick Trainer Creation Form */}
      <QuickTrainerForm
        open={showCreateTrainer}
        onOpenChange={setShowCreateTrainer}
        onSuccess={handleTrainerCreated}
      />
    </div>
  );
};
