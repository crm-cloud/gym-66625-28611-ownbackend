import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, Webhook, Info, Check, Copy, Save } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { PaymentGatewayConfig } from '@/types/payment-gateway';

export default function PaymentGatewaySettings() {
  const [activeProvider, setActiveProvider] = useState<'razorpay' | 'payu' | 'ccavenue' | 'phonepe'>('razorpay');
  const [formData, setFormData] = useState<Partial<PaymentGatewayConfig>>({});

  const { data: configs, refetch } = useSupabaseQuery(
    ['payment_gateway_configs'],
    async () => {
      const { data, error } = await supabase
        .from('payment_gateway_configs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as PaymentGatewayConfig[];
    }
  );

  const currentConfig = configs?.find(c => c.provider === activeProvider);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const saveData = {
        ...formData,
        provider: activeProvider,
      };

      if (currentConfig) {
        const { error } = await supabase
          .from('payment_gateway_configs')
          .update(saveData)
          .eq('id', currentConfig.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_gateway_configs')
          .insert(saveData);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Payment gateway settings saved successfully',
      });
      refetch();
      setFormData({});
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  const webhookUrl = `${window.location.origin}/functions/v1/payment-webhook?provider=${activeProvider}`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: 'Copied',
      description: 'Webhook URL copied to clipboard',
    });
  };

  const config = currentConfig || formData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Gateway Settings</h1>
        <p className="text-muted-foreground">Configure online payment gateways for membership and POS transactions</p>
      </div>

      <Tabs value={activeProvider} onValueChange={(v: any) => setActiveProvider(v)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="razorpay" className="gap-2">
            Razorpay
            {configs?.find(c => c.provider === 'razorpay' && c.is_active) && (
              <Check className="w-4 h-4 text-green-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="payu" className="gap-2">
            PayU
            {configs?.find(c => c.provider === 'payu' && c.is_active) && (
              <Check className="w-4 h-4 text-green-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="ccavenue" className="gap-2">
            CCAvenue
            {configs?.find(c => c.provider === 'ccavenue' && c.is_active) && (
              <Check className="w-4 h-4 text-green-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="phonepe" className="gap-2">
            PhonePe
            {configs?.find(c => c.provider === 'phonepe' && c.is_active) && (
              <Check className="w-4 h-4 text-green-500" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeProvider} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {activeProvider.charAt(0).toUpperCase() + activeProvider.slice(1)} Configuration
                {config.is_active && (
                  <Badge variant="default">Active</Badge>
                )}
                {config.is_test_mode && (
                  <Badge variant="secondary">Test Mode</Badge>
                )}
              </CardTitle>
              <CardDescription>Enter your {activeProvider} API credentials and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="is_active">Enable Gateway</Label>
                  <Switch
                    id="is_active"
                    checked={config.is_active || false}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="is_test_mode">Test Mode</Label>
                  <Switch
                    id="is_test_mode"
                    checked={config.is_test_mode ?? true}
                    onCheckedChange={(checked) => handleInputChange('is_test_mode', checked)}
                  />
                </div>
              </div>

              {activeProvider === 'razorpay' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="api_key">API Key</Label>
                    <Input
                      id="api_key"
                      placeholder="rzp_test_xxxxxxxxxx"
                      value={config.api_key || ''}
                      onChange={(e) => handleInputChange('api_key', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api_secret">API Secret</Label>
                    <Input
                      id="api_secret"
                      type="password"
                      placeholder="Enter API secret"
                      value={config.api_secret || ''}
                      onChange={(e) => handleInputChange('api_secret', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhook_secret">Webhook Secret</Label>
                    <Input
                      id="webhook_secret"
                      type="password"
                      placeholder="Enter webhook secret"
                      value={config.webhook_secret || ''}
                      onChange={(e) => handleInputChange('webhook_secret', e.target.value)}
                    />
                  </div>
                </>
              )}

              {activeProvider === 'payu' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="api_key">Merchant Key</Label>
                    <Input
                      id="api_key"
                      placeholder="Enter merchant key"
                      value={config.api_key || ''}
                      onChange={(e) => handleInputChange('api_key', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salt_key">Salt Key</Label>
                    <Input
                      id="salt_key"
                      type="password"
                      placeholder="Enter salt key"
                      value={config.salt_key || ''}
                      onChange={(e) => handleInputChange('salt_key', e.target.value)}
                    />
                  </div>
                </>
              )}

              {activeProvider === 'ccavenue' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="merchant_id">Merchant ID</Label>
                    <Input
                      id="merchant_id"
                      placeholder="Enter merchant ID"
                      value={config.merchant_id || ''}
                      onChange={(e) => handleInputChange('merchant_id', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="access_code">Access Code</Label>
                    <Input
                      id="access_code"
                      placeholder="Enter access code"
                      value={config.access_code || ''}
                      onChange={(e) => handleInputChange('access_code', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api_secret">Working Key</Label>
                    <Input
                      id="api_secret"
                      type="password"
                      placeholder="Enter working key"
                      value={config.api_secret || ''}
                      onChange={(e) => handleInputChange('api_secret', e.target.value)}
                    />
                  </div>
                </>
              )}

              {activeProvider === 'phonepe' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="merchant_id">Merchant ID</Label>
                    <Input
                      id="merchant_id"
                      placeholder="Enter merchant ID"
                      value={config.merchant_id || ''}
                      onChange={(e) => handleInputChange('merchant_id', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salt_key">Salt Key</Label>
                    <Input
                      id="salt_key"
                      type="password"
                      placeholder="Enter salt key"
                      value={config.salt_key || ''}
                      onChange={(e) => handleInputChange('salt_key', e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_gateway_fee_percent">Gateway Fee (%)</Label>
                  <Input
                    id="payment_gateway_fee_percent"
                    type="number"
                    step="0.01"
                    placeholder="2.0"
                    value={config.payment_gateway_fee_percent || 2.0}
                    onChange={(e) => handleInputChange('payment_gateway_fee_percent', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst_on_gateway_fee">GST on Gateway Fee</Label>
                  <Switch
                    id="gst_on_gateway_fee"
                    checked={config.gst_on_gateway_fee ?? true}
                    onCheckedChange={(checked) => handleInputChange('gst_on_gateway_fee', checked)}
                  />
                </div>
              </div>

              <Button onClick={handleSave} className="w-full gap-2">
                <Save className="w-4 h-4" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>Configure webhook URL in your {activeProvider} dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input value={webhookUrl} readOnly className="flex-1 font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium">Setup Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Copy the webhook URL above</li>
                      <li>Go to your {activeProvider} dashboard</li>
                      <li>Navigate to Webhooks/API settings</li>
                      <li>Add the webhook URL and select payment events</li>
                      <li>Save the webhook configuration</li>
                    </ol>
                    <p className="mt-2">Supported events: payment.captured, payment.failed, refund.created</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
