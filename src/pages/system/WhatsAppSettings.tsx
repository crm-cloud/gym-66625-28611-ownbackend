import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Plus, Edit, Trash2, Send, ArrowLeft } from 'lucide-react';
import { WhatsAppTemplateEditor } from '@/components/templates/WhatsAppTemplateEditor';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type WhatsAppTemplate = Database['public']['Tables']['whatsapp_templates']['Row'];

export default function WhatsAppSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['whatsapp_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Save/Update template mutation
  const saveMutation = useMutation({
    mutationFn: async (templateData: any) => {
      if (templateData.id) {
        // Update existing
        const { error } = await supabase
          .from('whatsapp_templates')
          .update(templateData)
          .eq('id', templateData.id);
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('whatsapp_templates')
          .insert([templateData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp_templates'] });
      setShowEditor(false);
      setSelectedTemplate(null);
      toast({
        title: 'Template Saved',
        description: 'WhatsApp template has been saved successfully.'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save template.',
        variant: 'destructive'
      });
    }
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('whatsapp_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp_templates'] });
      toast({
        title: 'Template Deleted',
        description: 'WhatsApp template has been deleted successfully.'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete template.',
        variant: 'destructive'
      });
    }
  });

  // Toggle template active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('whatsapp_templates')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp_templates'] });
      toast({
        title: 'Template Updated',
        description: 'Template status has been updated.'
      });
    }
  });

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setShowEditor(true);
  };

  const handleEdit = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const handleSave = (templateData: any) => {
    saveMutation.mutate(templateData);
  };

  const handleCancel = () => {
    setShowEditor(false);
    setSelectedTemplate(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      welcome: 'bg-green-500',
      membership: 'bg-blue-500',
      classes: 'bg-purple-500',
      payments: 'bg-yellow-500',
      reminders: 'bg-orange-500',
      appointments: 'bg-pink-500',
      alerts: 'bg-red-500',
      promotions: 'bg-indigo-500',
      system: 'bg-gray-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  if (showEditor) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Templates
        </Button>
        <WhatsAppTemplateEditor
          template={selectedTemplate as any}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Settings</h1>
          <p className="text-muted-foreground">Configure WhatsApp Business API and message templates</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Connection Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                Manage your WhatsApp message templates for different events and communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No templates found. Create your first WhatsApp template.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {templates.map((template: WhatsAppTemplate) => (
                    <Card key={template.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                              <Badge className={getCategoryBadge(template.category)}>
                                {template.category}
                              </Badge>
                              <Badge variant={template.is_active ? 'default' : 'secondary'}>
                                {template.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <CardDescription className="text-sm">
                              Event: {template.event} • Type: {template.template_type}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={template.is_active}
                              onCheckedChange={(checked) => 
                                toggleActiveMutation.mutate({ id: template.id, is_active: checked })
                              }
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm whitespace-pre-wrap">{template.body_text}</p>
                          </div>
                          {template.variables && Array.isArray(template.variables) && template.variables.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-muted-foreground">Variables:</span>
                              {(template.variables as string[]).map((variable: string, index: number) => (
                                <Badge key={index} variant="outline">
                                  {`{{${variable}}}`}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(template)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(template.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                            <Button size="sm" variant="outline">
                              <Send className="w-4 h-4 mr-1" />
                              Test Send
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business API Configuration</CardTitle>
              <CardDescription>
                Configure your WhatsApp Business API credentials and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number_id">Phone Number ID</Label>
                <Input
                  id="phone_number_id"
                  placeholder="Enter your WhatsApp Business Phone Number ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="access_token">Access Token</Label>
                <Input
                  id="access_token"
                  type="password"
                  placeholder="Enter your WhatsApp Business API Access Token"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook_url">Webhook URL</Label>
                <Input
                  id="webhook_url"
                  placeholder="https://your-domain.com/webhooks/whatsapp"
                  disabled
                  value="Auto-configured"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable WhatsApp Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send automated WhatsApp messages based on events
                  </p>
                </div>
                <Switch />
              </div>
              <Button>
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Analytics</CardTitle>
              <CardDescription>
                Track the performance of your WhatsApp communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Analytics data will appear here once you start sending WhatsApp messages.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
