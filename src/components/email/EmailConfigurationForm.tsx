import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Mail, TestTube, Eye, EyeOff } from 'lucide-react';
import { EmailProvider, EmailSettings } from '@/types/email';
import { useToast } from '@/hooks/use-toast';

const emailProviders: EmailProvider[] = [
  { id: 'smtp', name: 'Custom SMTP', type: 'smtp' },
  { id: 'sendgrid', name: 'SendGrid', type: 'sendgrid' },
  { id: 'mailgun', name: 'Mailgun', type: 'mailgun' },
  { id: 'ses', name: 'Amazon SES', type: 'ses' }
];

const emailConfigSchema = z.object({
  providerId: z.string().min(1, 'Provider is required'),
  fromEmail: z.string().email('Valid email is required'),
  fromName: z.string().min(1, 'From name is required'),
  replyToEmail: z.string().email('Valid email is required').optional().or(z.literal('')),
  isActive: z.boolean(),
  // SMTP fields
  host: z.string().optional(),
  port: z.number().optional(),
  secure: z.boolean().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  // SendGrid/Mailgun/AWS fields
  apiKey: z.string().optional(),
  domain: z.string().optional(),
  region: z.string().optional(),
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional()
});

interface EmailConfigurationFormProps {
  settings?: EmailSettings;
  onSave: (settings: Partial<EmailSettings>) => void;
  onTest: (settings: Partial<EmailSettings>) => Promise<{ success: boolean; message: string }>;
}

export const EmailConfigurationForm = ({ settings, onSave, onTest }: EmailConfigurationFormProps) => {
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider['type']>(
    settings?.providerType || 'smtp'
  );
  const [showPasswords, setShowPasswords] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(emailConfigSchema),
    defaultValues: {
      providerId: settings?.providerId || 'smtp',
      fromEmail: settings?.fromEmail || '',
      fromName: settings?.fromName || '',
      replyToEmail: settings?.replyToEmail || '',
      isActive: settings?.isActive ?? true,
      // Extract config fields to flat structure
      host: (settings?.config as any)?.host || '',
      port: (settings?.config as any)?.port || 587,
      secure: (settings?.config as any)?.secure || false,
      username: (settings?.config as any)?.username || '',
      password: (settings?.config as any)?.password || '',
      apiKey: (settings?.config as any)?.apiKey || '',
      domain: (settings?.config as any)?.domain || '',
      region: (settings?.config as any)?.region || '',
      accessKeyId: (settings?.config as any)?.accessKeyId || '',
      secretAccessKey: (settings?.config as any)?.secretAccessKey || ''
    }
  });

  const handleProviderChange = (providerId: string) => {
    const provider = emailProviders.find(p => p.id === providerId);
    if (provider) {
      setSelectedProvider(provider.type);
      form.setValue('providerId', providerId);
    }
  };

  const handleTest = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsTesting(true);
    try {
      const values = form.getValues();
      const formattedSettings = formatSettingsForSubmission(values);
      const result = await onTest(formattedSettings);
      
      toast({
        title: result.success ? 'Test Successful' : 'Test Failed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Failed to test email configuration',
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const formatSettingsForSubmission = (values: any) => {
    const { providerId, fromEmail, fromName, replyToEmail, isActive, ...configFields } = values;
    
    let config: any = {};
    
    switch (selectedProvider) {
      case 'smtp':
        config = {
          host: configFields.host || '',
          port: configFields.port || 587,
          secure: configFields.secure || false,
          username: configFields.username || '',
          password: configFields.password || ''
        };
        break;
      case 'sendgrid':
        config = {
          apiKey: configFields.apiKey || ''
        };
        break;
      case 'mailgun':
        config = {
          apiKey: configFields.apiKey || '',
          domain: configFields.domain || ''
        };
        break;
      case 'ses':
        config = {
          accessKeyId: configFields.accessKeyId || '',
          secretAccessKey: configFields.secretAccessKey || '',
          region: configFields.region || ''
        };
        break;
    }
    
    return {
      providerId,
      fromEmail,
      fromName,
      replyToEmail,
      isActive,
      providerType: selectedProvider,
      config
    } as Partial<EmailSettings>;
  };

  const onSubmit = (values: any) => {
    const formattedSettings = formatSettingsForSubmission(values);
    onSave(formattedSettings);
    toast({
      title: 'Settings Saved',
      description: 'Email configuration has been saved successfully'
    });
  };

  const renderConfigFields = () => {
    switch (selectedProvider) {
      case 'smtp':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Host</FormLabel>
                    <FormControl>
                      <Input placeholder="smtp.gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="587" 
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 587)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="secure"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Use SSL/TLS</FormLabel>
                    <p className="text-sm text-muted-foreground">Enable secure connection</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="your-email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPasswords ? 'text' : 'password'}
                          placeholder="your-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(!showPasswords)}
                        >
                          {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 'sendgrid':
        return (
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SendGrid API Key</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPasswords ? 'text' : 'password'}
                      placeholder="SG.xxxxxxxxxxxxxxxx"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'mailgun':
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain</FormLabel>
                  <FormControl>
                    <Input placeholder="mg.yourdomain.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPasswords ? 'text' : 'password'}
                        placeholder="key-xxxxxxxxxxxxxxxx"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 'ses':
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AWS Region</FormLabel>
                  <FormControl>
                    <Input placeholder="us-east-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accessKeyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Key ID</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPasswords ? 'text' : 'password'}
                          placeholder="AKIAXXXXXXXXXXXXXXXX"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(!showPasswords)}
                        >
                          {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secretAccessKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secret Access Key</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPasswords ? 'text' : 'password'}
                          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(!showPasswords)}
                        >
                          {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Configuration
        </CardTitle>
        <CardDescription>
          Configure your email provider settings for sending automated emails
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="providerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Provider</FormLabel>
                  <Select onValueChange={handleProviderChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select email provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {emailProviders.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {renderConfigFields()}

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Sender Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fromEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Email</FormLabel>
                        <FormControl>
                          <Input placeholder="noreply@yourgym.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fromName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Gym Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="replyToEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reply-To Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="support@yourgym.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Active Configuration</FormLabel>
                        <p className="text-sm text-muted-foreground">Enable this email configuration</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Save Configuration</Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleTest}
                disabled={isTesting}
                className="flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                {isTesting ? 'Testing...' : 'Test Configuration'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};