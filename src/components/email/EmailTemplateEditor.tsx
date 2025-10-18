
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Code, Send } from 'lucide-react';
import { EmailTemplate } from '@/types/email';
import { useToast } from '@/hooks/use-toast';

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  htmlContent: z.string().min(1, 'HTML content is required'),
  textContent: z.string().optional(),
  category: z.enum(['welcome', 'membership', 'payment', 'reminder', 'notification', 'custom']),
  isActive: z.boolean()
});

const categoryOptions = [
  { value: 'welcome', label: 'Welcome' },
  { value: 'membership', label: 'Membership' },
  { value: 'payment', label: 'Payment' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'notification', label: 'Notification' },
  { value: 'custom', label: 'Custom' }
];

const commonVariables = [
  '{{memberName}}',
  '{{memberEmail}}',
  '{{gymName}}',
  '{{gymAddress}}',
  '{{gymPhone}}',
  '{{membershipType}}',
  '{{expiryDate}}',
  '{{amount}}',
  '{{date}}',
  '{{time}}'
];

interface EmailTemplateEditorProps {
  template?: EmailTemplate;
  onSave: (template: Partial<EmailTemplate>) => void;
  onPreview: (template: Partial<EmailTemplate>) => void;
  onTest: (template: Partial<EmailTemplate>, testEmail: string) => Promise<void>;
}

export const EmailTemplateEditor = ({ template, onSave, onPreview, onTest }: EmailTemplateEditorProps) => {
  const [activeTab, setActiveTab] = useState('edit');
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template?.name || '',
      subject: template?.subject || '',
      htmlContent: template?.htmlContent || '',
      textContent: template?.textContent || '',
      category: template?.category || 'custom',
      isActive: template?.isActive ?? true
    }
  });

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/{{\s*\w+\s*}}/g);
    return matches ? Array.from(new Set(matches)) : [];
  };

  const htmlContent = form.watch('htmlContent');
  const subject = form.watch('subject');
  const detectedVariables = [
    ...extractVariables(htmlContent),
    ...extractVariables(subject)
  ];

  const insertVariable = (variable: string) => {
    const currentContent = form.getValues('htmlContent');
    form.setValue('htmlContent', currentContent + variable);
  };

  const handleTest = async () => {
    if (!testEmail) {
      toast({
        title: 'Test Email Required',
        description: 'Please enter an email address to send the test',
        variant: 'destructive'
      });
      return;
    }

    const isValid = await form.trigger();
    if (!isValid) return;

    setIsTesting(true);
    try {
      const values = form.getValues();
      await onTest(values, testEmail);
      toast({
        title: 'Test Email Sent',
        description: `Test email sent successfully to ${testEmail}`
      });
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Failed to send test email',
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = (values: any) => {
    const templateData = {
      ...values,
      variables: detectedVariables
    };
    onSave(templateData);
    toast({
      title: 'Template Saved',
      description: 'Email template has been saved successfully'
    });
  };

  const handlePreview = () => {
    const values = form.getValues();
    onPreview({ ...values, variables: detectedVariables });
    setActiveTab('preview');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {template ? 'Edit Email Template' : 'Create Email Template'}
        </CardTitle>
        <CardDescription>
          Design and customize email templates with dynamic variables
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="variables">Variables</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Welcome Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoryOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Welcome to {{gymName}}, {{memberName}}!" {...field} />
                      </FormControl>
                       <FormDescription>
                        Use variables like {'{'}{'{'}{'}'}memberName{'{'}{'}'}{'}'}  for dynamic content
                       </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="htmlContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTML Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="<h1>Welcome {{memberName}}!</h1><p>Thank you for joining {{gymName}}...</p>"
                          className="min-h-[300px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Write HTML content with variables for personalization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="textContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Content (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Welcome {{memberName}}! Thank you for joining {{gymName}}..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Plain text version for email clients that don't support HTML
                      </FormDescription>
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
                        <FormLabel>Active Template</FormLabel>
                        <p className="text-sm text-muted-foreground">Enable this template for use</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {detectedVariables.length > 0 && (
                  <div>
                    <Label>Detected Variables</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {detectedVariables.map(variable => (
                        <Badge key={variable} variant="secondary">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit">Save Template</Button>
                  <Button type="button" variant="outline" onClick={handlePreview}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="mb-4">
                <Label className="text-sm font-medium">Subject:</Label>
                <p className="text-sm mt-1">{subject || 'No subject'}</p>
              </div>
              <div className="border rounded bg-white p-4">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: htmlContent || '<p>No content</p>' 
                  }}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="test-email">Test Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <Button
                onClick={handleTest}
                disabled={isTesting}
                className="mt-6"
              >
                <Send className="w-4 h-4 mr-2" />
                {isTesting ? 'Sending...' : 'Send Test'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="variables" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">Available Variables</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click on any variable to insert it into your template content
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {commonVariables.map(variable => (
                  <Button
                    key={variable}
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(variable)}
                    className="justify-start font-mono text-xs"
                  >
                    <Code className="w-3 h-3 mr-2" />
                    {variable}
                  </Button>
                ))}
              </div>
            </div>

            {detectedVariables.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Used in Template</h3>
                <div className="flex flex-wrap gap-2">
                  {detectedVariables.map(variable => (
                    <Badge key={variable} variant="default">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
