
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, FileText, Activity, Clock } from 'lucide-react';
import { EmailConfigurationForm } from '@/components/email/EmailConfigurationForm';
import { EmailTemplateEditor } from '@/components/email/EmailTemplateEditor';
import { EmailTemplateList } from '@/components/email/EmailTemplateList';
import { EmailSettings as EmailSettingsType, EmailTemplate, EmailLog } from '@/types/email';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Mock data and functions for demo purposes
const mockEmailSettings: EmailSettingsType = {
  id: '1',
  branchId: 'branch-1',
  providerId: 'smtp',
  providerType: 'smtp',
  config: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: true,
    username: 'your-email@gmail.com',
    password: '****'
  },
  isActive: true,
  fromEmail: 'noreply@gymfit.com',
  fromName: 'GymFit Pro',
  replyToEmail: 'support@gymfit.com',
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    branchId: 'branch-1',
    name: 'Welcome Email',
    subject: 'Welcome to {{gymName}}, {{memberName}}!',
    htmlContent: '<h1>Welcome {{memberName}}!</h1><p>Thank you for joining {{gymName}}. We are excited to have you as part of our fitness community.</p>',
    textContent: 'Welcome {{memberName}}! Thank you for joining {{gymName}}.',
    category: 'welcome',
    variables: ['{{memberName}}', '{{gymName}}'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    branchId: 'branch-1',
    name: 'Payment Reminder',
    subject: 'Payment Due - {{memberName}}',
    htmlContent: '<h2>Payment Reminder</h2><p>Hi {{memberName}}, your payment of {{amount}} is due on {{date}}.</p>',
    category: 'payment',
    variables: ['{{memberName}}', '{{amount}}', '{{date}}'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockEmailLogs: EmailLog[] = [
  {
    id: '1',
    branchId: 'branch-1',
    templateId: '1',
    recipientEmail: 'john@example.com',
    subject: 'Welcome to GymFit Pro, John!',
    status: 'sent',
    sentAt: new Date(),
    createdAt: new Date()
  },
  {
    id: '2',
    branchId: 'branch-1',
    templateId: '2',
    recipientEmail: 'jane@example.com',
    subject: 'Payment Due - Jane',
    status: 'failed',
    error: 'Invalid email address',
    createdAt: new Date()
  }
];

export default function EmailSettings() {
  const [activeTab, setActiveTab] = useState('configuration');
  const [emailSettings, setEmailSettings] = useState<EmailSettingsType | undefined>(mockEmailSettings);
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockTemplates);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(mockEmailLogs);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | undefined>();
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const { toast } = useToast();

  const handleSaveEmailSettings = (settings: Partial<EmailSettingsType>) => {
    // In a real app, this would make an API call
    const updatedSettings = {
      ...mockEmailSettings,
      ...settings,
      updatedAt: new Date()
    };
    setEmailSettings(updatedSettings);
    
    // Store in localStorage for persistence
    localStorage.setItem('emailSettings', JSON.stringify(updatedSettings));
  };

  const handleTestEmailSettings = async (settings: Partial<EmailSettingsType>) => {
    // Mock email test - in a real app, this would make an API call
    return new Promise<{ success: boolean; message: string }>((resolve) => {
      setTimeout(() => {
        const isValid = Boolean(settings.fromEmail && settings.fromName);
        resolve({
          success: isValid,
          message: isValid 
            ? 'Email configuration test successful!' 
            : 'Email configuration test failed. Please check your settings.'
        });
      }, 2000);
    });
  };

  const handleSaveTemplate = (templateData: Partial<EmailTemplate>) => {
    if (editingTemplate) {
      // Update existing template
      const updatedTemplate = {
        ...editingTemplate,
        ...templateData,
        updatedAt: new Date()
      };
      setTemplates(templates.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
    } else {
      // Create new template
      const newTemplate: EmailTemplate = {
        id: Date.now().toString(),
        branchId: 'branch-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...templateData
      } as EmailTemplate;
      setTemplates([...templates, newTemplate]);
    }
    
    setShowTemplateEditor(false);
    setEditingTemplate(undefined);
  };

  const handlePreviewTemplate = (template: Partial<EmailTemplate>) => {
    // In a real app, this could open a preview modal or navigate to a preview page
    console.log('Preview template:', template);
  };

  const handleTestTemplate = async (template: Partial<EmailTemplate>, testEmail: string) => {
    // Mock email test - in a real app, this would make an API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Add to email logs
        const newLog: EmailLog = {
          id: Date.now().toString(),
          branchId: 'branch-1',
          templateId: template.name ? 'test' : undefined,
          recipientEmail: testEmail,
          subject: template.subject || 'Test Email',
          status: 'sent',
          sentAt: new Date(),
          createdAt: new Date()
        };
        setEmailLogs([newLog, ...emailLogs]);
        resolve();
      }, 1000);
    });
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowTemplateEditor(true);
    setActiveTab('templates');
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(undefined);
    setShowTemplateEditor(true);
    setActiveTab('templates');
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    toast({
      title: 'Template Deleted',
      description: 'Email template has been deleted successfully'
    });
  };

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const duplicatedTemplate: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTemplates([...templates, duplicatedTemplate]);
    toast({
      title: 'Template Duplicated',
      description: 'Email template has been duplicated successfully'
    });
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('emailSettings');
    if (saved) {
      try {
        setEmailSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load email settings:', error);
      }
    }
  }, []);

  const getStatusBadge = (status: EmailLog['status']) => {
    const variants = {
      sent: 'default',
      pending: 'secondary',
      failed: 'destructive',
      bounced: 'destructive'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Email Settings</h1>
        <p className="text-muted-foreground">Configure email providers and manage email templates</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration">
          <EmailConfigurationForm
            settings={emailSettings}
            onSave={handleSaveEmailSettings}
            onTest={handleTestEmailSettings}
          />
        </TabsContent>

        <TabsContent value="templates">
          {showTemplateEditor ? (
            <EmailTemplateEditor
              template={editingTemplate}
              onSave={handleSaveTemplate}
              onPreview={handlePreviewTemplate}
              onTest={handleTestTemplate}
            />
          ) : (
            <EmailTemplateList
              templates={templates}
              onEdit={handleEditTemplate}
              onCreate={handleCreateTemplate}
              onDelete={handleDeleteTemplate}
              onDuplicate={handleDuplicateTemplate}
              onPreview={handlePreviewTemplate}
            />
          )}

          {showTemplateEditor && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setShowTemplateEditor(false);
                  setEditingTemplate(undefined);
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to Templates
              </button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Email Logs
              </CardTitle>
              <CardDescription>
                View the history of sent emails and their delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Email Logs</h3>
                  <p className="text-muted-foreground">
                    Email logs will appear here once you start sending emails
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent At</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">
                            {log.recipientEmail}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {log.subject}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(log.status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.sentAt ? format(log.sentAt, 'MMM dd, yyyy HH:mm') : '-'}
                          </TableCell>
                          <TableCell className="text-sm text-destructive">
                            {log.error || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
