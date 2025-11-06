import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Mail, MessageSquare, CreditCard, Bot, Shield } from 'lucide-react';
import { useSystemSettings, useBulkUpdateSettings } from '@/hooks/useSystemSettings';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Global Settings Page - SUPER ADMIN ONLY
 * These settings apply platform-wide (gym_id = null, branch_id = null)
 */
export default function GlobalSettings() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useSystemSettings();
  const updateSettings = useBulkUpdateSettings();
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = async (category: string, config: Record<string, unknown>) => {
    try {
      await updateSettings.mutateAsync({
        category,
        config,
        scope: 'global'
      });
      toast({
        title: 'Success',
        description: 'Global settings updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Global Platform Settings</h1>
        <p className="text-muted-foreground">Configure platform-wide settings for all gyms</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">
            <Globe className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms">
            <MessageSquare className="w-4 h-4 mr-2" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Bot className="w-4 h-4 mr-2" />
            AI Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
              <CardDescription>Default settings for all new gyms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Timezone</Label>
                  <Select defaultValue="UTC">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Asia/Kolkata">Indian Standard Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select defaultValue="USD">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => handleSave('general', {})}>Save General Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Email Provider</CardTitle>
              <CardDescription>Configure default email service for all gyms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select defaultValue="smtp">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smtp">SMTP</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input placeholder="smtp.example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input type="number" defaultValue="587" />
                </div>
                <div className="space-y-2">
                  <Label>Encryption</Label>
                  <Select defaultValue="tls">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => handleSave('email', {})}>Save Email Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>Global SMS Provider</CardTitle>
              <CardDescription>Configure SMS service for all gyms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select defaultValue="twilio">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="aws-sns">AWS SNS</SelectItem>
                    <SelectItem value="msg91">MSG91</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => handleSave('sms', {})}>Save SMS Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Global Payment Gateway</CardTitle>
              <CardDescription>Configure payment processing for all gyms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select defaultValue="stripe">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="razorpay">Razorpay</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => handleSave('payment-gateways', {})}>Save Payment Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Services</CardTitle>
              <CardDescription>Configure AI features for the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>AI Provider</Label>
                <Select defaultValue="openai">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google AI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => handleSave('ai', {})}>Save AI Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
