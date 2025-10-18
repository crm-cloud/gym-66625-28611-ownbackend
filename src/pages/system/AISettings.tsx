import { useState } from 'react';
import { Bot, BrainCircuit, Check, ChevronDown, Copy, Key, MessageSquare, Plus, Save, Trash2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

type AIProvider = 'openai' | 'google' | 'anthropic' | 'azure' | 'custom';

interface AIProviderConfig {
  id: string;
  name: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
  isActive: boolean;
  temperature: number;
  maxTokens: number;
}

export default function AISettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('providers');
  
  // Sample AI providers data - in a real app, this would come from an API
  const [aiProviders, setAiProviders] = useState<AIProviderConfig[]>([
    {
      id: '1',
      name: 'OpenAI',
      apiKey: 'sk-...',
      model: 'gpt-4',
      isActive: true,
      temperature: 0.7,
      maxTokens: 1000,
    },
    {
      id: '2',
      name: 'Google Gemini',
      apiKey: 'AIza...',
      model: 'gemini-pro',
      isActive: true,
      temperature: 0.7,
      maxTokens: 1000,
    },
  ]);

  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openai');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      // In a real app, save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'AI settings saved successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save AI settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProvider = () => {
    const newProvider: AIProviderConfig = {
      id: Date.now().toString(),
      name: selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1),
      apiKey: '',
      model: selectedProvider === 'openai' ? 'gpt-4' : 
             selectedProvider === 'google' ? 'gemini-pro' :
             selectedProvider === 'anthropic' ? 'claude-2' : 'custom-model',
      isActive: true,
      temperature: 0.7,
      maxTokens: 1000,
    };
    setAiProviders([...aiProviders, newProvider]);
  };

  const handleDeleteProvider = (id: string) => {
    if (aiProviders.length <= 1) {
      toast({
        title: 'Error',
        description: 'You must have at least one AI provider',
        variant: 'destructive',
      });
      return;
    }
    setAiProviders(aiProviders.filter(provider => provider.id !== id));
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: 'Copied to clipboard',
      description: 'API key has been copied to your clipboard',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Settings</h2>
        <p className="text-muted-foreground">Configure AI providers and settings for the Diet & Workout Planner</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="providers">
            <Zap className="w-4 h-4 mr-2" />
            AI Providers
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <BrainCircuit className="w-4 h-4 mr-2" />
            AI Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI Providers</CardTitle>
                  <CardDescription>
                    Configure your AI providers for the Diet & Workout Planner
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedProvider} onValueChange={(value) => setSelectedProvider(value as AIProvider)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI (ChatGPT)</SelectItem>
                      <SelectItem value="google">Google Gemini</SelectItem>
                      <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                      <SelectItem value="azure">Azure OpenAI</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddProvider}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Provider
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {aiProviders.map((provider) => (
                <Card key={provider.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="absolute right-4 top-4 flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Active</span>
                        <Switch
                          checked={provider.isActive}
                          onCheckedChange={(checked) => {
                            setAiProviders(
                              aiProviders.map((p) =>
                                p.id === provider.id ? { ...p, isActive: checked } : p
                              )
                            );
                          }}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteProvider(provider.id)}
                        disabled={aiProviders.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        {provider.name === 'OpenAI' && <Bot className="w-5 h-5" />}
                        {provider.name === 'Google' && <MessageSquare className="w-5 h-5" />}
                        {provider.name === 'Anthropic' && <BrainCircuit className="w-5 h-5" />}
                        <h3 className="text-lg font-medium">{provider.name}</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex space-x-2">
                            <Input
                              type="password"
                              value={provider.apiKey}
                              onChange={(e) =>
                                setAiProviders(
                                  aiProviders.map((p) =>
                                    p.id === provider.id
                                      ? { ...p, apiKey: e.target.value }
                                      : p
                                  )
                                )
                              }
                              placeholder="Enter API key"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleCopyApiKey(provider.apiKey)}
                              disabled={!provider.apiKey}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Model</Label>
                          <Select
                            value={provider.model}
                            onValueChange={(value) =>
                              setAiProviders(
                                aiProviders.map((p) =>
                                  p.id === provider.id ? { ...p, model: value } : p
                                )
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              {provider.name === 'OpenAI' && (
                                <>
                                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                </>
                              )}
                              {provider.name === 'Google' && (
                                <>
                                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                                  <SelectItem value="gemini-ultra">Gemini Ultra</SelectItem>
                                </>
                              )}
                              {provider.name === 'Anthropic' && (
                                <>
                                  <SelectItem value="claude-2">Claude 2</SelectItem>
                                  <SelectItem value="claude-instant">Claude Instant</SelectItem>
                                </>
                              )}
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {provider.model === 'custom' && (
                          <div className="space-y-2">
                            <Label>Custom Model Name</Label>
                            <Input
                              value={provider.model}
                              onChange={(e) =>
                                setAiProviders(
                                  aiProviders.map((p) =>
                                    p.id === provider.id
                                      ? { ...p, model: e.target.value }
                                      : p
                                  )
                                )
                              }
                              placeholder="Enter custom model name"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Temperature: {provider.temperature}</Label>
                            <span className="text-xs text-muted-foreground">
                              {provider.temperature < 0.3
                                ? 'Deterministic'
                                : provider.temperature < 0.7
                                ? 'Balanced'
                                : 'Creative'}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={provider.temperature}
                            onChange={(e) =>
                              setAiProviders(
                                aiProviders.map((p) =>
                                  p.id === provider.id
                                    ? { ...p, temperature: parseFloat(e.target.value) }
                                    : p
                                )
                              )
                            }
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Max Tokens: {provider.maxTokens}</Label>
                            <span className="text-xs text-muted-foreground">
                              {provider.maxTokens < 500
                                ? 'Short'
                                : provider.maxTokens < 2000
                                ? 'Medium'
                                : 'Long'}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="100"
                            max="4000"
                            step="100"
                            value={provider.maxTokens}
                            onChange={(e) =>
                              setAiProviders(
                                aiProviders.map((p) =>
                                  p.id === provider.id
                                    ? { ...p, maxTokens: parseInt(e.target.value) }
                                    : p
                                )
                              )
                            }
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Preferences</CardTitle>
              <CardDescription>
                Customize how the AI generates diet and workout plans
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Diet Plan Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Default Diet Style</Label>
                    <Select defaultValue="balanced">
                      <SelectTrigger>
                        <SelectValue placeholder="Select diet style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="keto">Keto</SelectItem>
                        <SelectItem value="paleo">Paleo</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="mediterranean">Mediterranean</SelectItem>
                        <SelectItem value="low-carb">Low Carb</SelectItem>
                        <SelectItem value="high-protein">High Protein</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Meal Complexity</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue placeholder="Select complexity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy (Quick Meals)</SelectItem>
                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="complex">Complex (Gourmet)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Allergies & Restrictions</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select restrictions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="dairy">Dairy-Free</SelectItem>
                        <SelectItem value="gluten">Gluten-Free</SelectItem>
                        <SelectItem value="nuts">Nut-Free</SelectItem>
                        <SelectItem value="seafood">Seafood-Free</SelectItem>
                        <SelectItem value="soy">Soy-Free</SelectItem>
                        <SelectItem value="eggs">Egg-Free</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Calorie Target</Label>
                    <div className="flex space-x-2">
                      <Input type="number" placeholder="e.g., 2000" />
                      <span className="text-sm text-muted-foreground flex items-center">
                        kcal/day
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Workout Plan Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Fitness Level</Label>
                    <Select defaultValue="intermediate">
                      <SelectTrigger>
                        <SelectValue placeholder="Select fitness level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="athlete">Athlete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Workout Focus</Label>
                    <Select defaultValue="strength">
                      <SelectTrigger>
                        <SelectValue placeholder="Select focus" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strength">Strength Training</SelectItem>
                        <SelectItem value="hypertrophy">Muscle Building</SelectItem>
                        <SelectItem value="endurance">Endurance</SelectItem>
                        <SelectItem value="weight-loss">Weight Loss</SelectItem>
                        <SelectItem value="general">General Fitness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Workout Days per Week</Label>
                    <Select defaultValue="4">
                      <SelectTrigger>
                        <SelectValue placeholder="Select days" />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4, 5, 6, 7].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'day' : 'days'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Workout Duration</Label>
                    <Select defaultValue="45">
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="75">75 minutes</SelectItem>
                        <SelectItem value="90">90+ minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">AI Behavior</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-1">
                      <Label>Enable Detailed Explanations</Label>
                      <p className="text-sm text-muted-foreground">
                        Include detailed reasoning behind recommendations
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-1">
                      <Label>Include Nutritional Information</Label>
                      <p className="text-sm text-muted-foreground">
                        Show detailed nutritional breakdown for meals
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-1">
                      <Label>Include Exercise Demonstrations</Label>
                      <p className="text-sm text-muted-foreground">
                        Add links to exercise demonstration videos
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-1">
                      <Label>Enable Progressive Overload</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically increase workout intensity over time
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
