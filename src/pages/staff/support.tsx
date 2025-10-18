
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Plus, Search, Clock, AlertCircle, CheckCircle, User, Phone, Mail } from 'lucide-react';
import { PermissionGate } from '@/components/PermissionGate';

export default function StaffSupportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const supportTickets = [
    {
      id: 1,
      member: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c2be?w=150',
      email: 'sarah@example.com',
      phone: '+1 (555) 123-4567',
      subject: 'Membership Plan Upgrade',
      description: 'I would like to upgrade from Basic to Premium membership.',
      priority: 'medium',
      status: 'open',
      category: 'membership',
      createdAt: '2024-01-15T10:30:00Z',
      lastUpdated: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      member: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      email: 'mike@example.com',
      phone: '+1 (555) 234-5678',
      subject: 'Equipment Issue - Treadmill 5',
      description: 'Treadmill 5 is making strange noises and the belt seems loose.',
      priority: 'high',
      status: 'in-progress',
      category: 'equipment',
      createdAt: '2024-01-15T09:15:00Z',
      lastUpdated: '2024-01-15T11:45:00Z'
    },
    {
      id: 3,
      member: 'Lisa Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      email: 'lisa@example.com',
      phone: '+1 (555) 345-6789',
      subject: 'Class Schedule Question',
      description: 'Can you help me understand the new yoga class schedule?',
      priority: 'low',
      status: 'resolved',
      category: 'classes',
      createdAt: '2024-01-14T16:20:00Z',
      lastUpdated: '2024-01-15T08:30:00Z'
    }
  ];

  const stats = {
    openTickets: 8,
    inProgress: 3,
    resolvedToday: 12,
    avgResponseTime: '15 min'
  };

  const filteredTickets = supportTickets.filter(ticket =>
    ticket.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'in-progress': return 'secondary';
      case 'resolved': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Member Support</h1>
          <p className="text-muted-foreground">
            Handle member inquiries and support requests
          </p>
        </div>
        <PermissionGate permission="staff.support.handle">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </PermissionGate>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.openTickets}</p>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
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
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.resolvedToday}</p>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="contacts">Quick Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Active member support requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                      selectedTicket?.id === ticket.id ? 'border-primary bg-muted/30' : ''
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={ticket.avatar} alt={ticket.member} />
                          <AvatarFallback>{ticket.member.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{ticket.member}</p>
                          <p className="text-xs text-muted-foreground">#{ticket.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge variant={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="font-medium text-sm mb-1">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{ticket.description}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <span>{ticket.category}</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ticket Details</CardTitle>
                <CardDescription>
                  {selectedTicket ? `Ticket #${selectedTicket.id}` : 'Select a ticket to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTicket ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedTicket.avatar} alt={selectedTicket.member} />
                        <AvatarFallback>{selectedTicket.member.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedTicket.member}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{selectedTicket.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{selectedTicket.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">{selectedTicket.subject}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{selectedTicket.description}</p>
                      
                      <div className="flex gap-2 mb-3">
                        <Badge className={getPriorityColor(selectedTicket.priority)}>
                          {selectedTicket.priority} priority
                        </Badge>
                        <Badge variant={getStatusColor(selectedTicket.status)}>
                          {selectedTicket.status}
                        </Badge>
                        <Badge variant="outline">
                          {selectedTicket.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Created:</span> {new Date(selectedTicket.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Last Updated:</span> {new Date(selectedTicket.lastUpdated).toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Response</label>
                      <Textarea placeholder="Type your response here..." rows={4} />
                    </div>

                    <PermissionGate permission="staff.support.handle">
                      <div className="flex gap-2">
                        <Button size="sm">Send Response</Button>
                        <Button size="sm" variant="outline">Update Status</Button>
                        <Button size="sm" variant="outline">Close Ticket</Button>
                      </div>
                    </PermissionGate>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">Select a ticket to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>Common questions and solutions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Membership Plans', description: 'Information about different membership tiers' },
                    { title: 'Class Schedules', description: 'How to check and book classes' },
                    { title: 'Equipment Issues', description: 'Common equipment problems and solutions' },
                    { title: 'Payment & Billing', description: 'Payment methods and billing inquiries' },
                    { title: 'Personal Training', description: 'Booking and managing personal training sessions' },
                    { title: 'Guest Policies', description: 'Rules and procedures for bringing guests' }
                  ].map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <h4 className="font-medium mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Contacts</CardTitle>
              <CardDescription>Important contacts for escalation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Manager', role: 'Branch Manager', phone: '+1 (555) 000-0001', email: 'manager@gymfit.com' },
                  { name: 'Maintenance', role: 'Equipment Support', phone: '+1 (555) 000-0002', email: 'maintenance@gymfit.com' },
                  { name: 'IT Support', role: 'Technical Issues', phone: '+1 (555) 000-0003', email: 'tech@gymfit.com' },
                  { name: 'Billing', role: 'Payment Issues', phone: '+1 (555) 000-0004', email: 'billing@gymfit.com' }
                ].map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
