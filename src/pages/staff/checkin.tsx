
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, Search, Clock, Users, CheckCircle, AlertCircle, QrCode } from 'lucide-react';
import { PermissionGate } from '@/components/PermissionGate';

export default function StaffCheckinPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const todayCheckins = [
    { id: 1, name: 'Sarah Johnson', time: '09:15 AM', membershipType: 'Premium', photo: 'https://images.unsplash.com/photo-1494790108755-2616b612c2be?w=150' },
    { id: 2, name: 'Mike Chen', time: '10:30 AM', membershipType: 'Basic', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 3, name: 'Lisa Rodriguez', time: '11:45 AM', membershipType: 'Premium', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
    { id: 4, name: 'David Kim', time: '02:20 PM', membershipType: 'Basic', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }
  ];

  const memberSearchResults = [
    { id: 1, name: 'Sarah Johnson', membershipId: 'GYM001', status: 'active', membershipType: 'Premium', lastVisit: '2024-01-14', photo: 'https://images.unsplash.com/photo-1494790108755-2616b612c2be?w=150' },
    { id: 2, name: 'Mike Chen', membershipId: 'GYM002', status: 'active', membershipType: 'Basic', lastVisit: '2024-01-13', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 3, name: 'Lisa Rodriguez', membershipId: 'GYM003', status: 'active', membershipType: 'Premium', lastVisit: '2024-01-12', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' }
  ];

  const stats = {
    todayCheckins: 24,
    currentMembers: 12,
    peakTime: '6:00 PM - 8:00 PM',
    avgDaily: 45
  };

  const filteredMembers = memberSearchResults.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.membershipId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckin = (member: any) => {
    console.log('Checking in member:', member);
    // Add to today's checkins
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Member Check-in</h1>
          <p className="text-muted-foreground">
            Process member check-ins and monitor gym activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <Users className="w-3 h-3 mr-1" />
            {stats.currentMembers} Currently In Gym
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.todayCheckins}</p>
                <p className="text-sm text-muted-foreground">Today's Check-ins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.currentMembers}</p>
                <p className="text-sm text-muted-foreground">Currently In Gym</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.peakTime}</p>
                <p className="text-sm text-muted-foreground">Peak Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgDaily}</p>
                <p className="text-sm text-muted-foreground">Daily Average</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="checkin" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checkin">Check-in Members</TabsTrigger>
          <TabsTrigger value="today">Today's Activity</TabsTrigger>
          <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Check-in</CardTitle>
              <CardDescription>Search and check-in gym members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or membership ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {searchTerm && (
                <div className="space-y-2">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.photo} alt={member.name} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {member.membershipId} • {member.membershipType}</p>
                          <p className="text-xs text-muted-foreground">Last visit: {member.lastVisit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                        <PermissionGate permission="staff.checkin.process">
                          <Button 
                            size="sm" 
                            onClick={() => handleCheckin(member)}
                            disabled={member.status !== 'active'}
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            Check In
                          </Button>
                        </PermissionGate>
                      </div>
                    </div>
                  ))}
                  {filteredMembers.length === 0 && searchTerm && (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No members found matching your search</p>
                    </div>
                  )}
                </div>
              )}

              {!searchTerm && (
                <div className="text-center py-8 space-y-2">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Start typing to search for members</p>
                  <p className="text-sm text-muted-foreground">Search by name or membership ID</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Check-ins</CardTitle>
              <CardDescription>Members who have checked in today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayCheckins.map((checkin) => (
                  <div key={checkin.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={checkin.photo} alt={checkin.name} />
                        <AvatarFallback>{checkin.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{checkin.name}</p>
                        <p className="text-sm text-muted-foreground">{checkin.membershipType} Member</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{checkin.time}</p>
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Checked In
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scanner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code Scanner
              </CardTitle>
              <CardDescription>Scan member QR codes for quick check-in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 space-y-4">
                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center mx-auto">
                  <QrCode className="w-12 h-12 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">QR Scanner</p>
                  <p className="text-sm text-muted-foreground">Camera access required to scan QR codes</p>
                </div>
                <PermissionGate permission="staff.checkin.process">
                  <Button>
                    Enable Camera
                  </Button>
                </PermissionGate>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
