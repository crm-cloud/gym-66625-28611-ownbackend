
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Search, MessageSquare, Calendar, Activity, TrendingUp } from 'lucide-react';
import { PermissionGate } from '@/components/PermissionGate';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export default function TrainerClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { authState } = useAuth();

  const { data: assignments, isLoading } = useSupabaseQuery(
    ['trainer-assignments', authState.user?.id],
    async () => {
      const { data, error } = await supabase
        .from('trainer_assignments')
        .select(`
          *,
          members (
            id,
            full_name,
            email,
            user_id,
            member_goals (title),
            member_measurements (measured_date)
          )
        `)
        .eq('trainer_id', authState.user?.id)
        .in('status', ['scheduled', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    { enabled: !!authState.user?.id }
  );

  const ptClients = useMemo(() => {
    return assignments?.filter(a => a.assignment_type === 'personal_training') || [];
  }, [assignments]);

  const generalClients = useMemo(() => {
    return assignments?.filter(a => a.assignment_type === 'general') || [];
  }, [assignments]);

  const filteredPT = ptClients.filter(assignment =>
    assignment.members?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.members?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGeneral = generalClients.filter(assignment =>
    assignment.members?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.members?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Clients</h1>
          <p className="text-muted-foreground">
            Manage your client relationships and track their progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <Users className="w-3 h-3 mr-1" />
            {ptClients.length} PT Clients
          </Badge>
          <Badge variant="secondary">
            {generalClients.length} General Clients
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="pt-clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pt-clients">Personal Training Clients</TabsTrigger>
          <TabsTrigger value="general-clients">General Clients</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="pt-clients" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPT.length > 0 ? filteredPT.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {assignment.members?.full_name?.split(' ').map(n => n[0]).join('') || 'NA'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{assignment.members?.full_name}</CardTitle>
                      <CardDescription>{assignment.members?.email}</CardDescription>
                    </div>
                    <Badge variant="default">PT</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Sessions/week:</span> {assignment.sessions_per_week}</p>
                    <p><span className="text-muted-foreground">Duration:</span> {assignment.session_duration} min</p>
                    <p><span className="text-muted-foreground">Rate:</span> ${assignment.rate_per_session}/session</p>
                  </div>

                  {assignment.notes && (
                    <p className="text-sm text-muted-foreground">{assignment.notes}</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <PermissionGate permission="trainer.clients.manage">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        Schedule
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Message
                      </Button>
                    </PermissionGate>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No PT clients assigned</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="general-clients" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGeneral.length > 0 ? filteredGeneral.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {assignment.members?.full_name?.split(' ').map(n => n[0]).join('') || 'NA'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{assignment.members?.full_name}</CardTitle>
                      <CardDescription>{assignment.members?.email}</CardDescription>
                    </div>
                    <Badge variant="secondary">General</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Sessions/week:</span> {assignment.sessions_per_week}</p>
                    <p><span className="text-muted-foreground">Duration:</span> {assignment.session_duration} min</p>
                  </div>

                  {assignment.notes && (
                    <p className="text-sm text-muted-foreground">{assignment.notes}</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <PermissionGate permission="trainer.clients.manage">
                      <Button size="sm" variant="outline" className="w-full">
                        <Activity className="w-3 h-3 mr-1" />
                        View Progress
                      </Button>
                    </PermissionGate>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No general clients assigned</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Communications</CardTitle>
              <CardDescription>Message history with your clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">No recent communications</p>
                <Button variant="outline">
                  Send New Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
