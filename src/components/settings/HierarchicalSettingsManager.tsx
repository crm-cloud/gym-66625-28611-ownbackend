import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Building2, Globe, Mail, MessageSquare, Smartphone, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface SettingsLevel {
  level: 'super_admin' | 'branch';
  branchId?: string;
  branchName?: string;
}

interface SettingsData {
  email: {
    provider: string;
    smtp_host?: string;
    smtp_port?: number;
    smtp_username?: string;
    smtp_password?: string;
    api_key?: string;
    from_email: string;
    from_name: string;
    enabled: boolean;
    inherited: boolean;
  };
  sms: {
    provider: string;
    api_key?: string;
    api_secret?: string;
    sender_id?: string;
    enabled: boolean;
    inherited: boolean;
  };
  whatsapp: {
    provider: string;
    api_key?: string;
    phone_number?: string;
    webhook_url?: string;
    enabled: boolean;
    inherited: boolean;
  };
}

interface Props {
  level: SettingsLevel;
}

export function HierarchicalSettingsManager({ level }: Props) {
  const [activeTab, setActiveTab] = useState('email');
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();

  const { data: branches } = useQuery({
    queryKey: ['branches-for-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: level.level === 'super_admin'
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['hierarchical-settings', level.level, level.branchId],
    queryFn: async (): Promise<SettingsData> => {
      // Get super admin settings first (default/fallback)
      const { data: superData, error: superError } = await supabase
        .from('system_settings')
        .select('*')
        .in('category', ['email', 'sms', 'whatsapp'])
        .is('branch_id', null);
      
      if (superError) throw superError;
      const superAdminSettings = ((superData ?? []) as unknown) as Array<{ category: string; key: string; value: any }>;

      let branchSettings: any[] = [];

      // Merge settings with inheritance logic
      const mergeSettings = (category: string) => {
        const superSettings = superAdminSettings?.filter(s => s.category === category) || [];
        const branchOverrides = branchSettings.filter(s => s.category === category) || [];
        
        const merged: any = {};
        
        // Start with super admin settings
        superSettings.forEach(setting => {
          merged[setting.key] = setting.value;
        });
        
        // Override with branch settings if they exist
        branchOverrides.forEach(setting => {
          merged[setting.key] = setting.value;
        });
        
        // Determine if settings are inherited
        const inherited = level.level === 'branch' && branchOverrides.length === 0;
        
        return { ...merged, inherited };
      };

      return {
        email: mergeSettings('email'),
        sms: mergeSettings('sms'),
        whatsapp: mergeSettings('whatsapp'),
      };
    }
  });

  const saveSettings = useMutation({
    mutationFn: async (updatedSettings: SettingsData) => {
      const settingsToSave = [];
      
      for (const [category, categorySettings] of Object.entries(updatedSettings)) {
        if (category === 'inherited') continue;
        
        for (const [key, value] of Object.entries(categorySettings)) {
          if (key === 'inherited') continue;
          
          settingsToSave.push({
            category,
            key,
            value,
            description: `${category} ${key} setting`
          });
        }
      }
      
      // Delete existing settings for these categories
      const { error: deleteError } = await supabase
        .from('system_settings')
        .delete()
        .in('category', ['email', 'sms', 'whatsapp']);
      if (deleteError) throw deleteError;
      
      // Insert new settings
      const { error: insertError } = await supabase
        .from('system_settings')
        .insert(settingsToSave);
        
      if (insertError) throw insertError;
      
      return updatedSettings;
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: `${level.level === 'super_admin' ? 'Global' : 'Branch'} settings have been updated successfully.`
      });
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ['hierarchical-settings'] });
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateSetting = (category: string, key: string, value: any) => {
    if (settings) {
      const updatedSettings = {
        ...settings,
        [category]: {
          ...settings[category as keyof SettingsData],
          [key]: value,
          inherited: false // Mark as overridden
        }
      };
      setHasChanges(true);
      // In a real implementation, you'd update local state here
      console.log('Updated settings:', updatedSettings);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {level.level === 'super_admin' ? (
                <Globe className="h-6 w-6 text-primary" />
              ) : (
                <Building2 className="h-6 w-6 text-secondary" />
              )}
              <div>
                <CardTitle>
                  {level.level === 'super_admin' ? 'Global Settings' : `Branch Settings: ${level.branchName}`}
                </CardTitle>
                <CardDescription>
                  {level.level === 'super_admin' 
                    ? 'Configure default settings that apply to all branches unless overridden'
                    : 'Configure branch-specific settings that override global defaults'
                  }
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {level.level === 'branch' && settings?.email?.inherited && (
                <Badge variant="outline">Inheriting Global</Badge>
              )}
              {hasChanges && (
                <Button onClick={() => saveSettings.mutate(settings!)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Email Configuration
                {level.level === 'branch' && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="email-inherit">Inherit Global Settings</Label>
                    <Switch
                      id="email-inherit"
                      checked={settings?.email?.inherited || false}
                      onCheckedChange={(checked) => updateSetting('email', 'inherited', checked)}
                    />
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!settings?.email?.inherited || level.level === 'super_admin') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email-provider">Email Provider</Label>
                      <Select
                        value={settings?.email?.provider || 'smtp'}
                        onValueChange={(value) => updateSetting('email', 'provider', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="smtp">SMTP</SelectItem>
                          <SelectItem value="sendgrid">SendGrid</SelectItem>
                          <SelectItem value="mailgun">Mailgun</SelectItem>
                          <SelectItem value="ses">Amazon SES</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        checked={settings?.email?.enabled || false}
                        onCheckedChange={(checked) => updateSetting('email', 'enabled', checked)}
                      />
                      <Label>Enable Email</Label>
                    </div>
                  </div>

                  {settings?.email?.provider === 'smtp' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtp-host">SMTP Host</Label>
                        <Input
                          id="smtp-host"
                          value={settings?.email?.smtp_host || ''}
                          onChange={(e) => updateSetting('email', 'smtp_host', e.target.value)}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-port">SMTP Port</Label>
                        <Input
                          id="smtp-port"
                          type="number"
                          value={settings?.email?.smtp_port || 587}
                          onChange={(e) => updateSetting('email', 'smtp_port', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-username">Username</Label>
                        <Input
                          id="smtp-username"
                          value={settings?.email?.smtp_username || ''}
                          onChange={(e) => updateSetting('email', 'smtp_username', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-password">Password</Label>
                        <Input
                          id="smtp-password"
                          type="password"
                          value={settings?.email?.smtp_password || ''}
                          onChange={(e) => updateSetting('email', 'smtp_password', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="from-email">From Email</Label>
                      <Input
                        id="from-email"
                        value={settings?.email?.from_email || ''}
                        onChange={(e) => updateSetting('email', 'from_email', e.target.value)}
                        placeholder="noreply@gymflow.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="from-name">From Name</Label>
                      <Input
                        id="from-name"
                        value={settings?.email?.from_name || ''}
                        onChange={(e) => updateSetting('email', 'from_name', e.target.value)}
                        placeholder="GymFlow"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {level.level === 'branch' && settings?.email?.inherited && (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>This branch is inheriting global email settings.</p>
                  <p>Toggle off "Inherit Global Settings" to customize.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                SMS Configuration
                {level.level === 'branch' && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="sms-inherit">Inherit Global Settings</Label>
                    <Switch
                      id="sms-inherit"
                      checked={settings?.sms?.inherited || false}
                      onCheckedChange={(checked) => updateSetting('sms', 'inherited', checked)}
                    />
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!settings?.sms?.inherited || level.level === 'super_admin') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sms-provider">SMS Provider</Label>
                      <Select
                        value={settings?.sms?.provider || 'twilio'}
                        onValueChange={(value) => updateSetting('sms', 'provider', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="twilio">Twilio</SelectItem>
                          <SelectItem value="nexmo">Nexmo</SelectItem>
                          <SelectItem value="textmagic">TextMagic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        checked={settings?.sms?.enabled || false}
                        onCheckedChange={(checked) => updateSetting('sms', 'enabled', checked)}
                      />
                      <Label>Enable SMS</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sms-api-key">API Key</Label>
                      <Input
                        id="sms-api-key"
                        type="password"
                        value={settings?.sms?.api_key || ''}
                        onChange={(e) => updateSetting('sms', 'api_key', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sms-sender-id">Sender ID</Label>
                      <Input
                        id="sms-sender-id"
                        value={settings?.sms?.sender_id || ''}
                        onChange={(e) => updateSetting('sms', 'sender_id', e.target.value)}
                        placeholder="GYMFLOW"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {level.level === 'branch' && settings?.sms?.inherited && (
                <div className="text-center py-8 text-muted-foreground">
                  <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>This branch is inheriting global SMS settings.</p>
                  <p>Toggle off "Inherit Global Settings" to customize.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                WhatsApp Configuration
                {level.level === 'branch' && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="whatsapp-inherit">Inherit Global Settings</Label>
                    <Switch
                      id="whatsapp-inherit"
                      checked={settings?.whatsapp?.inherited || false}
                      onCheckedChange={(checked) => updateSetting('whatsapp', 'inherited', checked)}
                    />
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!settings?.whatsapp?.inherited || level.level === 'super_admin') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="whatsapp-provider">WhatsApp Provider</Label>
                      <Select
                        value={settings?.whatsapp?.provider || 'whatsapp-business'}
                        onValueChange={(value) => updateSetting('whatsapp', 'provider', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp-business">WhatsApp Business API</SelectItem>
                          <SelectItem value="twilio-whatsapp">Twilio WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        checked={settings?.whatsapp?.enabled || false}
                        onCheckedChange={(checked) => updateSetting('whatsapp', 'enabled', checked)}
                      />
                      <Label>Enable WhatsApp</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="whatsapp-api-key">API Key</Label>
                      <Input
                        id="whatsapp-api-key"
                        type="password"
                        value={settings?.whatsapp?.api_key || ''}
                        onChange={(e) => updateSetting('whatsapp', 'api_key', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp-phone">Phone Number</Label>
                      <Input
                        id="whatsapp-phone"
                        value={settings?.whatsapp?.phone_number || ''}
                        onChange={(e) => updateSetting('whatsapp', 'phone_number', e.target.value)}
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {level.level === 'branch' && settings?.whatsapp?.inherited && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>This branch is inheriting global WhatsApp settings.</p>
                  <p>Toggle off "Inherit Global Settings" to customize.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}