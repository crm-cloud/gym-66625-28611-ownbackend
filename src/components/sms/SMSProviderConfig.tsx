
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Settings, Shield, Activity } from 'lucide-react';
import { SMSProvider } from '@/types/sms';

interface SMSProviderConfigProps {
  provider?: SMSProvider;
  onSave: (provider: SMSProvider) => void;
  onCancel: () => void;
}

export function SMSProviderConfig({ provider, onSave, onCancel }: SMSProviderConfigProps) {
  const [formData, setFormData] = useState<Partial<SMSProvider>>(provider || {
    name: '',
    type: 'twilio',
    isActive: true,
    config: {},
    rateLimit: {
      perMinute: 10,
      perHour: 100,
      perDay: 1000
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as SMSProvider);
  };

  const renderProviderConfig = () => {
    switch (formData.type) {
      case 'twilio':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountSid">Account SID</Label>
              <Input
                id="accountSid"
                value={formData.config?.accountSid || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, accountSid: e.target.value }
                })}
                placeholder="Enter Twilio Account SID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authToken">Auth Token</Label>
              <Input
                id="authToken"
                type="password"
                value={formData.config?.authToken || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, authToken: e.target.value }
                })}
                placeholder="Enter Twilio Auth Token"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromNumber">From Number</Label>
              <Input
                id="fromNumber"
                value={formData.config?.fromNumber || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, fromNumber: e.target.value }
                })}
                placeholder="+1234567890"
              />
            </div>
          </div>
        );

      case 'aws-sns':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessKeyId">Access Key ID</Label>
              <Input
                id="accessKeyId"
                value={formData.config?.accessKeyId || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, accessKeyId: e.target.value }
                })}
                placeholder="Enter AWS Access Key ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretAccessKey">Secret Access Key</Label>
              <Input
                id="secretAccessKey"
                type="password"
                value={formData.config?.secretAccessKey || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, secretAccessKey: e.target.value }
                })}
                placeholder="Enter AWS Secret Access Key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select
                value={formData.config?.region || ''}
                onValueChange={(value) => setFormData({
                  ...formData,
                  config: { ...formData.config, region: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AWS Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                  <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                  <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                  <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'vonage':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                value={formData.config?.apiKey || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, apiKey: e.target.value }
                })}
                placeholder="Enter Vonage API Key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input
                id="apiSecret"
                type="password"
                value={formData.config?.apiSecret || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, apiSecret: e.target.value }
                })}
                placeholder="Enter Vonage API Secret"
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
          <MessageSquare className="w-5 h-5" />
          {provider ? 'Edit SMS Provider' : 'Add SMS Provider'}
        </CardTitle>
        <CardDescription>
          Configure SMS provider settings and authentication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="limits">Rate Limits</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Provider Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter provider name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Provider Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="aws-sns">AWS SNS</SelectItem>
                      <SelectItem value="vonage">Vonage</SelectItem>
                      <SelectItem value="messagebird">MessageBird</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-sm text-muted-foreground">Enable this provider</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <Separator />

              {renderProviderConfig()}
            </TabsContent>

            <TabsContent value="limits" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="perMinute">Per Minute</Label>
                  <Input
                    id="perMinute"
                    type="number"
                    value={formData.rateLimit?.perMinute || 10}
                    onChange={(e) => setFormData({
                      ...formData,
                      rateLimit: { ...formData.rateLimit!, perMinute: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perHour">Per Hour</Label>
                  <Input
                    id="perHour"
                    type="number"
                    value={formData.rateLimit?.perHour || 100}
                    onChange={(e) => setFormData({
                      ...formData,
                      rateLimit: { ...formData.rateLimit!, perHour: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perDay">Per Day</Label>
                  <Input
                    id="perDay"
                    type="number"
                    value={formData.rateLimit?.perDay || 1000}
                    onChange={(e) => setFormData({
                      ...formData,
                      rateLimit: { ...formData.rateLimit!, perDay: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="100000"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-6">
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Test SMS Configuration</h3>
                <p className="text-muted-foreground mb-4">
                  Send a test SMS to verify your configuration
                </p>
                <div className="space-y-4 max-w-md mx-auto">
                  <Input placeholder="Enter phone number" />
                  <Button type="button" variant="outline" className="w-full">
                    Send Test SMS
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {provider ? 'Update' : 'Create'} Provider
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
