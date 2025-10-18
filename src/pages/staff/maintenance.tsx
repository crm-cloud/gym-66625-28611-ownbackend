
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Plus, Search, Clock, CheckCircle, XCircle, Wrench, Camera } from 'lucide-react';
import { PermissionGate } from '@/components/PermissionGate';

export default function StaffMaintenancePage() {
  const [searchTerm, setSearchTerm] = useState('');

  const maintenanceReports = [
    {
      id: 1,
      equipmentName: 'Treadmill #5',
      location: 'Cardio Section A',
      issue: 'Belt making unusual noise and slipping',
      priority: 'high',
      status: 'open',
      reportedBy: 'Lisa Chen',
      reportedAt: '2024-01-15T10:30:00Z',
      description: 'Members have reported that treadmill #5 is making a grinding noise and the belt occasionally slips during use. Needs immediate attention.',
      category: 'equipment-malfunction',
      estimatedRepairTime: '2-3 hours'
    },
    {
      id: 2,
      equipmentName: 'Air Conditioning Unit',
      location: 'Main Workout Floor',
      issue: 'Not cooling effectively',
      priority: 'medium',
      status: 'in-progress',
      reportedBy: 'Mike Rodriguez',
      reportedAt: '2024-01-15T08:15:00Z',
      description: 'AC unit is running but not maintaining the set temperature. Room is getting too warm during peak hours.',
      category: 'hvac',
      estimatedRepairTime: '4-6 hours'
    },
    {
      id: 3,
      equipmentName: 'Locker #47',
      location: 'Men\'s Locker Room',
      issue: 'Lock mechanism broken',
      priority: 'low',
      status: 'resolved',
      reportedBy: 'Sarah Johnson',
      reportedAt: '2024-01-14T16:20:00Z',
      description: 'Locker door won\'t close properly and lock mechanism is jammed.',
      category: 'facility',
      estimatedRepairTime: '30 minutes',
      resolvedAt: '2024-01-15T09:00:00Z'
    },
    {
      id: 4,
      equipmentName: 'Bench Press Station #3',
      location: 'Weight Training Area',
      issue: 'Wobbly bench, potential safety hazard',
      priority: 'high',
      status: 'open',
      reportedBy: 'David Kim',
      reportedAt: '2024-01-15T14:45:00Z',
      description: 'The bench is unstable and rocks when members use it. Could be dangerous during heavy lifting.',
      category: 'equipment-malfunction',
      estimatedRepairTime: '1-2 hours'
    }
  ];

  const stats = {
    openReports: maintenanceReports.filter(r => r.status === 'open').length,
    inProgress: maintenanceReports.filter(r => r.status === 'in-progress').length,
    resolvedToday: maintenanceReports.filter(r => r.status === 'resolved' && new Date(r.resolvedAt || '').toDateString() === new Date().toDateString()).length,
    highPriority: maintenanceReports.filter(r => r.priority === 'high' && r.status !== 'resolved').length
  };

  const filteredReports = maintenanceReports.filter(report =>
    report.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.issue.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Reports</h1>
          <p className="text-muted-foreground">
            Report and track facility maintenance issues
          </p>
        </div>
        <PermissionGate permission="staff.maintenance.report">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </PermissionGate>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.openReports}</p>
                <p className="text-sm text-muted-foreground">Open Reports</p>
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
              <div className="p-2 bg-orange-100 rounded-lg">
                <Wrench className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.highPriority}</p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Maintenance Reports</TabsTrigger>
          <TabsTrigger value="create">Create Report</TabsTrigger>
          <TabsTrigger value="schedule">Maintenance Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className={report.priority === 'high' ? 'border-red-200' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        {report.equipmentName}
                      </CardTitle>
                      <CardDescription>{report.location}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(report.priority)}>
                        {report.priority} priority
                      </Badge>
                      <Badge variant={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Issue</h4>
                    <p className="text-sm text-muted-foreground">{report.issue}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Reported by</p>
                      <p className="font-medium">{report.reportedBy}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reported at</p>
                      <p className="font-medium">{new Date(report.reportedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium">{report.category.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Est. repair time</p>
                      <p className="font-medium">{report.estimatedRepairTime}</p>
                    </div>
                  </div>

                  {report.resolvedAt && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Resolved on {new Date(report.resolvedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <PermissionGate permission="staff.maintenance.report">
                    <div className="flex gap-2 pt-2">
                      {report.status === 'open' && (
                        <Button size="sm" variant="outline">
                          Update Status
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        Add Note
                      </Button>
                      <Button size="sm" variant="outline">
                        <Camera className="w-3 h-3 mr-1" />
                        Add Photo
                      </Button>
                    </div>
                  </PermissionGate>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Maintenance Report</CardTitle>
              <CardDescription>Report a new maintenance issue or equipment problem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Equipment/Item Name</label>
                  <Input placeholder="e.g., Treadmill #5, Air Conditioning Unit..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input placeholder="e.g., Cardio Section A, Men's Locker Room..." />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Issue Summary</label>
                <Input placeholder="Brief description of the problem..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Detailed Description</label>
                <Textarea 
                  placeholder="Provide detailed information about the issue, when it was first noticed, any safety concerns..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority Level</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="low">Low - Can wait</option>
                    <option value="medium">Medium - Needs attention</option>
                    <option value="high">High - Urgent/Safety concern</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="equipment-malfunction">Equipment Malfunction</option>
                    <option value="facility">Facility Issue</option>
                    <option value="hvac">HVAC</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Safety Hazard?</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="no">No</option>
                    <option value="minor">Minor Risk</option>
                    <option value="major">Major Safety Concern</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Photo (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload or drag and drop photos</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Choose Files
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button>Submit Report</Button>
                <Button variant="outline">Save as Draft</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>Regular maintenance tasks and schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 space-y-3">
                  <Wrench className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Maintenance schedule feature coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    This will include preventive maintenance schedules, equipment servicing reminders, and routine maintenance tasks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
