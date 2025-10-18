import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  MessageSquare, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Phone,
  FileText,
  Activity,
  Shield,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { SMSProviderConfig } from '@/components/sms/SMSProviderConfig';
import { SMSTemplateEditor } from '@/components/sms/SMSTemplateEditor';
import { SMSProvider, SMSTemplate, type SMSSettings } from '@/types/sms';
import { PermissionGate } from '@/components/PermissionGate';

export default function SMSSettings() {
  const [activeTab, setActiveTab] = useState('providers');
  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<SMSProvider | undefined>();
  const [selectedTemplate, setSelectedTemplate] = useState<SMSTemplate | undefined>();

  // Mock data - in real app, this would come from API
  const [providers, setProviders] = useState<SMSProvider[]>([
    {
      id: '1',
      name: 'Twilio Primary',
      type: 'twilio',
      isActive: true,
      config: {
        accountSid: 'AC***************',
        authToken: '***************',
        fromNumber: '+1234567890'
      },
      rateLimit: {
        perMinute: 10,
        perHour: 100,
        perDay: 1000
      },
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    }
  ]);

  const [templates, setTemplates] = useState<SMSTemplate[]>([
    {
      id: '1',
      name: 'Welcome Message',
      category: 'welcome',
      event: 'member_welcome',
      subject: 'Welcome to GymFit Pro',
      body: 'Hi {{member_name}}, welcome to {{branch_name}}! We\'re excited to have you join our fitness community.',
      variables: ['member_name', 'branch_name'],
      isActive: true,
      language: 'en',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      createdBy: 'admin'
    }
  ]);

  const [settings, setSettings] = useState<SMSSettings>({
    id: '1',
    isEnabled: true,
    defaultProvider: '1',
    rateLimiting: {
      enabled: true,
      maxPerMinute: 10,
      maxPerHour: 100,
      maxPerDay: 1000
    },
    scheduling: {
      enabled: true,
      allowedHours: {
        start: '09:00',
        end: '21:00'
      },
      timezone: 'America/New_York',
      blackoutDates: []
    },
    compliance: {
      optOutKeywords: ['STOP', 'UNSUBSCRIBE', 'CANCEL'],
      optInRequired: true,
      requireDoubleOptIn: false,
      autoOptOutOnStop: true
    },
    notifications: {
      deliveryReports: true,
      failureAlerts: true,
      quotaWarnings: true
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  });

  const handleProviderSave = (provider: SMSProvider) => {
    if (selectedProvider) {
      setProviders(providers.map(p => p.id === provider.id ? provider : p));
    } else {
      setProviders([...providers, { ...provider, id: Date.now().toString() }]);
    }
    setShowProviderDialog(false);
    setSelectedProvider(undefined);
  };

  const handleTemplateSave = (template: SMSTemplate) => {
    if (selectedTemplate) {
      setTemplates(templates.map(t => t.id === template.id ? template : t));
    } else {
      setTemplates([...templates, { ...template, id: Date.now().toString() }]);
    }
    setShowTemplateDialog(false);
    setSelectedTemplate(undefined);
  };

  const handleProviderDelete = (id: string) => {
    setProviders(providers.filter(p => p.id !== id));
  };

  const handleTemplateDelete = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">SMS Settings</h1>
        <p className="text-muted-foreground">Configure SMS providers, templates, and messaging settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    SMS Providers
                  </CardTitle>
                  <CardDescription>
                    Manage SMS service providers and their configurations
                  </CardDescription>
                </div>
                <PermissionGate permission="sms.providers.create">
                  <Dialog open={showProviderDialog} onOpenChange={setShowProviderDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedProvider(undefined)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Provider
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>SMS Provider Configuration</DialogTitle>
                      </DialogHeader>
                      <SMSProviderConfig
                        provider={selectedProvider}
                        onSave={handleProviderSave}
                        onCancel={() => setShowProviderDialog(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </PermissionGate>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rate Limit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="font-medium">{provider.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{provider.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={provider.isActive ? 'default' : 'secondary'}>
                          {provider.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {provider.rateLimit.perMinute}/min
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <PermissionGate permission="sms.providers.edit">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedProvider(provider);
                                  setShowProviderDialog(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </PermissionGate>
                            <PermissionGate permission="sms.providers.delete">
                              <DropdownMenuItem 
                                onClick={() => handleProviderDelete(provider.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </PermissionGate>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    SMS Templates
                  </CardTitle>
                  <CardDescription>
                    Create and manage SMS message templates
                  </CardDescription>
                </div>
                <PermissionGate permission="sms.templates.create">
                  <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedTemplate(undefined)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>SMS Template Editor</DialogTitle>
                      </DialogHeader>
                      <SMSTemplateEditor
                        template={selectedTemplate}
                        onSave={handleTemplateSave}
                        onCancel={() => setShowTemplateDialog(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </PermissionGate>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.category}</Badge>
                      </TableCell>
                      <TableCell>{template.event}</TableCell>
                      <TableCell>
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <PermissionGate permission="sms.templates.edit">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedTemplate(template);
                                  setShowTemplateDialog(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </PermissionGate>
                            <PermissionGate permission="sms.templates.delete">
                              <DropdownMenuItem 
                                onClick={() => handleTemplateDelete(template.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </PermissionGate>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable SMS</Label>
                    <p className="text-sm text-muted-foreground">Turn SMS messaging on/off</p>
                  </div>
                  <Switch checked={settings.isEnabled} />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Default Provider</Label>
                  <p className="text-sm text-muted-foreground">Primary SMS provider</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Scheduling</Label>
                    <p className="text-sm text-muted-foreground">Respect time restrictions</p>
                  </div>
                  <Switch checked={settings.scheduling.enabled} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input value={settings.scheduling.allowedHours.start} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input value={settings.scheduling.allowedHours.end} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Compliance Settings
              </CardTitle>
              <CardDescription>
                Configure compliance and opt-out settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Opt-in Required</Label>
                  <p className="text-sm text-muted-foreground">Require explicit consent</p>
                </div>
                <Switch checked={settings.compliance.optInRequired} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Opt-out on STOP</Label>
                  <p className="text-sm text-muted-foreground">Automatically process STOP requests</p>
                </div>
                <Switch checked={settings.compliance.autoOptOutOnStop} />
              </div>

              <div className="space-y-2">
                <Label>Opt-out Keywords</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.compliance.optOutKeywords.map(keyword => (
                    <Badge key={keyword} variant="outline">{keyword}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  SMS Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sent Today</span>
                    <span className="font-medium">42</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This Week</span>
                    <span className="font-medium">287</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This Month</span>
                    <span className="font-medium">1,234</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Delivery Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-medium text-green-600">98.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Failed</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-medium">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Rate Limits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per Minute</span>
                    <span className="font-medium">5/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per Hour</span>
                    <span className="font-medium">42/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per Day</span>
                    <span className="font-medium">287/1000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}