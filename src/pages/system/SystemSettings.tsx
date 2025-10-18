import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Settings, Shield, Database, Mail, Bell, MessageSquare, MessageCircle, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSystemSettings, useUpdateSystemSetting, useCreateSystemSetting } from '@/hooks/useSystemSettings';
import { SMSTemplateEditor } from '@/components/sms/SMSTemplateEditor';
import { WhatsAppTemplateEditor } from '@/components/templates/WhatsAppTemplateEditor';
import { HierarchicalSettingsManager } from '@/components/settings/HierarchicalSettingsManager';
import { EmailTemplateEditor } from '@/components/email/EmailTemplateEditor';
import { PredefinedTemplatesSection } from '@/components/templates/PredefinedTemplatesSection';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSearchParams } from 'react-router-dom';

export default function SystemSettings() {
  const { data: allSettings, isLoading } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();
  const createSetting = useCreateSystemSetting();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'general';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showSMSEditor, setShowSMSEditor] = useState(false);
  const [showEmailEditor, setShowEmailEditor] = useState(false);
const [showWhatsAppEditor, setShowWhatsAppEditor] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Group settings by category
  const getSettingsByCategory = (category: string) => {
    return allSettings?.filter(setting => setting.category === category) || [];
  };

  const getSettingValue = (category: string, key: string) => {
    const pendingKey = `${category}.${key}`;
    if (pendingKey in pendingChanges) {
      return pendingChanges[pendingKey];
    }
    const setting = allSettings?.find(s => s.category === category && s.key === key);
    return setting?.value;
  };

  const updateSettingValue = (category: string, key: string, value: any) => {
    const pendingKey = `${category}.${key}`;
    setPendingChanges(prev => ({ ...prev, [pendingKey]: value }));
    setHasUnsavedChanges(true);
  };

  const saveAllChanges = async () => {
    try {
      const promises = Object.entries(pendingChanges).map(async ([key, value]) => {
        const [category, settingKey] = key.split('.');
        const setting = allSettings?.find(s => s.category === category && s.key === settingKey);
        
        if (setting) {
          // Update existing setting
          return updateSetting.mutateAsync({ id: setting.id, value });
        } else {
          // Create new setting
          return createSetting.mutateAsync({
            category: category as 'general' | 'security' | 'database' | 'notifications' | 'backup' | 'subscription',
            key: settingKey,
            value,
            description: `${category} ${settingKey} setting`
          });
        }
      });
      
      await Promise.all(promises.filter(Boolean));
      setPendingChanges({});
      setHasUnsavedChanges(false);
      toast({
        title: "Success",
        description: "All settings saved successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save some settings",
        variant: "destructive"
      });
    }
  };

  const resetChanges = () => {
    setPendingChanges({});
    setHasUnsavedChanges(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground">Configure global system settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="messaging">Messaging Providers</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>Configure basic system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="app-name">Application Name</Label>
                  <Input 
                    id="app-name" 
                    value={getSettingValue('general', 'app_name') || 'GymFit Pro'} 
                    onChange={(e) => updateSettingValue('general', 'app_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input 
                    id="company-name" 
                    value={getSettingValue('general', 'company_name') || 'GymFit Corporation'} 
                    onChange={(e) => updateSettingValue('general', 'company_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <Select 
                    value={getSettingValue('general', 'default_timezone') || 'UTC'}
                    onValueChange={(value) => updateSettingValue('general', 'default_timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-auto">
                      {[
                        'UTC',
                        'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
                        'America/Toronto', 'America/Vancouver', 'America/Mexico_City', 'America/Sao_Paulo',
                        'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome', 'Europe/Madrid',
                        'Europe/Amsterdam', 'Europe/Stockholm', 'Europe/Moscow', 'Europe/Istanbul',
                        'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore',
                        'Asia/Bangkok', 'Asia/Mumbai', 'Asia/Dubai', 'Asia/Jerusalem', 'Asia/Kolkata',
                        'Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Perth',
                        'Pacific/Auckland', 'Pacific/Honolulu', 'Pacific/Fiji',
                        'Africa/Cairo', 'Africa/Lagos', 'Africa/Johannesburg', 'Africa/Nairobi'
                      ].map((timezone) => (
                        <SelectItem key={timezone} value={timezone}>
                          {timezone.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select 
                    value={getSettingValue('general', 'default_currency') || 'USD'}
                    onValueChange={(value) => updateSettingValue('general', 'default_currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { code: 'USD', name: 'US Dollar' },
                        { code: 'INR', name: 'Indian Rupee' },
                        { code: 'EUR', name: 'Euro' },
                        { code: 'GBP', name: 'British Pound' },
                        { code: 'JPY', name: 'Japanese Yen' },
                        { code: 'AUD', name: 'Australian Dollar' },
                        { code: 'CAD', name: 'Canadian Dollar' },
                        { code: 'CNY', name: 'Chinese Yuan' },
                        { code: 'SGD', name: 'Singapore Dollar' },
                        { code: 'AED', name: 'UAE Dirham' },
                      ].map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {`${currency.name} (${currency.code})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable to temporarily disable user access</p>
                  </div>
                  <Switch 
                    id="maintenance-mode" 
                    checked={getSettingValue('general', 'maintenance_mode') || false}
                    onCheckedChange={(checked) => updateSettingValue('general', 'maintenance_mode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="registration">Allow New Registrations</Label>
                    <p className="text-sm text-muted-foreground">Allow new users to register</p>
                  </div>
                  <Switch 
                    id="registration" 
                    checked={getSettingValue('general', 'allow_registration') ?? true}
                    onCheckedChange={(checked) => updateSettingValue('general', 'allow_registration', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">Require Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Force all users to enable 2FA</p>
                  </div>
                  <Switch 
                    id="two-factor" 
                    checked={getSettingValue('security', 'require_2fa') || false}
                    onCheckedChange={(checked) => updateSettingValue('security', 'require_2fa', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="session-timeout">Auto Logout</Label>
                    <p className="text-sm text-muted-foreground">Automatically log users out after inactivity</p>
                  </div>
                  <Switch 
                    id="session-timeout" 
                    checked={getSettingValue('security', 'auto_logout') ?? true}
                    onCheckedChange={(checked) => updateSettingValue('security', 'auto_logout', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="password-policy">Strong Password Policy</Label>
                    <p className="text-sm text-muted-foreground">Enforce strong password requirements</p>
                  </div>
                  <Switch 
                    id="password-policy" 
                    checked={getSettingValue('security', 'strong_password_policy') ?? true}
                    onCheckedChange={(checked) => updateSettingValue('security', 'strong_password_policy', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="session-duration">Session Duration (hours)</Label>
                  <Input 
                    id="session-duration" 
                    type="number" 
                    value={getSettingValue('security', 'session_duration_hours') || '8'} 
                    onChange={(e) => updateSettingValue('security', 'session_duration_hours', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                  <Input 
                    id="max-login-attempts" 
                    type="number" 
                    value={getSettingValue('security', 'max_login_attempts') || '5'} 
                    onChange={(e) => updateSettingValue('security', 'max_login_attempts', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Settings
              </CardTitle>
              <CardDescription>Configure database backup and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-backup">Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">Enable scheduled database backups</p>
                  </div>
                  <Switch 
                    id="auto-backup" 
                    checked={getSettingValue('database', 'auto_backup') ?? true}
                    onCheckedChange={(checked) => updateSettingValue('database', 'auto_backup', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="backup-compression">Compress Backups</Label>
                    <p className="text-sm text-muted-foreground">Compress backup files to save space</p>
                  </div>
                  <Switch 
                    id="backup-compression" 
                    checked={getSettingValue('database', 'backup_compression') ?? true}
                    onCheckedChange={(checked) => updateSettingValue('database', 'backup_compression', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Input 
                    id="backup-frequency" 
                    value={getSettingValue('database', 'backup_frequency') || 'Daily'} 
                    onChange={(e) => updateSettingValue('database', 'backup_frequency', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retention-days">Retention Period (days)</Label>
                  <Input 
                    id="retention-days" 
                    type="number" 
                    value={getSettingValue('database', 'retention_days') || '30'} 
                    onChange={(e) => updateSettingValue('database', 'retention_days', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button>Create Backup Now</Button>
                <Button variant="outline">View Backup History</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system-wide notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send system alerts via email</p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={getSettingValue('notifications', 'email_notifications') ?? true}
                    onCheckedChange={(checked) => updateSettingValue('notifications', 'email_notifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send critical alerts via SMS</p>
                  </div>
                  <Switch 
                    id="sms-notifications" 
                    checked={getSettingValue('notifications', 'sms_notifications') || false}
                    onCheckedChange={(checked) => updateSettingValue('notifications', 'sms_notifications', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input 
                  id="admin-email" 
                  type="email" 
                  value={getSettingValue('notifications', 'admin_email') || 'admin@gymfit.com'} 
                  onChange={(e) => updateSettingValue('notifications', 'admin_email', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messaging">
          <HierarchicalSettingsManager level={{ level: 'super_admin' }} />
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-6">
            {/* Predefined Templates Section */}
            <Card>
              <CardHeader>
                <CardTitle>Predefined Templates</CardTitle>
                <CardDescription>Quick-start templates with professional designs that you can customize</CardDescription>
              </CardHeader>
              <CardContent>
                <PredefinedTemplatesSection />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Templates
                  </CardTitle>
                  <CardDescription>Manage custom email notification templates</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={showEmailEditor} onOpenChange={setShowEmailEditor}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Email Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Email Template Editor</DialogTitle>
                      </DialogHeader>
                      <EmailTemplateEditor
                        onSave={(template) => {
                          console.log('Save email template:', template);
                          setShowEmailEditor(false);
                        }}
                        onPreview={(template) => {
                          console.log('Preview email template:', template);
                        }}
                        onTest={async (template, email) => {
                          console.log('Test email template:', template, email);
                        }}
                      />
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowEmailEditor(false)}>
                          Cancel
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    SMS Templates
                  </CardTitle>
                  <CardDescription>Manage SMS notification templates</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={showSMSEditor} onOpenChange={setShowSMSEditor}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Create SMS Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>SMS Template Editor</DialogTitle>
                      </DialogHeader>
                      <SMSTemplateEditor
                        onSave={(template) => {
                          console.log('Save SMS template:', template);
                          setShowSMSEditor(false);
                        }}
                        onCancel={() => setShowSMSEditor(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp Templates
                  </CardTitle>
                  <CardDescription>Manage WhatsApp business templates</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={showWhatsAppEditor} onOpenChange={setShowWhatsAppEditor}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Create WhatsApp Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>WhatsApp Template Editor</DialogTitle>
                      </DialogHeader>
                      <WhatsAppTemplateEditor
                        onSave={(template) => {
                          console.log('Save WhatsApp template:', template);
                          setShowWhatsAppEditor(false);
                        }}
                        onCancel={() => setShowWhatsAppEditor(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {hasUnsavedChanges && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-sm font-medium">You have unsaved changes</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetChanges}>Cancel</Button>
                <Button onClick={saveAllChanges} disabled={updateSetting.isPending || createSetting.isPending}>
                  {(updateSetting.isPending || createSetting.isPending) ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}