import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Mail, MessageSquare, CreditCard, DollarSign } from 'lucide-react';
import { useSystemSettings, useBulkUpdateSettings } from '@/hooks/useSystemSettings';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

/**
 * Gym Settings Page - ADMIN ONLY
 * These settings apply to specific gym only (gym_id = current gym, branch_id = null)
 */
export default function GymSettings() {
  const { toast } = useToast();
  const { authState } = useAuth();
  const gymId = authState.user?.gym_id;
  const { data: settings, isLoading } = useSystemSettings();
  const updateSettings = useBulkUpdateSettings();
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = async (category: string, config: Record<string, unknown>) => {
    try {
      await updateSettings.mutateAsync({
        category,
        config,
        scope: 'gym',
        gymId
      });
      toast({
        title: 'Success',
        description: 'Gym settings updated successfully'
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
        <h1 className="text-3xl font-bold">Gym Settings</h1>
        <p className="text-muted-foreground">Configure settings for your gym</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">
            <Building className="w-4 h-4 mr-2" />
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
          <TabsTrigger value="whatsapp">
            <MessageSquare className="w-4 h-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="billing">
            <DollarSign className="w-4 h-4 mr-2" />
            Billing & GST
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gym Configuration</CardTitle>
              <CardDescription>Basic settings for your gym</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select defaultValue="America/New_York">
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
                  <Label>Currency</Label>
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
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure email service for your gym</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Use Custom Email Provider</Label>
                  <p className="text-sm text-muted-foreground">Override platform default</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label>From Email</Label>
                <Input placeholder="noreply@yourgym.com" />
              </div>
              <div className="space-y-2">
                <Label>From Name</Label>
                <Input placeholder="Your Gym Name" />
              </div>
              <Button onClick={() => handleSave('email', {})}>Save Email Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>SMS Configuration</CardTitle>
              <CardDescription>Configure SMS notifications for your gym</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send SMS to members</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label>Sender ID</Label>
                <Input placeholder="YOURGYM" />
              </div>
              <Button onClick={() => handleSave('sms', {})}>Save SMS Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Configuration</CardTitle>
              <CardDescription>Configure WhatsApp Business for your gym</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">Send WhatsApp messages</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label>Business Phone Number</Label>
                <Input placeholder="+1234567890" />
              </div>
              <Button onClick={() => handleSave('whatsapp', {})}>Save WhatsApp Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway</CardTitle>
              <CardDescription>Configure payment processing for your gym</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Provider</Label>
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
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input type="password" placeholder="Enter your API key" />
              </div>
              <Button onClick={() => handleSave('payment-gateways', {})}>Save Payment Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Tax</CardTitle>
              <CardDescription>Configure billing and GST settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable GST</Label>
                  <p className="text-sm text-muted-foreground">Add GST to invoices</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label>GST Percentage</Label>
                <Input type="number" defaultValue="18" />
              </div>
              <div className="space-y-2">
                <Label>GSTIN Number</Label>
                <Input placeholder="Enter your GSTIN" />
              </div>
              <Button onClick={() => handleSave('general', {})}>Save Billing Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
