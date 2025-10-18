
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { TrainerConfigSettings } from '@/types/trainer-config';
import { 
  Settings, 
  Bell, 
  Users, 
  Target, 
  History,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface TrainerConfigurationPanelProps {
  branchId: string;
  onConfigChange?: (config: TrainerConfigSettings) => void;
}

const defaultConfig: Omit<TrainerConfigSettings, 'id' | 'branchId' | 'createdAt' | 'updatedAt'> = {
  autoAssignment: {
    enabled: true,
    prioritizeBy: ['specialty_match', 'availability', 'rating'],
    requireSpecialtyMatch: true,
    requireAvailability: true,
    maxPriceThreshold: undefined,
    minRatingThreshold: 4.0,
    minExperienceThreshold: 1,
    enableLoadBalancing: true,
    maxUtilizationThreshold: 85,
    assignmentWindowHours: 24
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    assignmentNotifications: true,
    scheduleReminders: true,
    performanceAlerts: true,
    utilizationWarnings: true
  },
  businessRules: {
    maxSessionsPerDay: 8,
    maxClientsPerTrainer: 25,
    minSessionGap: 15,
    allowBackToBackSessions: false,
    requireCertificationMatch: false,
    enableWaitlist: true,
    autoRescheduleOnCancel: false
  },
  performanceThresholds: {
    minRating: 4.0,
    minPunctualityScore: 90,
    maxCancellationRate: 10,
    targetUtilizationRate: 75,
    reviewPeriodDays: 30
  }
};

export const TrainerConfigurationPanel = ({ branchId, onConfigChange }: TrainerConfigurationPanelProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<TrainerConfigSettings>({
    id: 'config_001',
    branchId,
    ...defaultConfig,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('auto-assignment');

  const updateConfig = (path: string, value: any) => {
    const keys = path.split('.');
    const newConfig = { ...config };
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setConfig(newConfig);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedConfig = {
        ...config,
        updatedAt: new Date()
      };
      
      setConfig(updatedConfig);
      setHasChanges(false);
      onConfigChange?.(updatedConfig);
      
      toast({
        title: "Configuration Saved",
        description: "Trainer management settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setConfig({
      ...config,
      ...defaultConfig,
      updatedAt: new Date()
    });
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6" />
          <div>
            <h2 className="text-2xl font-bold">Trainer Configuration</h2>
            <p className="text-muted-foreground">Manage trainer assignment and business rules</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="auto-assignment">Auto Assignment</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="business-rules">Business Rules</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="auto-assignment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto Assignment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-assignment-enabled">Enable Auto Assignment</Label>
                <Switch
                  id="auto-assignment-enabled"
                  checked={config.autoAssignment.enabled}
                  onCheckedChange={(checked) => updateConfig('autoAssignment.enabled', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Assignment Priorities (in order)</Label>
                <div className="grid grid-cols-2 gap-4">
                  {['specialty_match', 'availability', 'rating', 'experience', 'price'].map((priority) => (
                    <div key={priority} className="flex items-center space-x-2">
                      <Switch
                        checked={config.autoAssignment.prioritizeBy.includes(priority as any)}
                        onCheckedChange={(checked) => {
                          const current = config.autoAssignment.prioritizeBy;
                          const updated = checked 
                            ? [...current, priority as any]
                            : current.filter(p => p !== priority);
                          updateConfig('autoAssignment.prioritizeBy', updated);
                        }}
                      />
                      <Label className="capitalize">{priority.replace('_', ' ')}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-rating">Minimum Rating</Label>
                  <Input
                    id="min-rating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={config.autoAssignment.minRatingThreshold || ''}
                    onChange={(e) => updateConfig('autoAssignment.minRatingThreshold', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-utilization">Max Utilization (%)</Label>
                  <Input
                    id="max-utilization"
                    type="number"
                    min="50"
                    max="100"
                    value={config.autoAssignment.maxUtilizationThreshold}
                    onChange={(e) => updateConfig('autoAssignment.maxUtilizationThreshold', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(config.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</Label>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => updateConfig(`notifications.${key}`, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business-rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-sessions">Max Sessions per Day</Label>
                  <Input
                    id="max-sessions"
                    type="number"
                    min="1"
                    max="12"
                    value={config.businessRules.maxSessionsPerDay}
                    onChange={(e) => updateConfig('businessRules.maxSessionsPerDay', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-clients">Max Clients per Trainer</Label>
                  <Input
                    id="max-clients"
                    type="number"
                    min="10"
                    max="50"
                    value={config.businessRules.maxClientsPerTrainer}
                    onChange={(e) => updateConfig('businessRules.maxClientsPerTrainer', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              {['allowBackToBackSessions', 'requireCertificationMatch', 'enableWaitlist', 'autoRescheduleOnCancel'].map((rule) => (
                <div key={rule} className="flex items-center justify-between">
                  <Label className="capitalize">{rule.replace(/([A-Z])/g, ' $1').toLowerCase()}</Label>
                  <Switch
                    checked={config.businessRules[rule as keyof typeof config.businessRules] as boolean}
                    onCheckedChange={(checked) => updateConfig(`businessRules.${rule}`, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Thresholds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-rating-perf">Minimum Rating</Label>
                  <Input
                    id="min-rating-perf"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={config.performanceThresholds.minRating}
                    onChange={(e) => updateConfig('performanceThresholds.minRating', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="punctuality-score">Min Punctuality Score (%)</Label>
                  <Input
                    id="punctuality-score"
                    type="number"
                    min="70"
                    max="100"
                    value={config.performanceThresholds.minPunctualityScore}
                    onChange={(e) => updateConfig('performanceThresholds.minPunctualityScore', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
