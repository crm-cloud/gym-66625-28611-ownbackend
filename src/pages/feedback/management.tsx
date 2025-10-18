import { useState } from 'react';
import { FeedbackList } from '@/components/feedback/FeedbackList';
import { FeedbackFilters } from '@/components/feedback/FeedbackFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Download,
  Filter,
  TrendingUp,
  Star
} from 'lucide-react';
import { useRBAC } from '@/hooks/useRBAC';
import { useToast } from '@/hooks/use-toast';
import { mockFeedback, mockFeedbackStats } from '@/utils/mockData';
import { Feedback } from '@/types/feedback';
import { PermissionGate } from '@/components/PermissionGate';

export const FeedbackManagementPage = () => {
  const { hasPermission } = useRBAC();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Filter feedback based on current filters
  const filteredFeedback = mockFeedback.filter((feedback) => {
    const matchesSearch = feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.memberName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || feedback.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || feedback.type === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const handleExportFeedback = () => {
    if (!hasPermission('feedback.export')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to export feedback.',
        variant: 'destructive'
      });
      return;
    }

    // Mock export functionality
    toast({
      title: 'Export Started',
      description: 'Feedback data is being exported to CSV. You will receive a download link shortly.'
    });
  };

  const handleRespondToFeedback = (feedbackId: string) => {
    if (!hasPermission('feedback.respond')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to respond to feedback.',
        variant: 'destructive'
      });
      return;
    }

    // Mock respond functionality
    toast({
      title: 'Response Window Opened',
      description: 'You can now respond to the selected feedback.'
    });
  };

  // Statistics calculations
  const stats = {
    total: mockFeedback.length,
    pending: mockFeedback.filter(f => f.status === 'pending').length,
    inReview: mockFeedback.filter(f => f.status === 'in-review').length,
    resolved: mockFeedback.filter(f => f.status === 'resolved').length,
    averageRating: mockFeedback.reduce((sum, f) => sum + f.rating, 0) / mockFeedback.length || 0,
    responseRate: (mockFeedback.filter(f => f.adminResponse).length / mockFeedback.length) * 100 || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feedback Management</h1>
          <p className="text-muted-foreground">Monitor and respond to member feedback</p>
        </div>
        <div className="flex gap-2">
          <PermissionGate permission="feedback.export">
            <Button variant="outline" onClick={handleExportFeedback} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Feedback</CardTitle>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All time submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-2xl font-bold">{stats.pending + stats.inReview}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Response Rate</CardTitle>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-2xl font-bold">{stats.responseRate.toFixed(0)}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Admin responses</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="compliment">Compliment</SelectItem>
                  <SelectItem value="facility">Facility</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setTypeFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Feedback
            <Badge variant="secondary" className="ml-2">
              {filteredFeedback.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="destructive" className="ml-2">
              {filteredFeedback.filter(f => f.status === 'pending').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="in-review">
            In Review
            <Badge variant="secondary" className="ml-2">
              {filteredFeedback.filter(f => f.status === 'in-review').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved
            <Badge variant="secondary" className="ml-2">
              {filteredFeedback.filter(f => f.status === 'resolved').length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <FeedbackList
            feedbacks={filteredFeedback}
            title="All Feedback"
            description="Complete list of member feedback"
            onRespond={handleRespondToFeedback}
            showActions={true}
          />
        </TabsContent>

        <TabsContent value="pending">
          <FeedbackList
            feedbacks={filteredFeedback.filter(f => f.status === 'pending')}
            title="Pending Feedback"
            description="Feedback waiting for initial review"
            onRespond={handleRespondToFeedback}
            showActions={true}
          />
        </TabsContent>

        <TabsContent value="in-review">
          <FeedbackList
            feedbacks={filteredFeedback.filter(f => f.status === 'in-review')}
            title="In Review Feedback"
            description="Feedback currently being reviewed"
            onRespond={handleRespondToFeedback}
            showActions={true}
          />
        </TabsContent>

        <TabsContent value="resolved">
          <FeedbackList
            feedbacks={filteredFeedback.filter(f => f.status === 'resolved')}
            title="Resolved Feedback"
            description="Feedback that has been addressed"
            onRespond={handleRespondToFeedback}
            showActions={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};