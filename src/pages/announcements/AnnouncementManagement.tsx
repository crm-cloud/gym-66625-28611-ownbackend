import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Megaphone, Plus, Edit, Trash2, Eye, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'active' | 'scheduled' | 'expired';
  targetRoles: string[];
  createdAt: Date;
  expiresAt?: Date;
}

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'New Equipment Arrival',
    content: 'We have received new cardio equipment in the gym floor. Please check it out!',
    priority: 'medium',
    status: 'active',
    targetRoles: ['member', 'trainer'],
    createdAt: new Date('2024-01-15'),
    expiresAt: new Date('2024-02-15')
  },
  {
    id: '2',
    title: 'Holiday Hours Update',
    content: 'Please note our updated operating hours during the holiday season.',
    priority: 'high',
    status: 'scheduled',
    targetRoles: ['member'],
    createdAt: new Date('2024-01-10')
  }
];

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    targetRoles: [] as string[],
    expiresAt: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAnnouncement) {
      // Update existing announcement
      setAnnouncements(prev => prev.map(ann => 
        ann.id === editingAnnouncement.id 
          ? { 
              ...ann, 
              ...formData,
              expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined
            }
          : ann
      ));
      toast({
        title: "Success",
        description: "Announcement updated successfully"
      });
    } else {
      // Create new announcement
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        ...formData,
        status: 'draft',
        createdAt: new Date(),
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined
      };
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      toast({
        title: "Success",
        description: "Announcement created successfully"
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'medium' as 'low' | 'medium' | 'high',
      targetRoles: [],
      expiresAt: ''
    });
    setEditingAnnouncement(null);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      targetRoles: announcement.targetRoles,
      expiresAt: announcement.expiresAt?.toISOString().split('T')[0] || ''
    });
    setIsDialogOpen(true);
  };

  const handlePublish = (announcementId: string) => {
    setAnnouncements(prev => prev.map(ann => 
      ann.id === announcementId 
        ? { ...ann, status: 'active' }
        : ann
    ));
    toast({
      title: "Success",
      description: "Announcement published successfully"
    });
  };

  const handleDelete = (announcementId: string) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
    toast({
      title: "Success",
      description: "Announcement deleted successfully"
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'scheduled': return 'outline';
      case 'expired': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground">Manage and broadcast announcements to your members and staff</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Announcement title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Announcement content"
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setFormData(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAnnouncement ? 'Update' : 'Create'} Announcement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <Badge variant={getPriorityColor(announcement.priority)}>
                      {announcement.priority}
                    </Badge>
                    <Badge variant={getStatusColor(announcement.status)}>
                      {announcement.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created: {announcement.createdAt.toLocaleDateString()}
                    {announcement.expiresAt && ` • Expires: ${announcement.expiresAt.toLocaleDateString()}`}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {announcement.status === 'draft' && (
                    <Button 
                      size="sm" 
                      onClick={() => handlePublish(announcement.id)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Publish
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleEdit(announcement)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(announcement.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-3">{announcement.content}</p>
              <div className="flex gap-2">
                {announcement.targetRoles.map(role => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}