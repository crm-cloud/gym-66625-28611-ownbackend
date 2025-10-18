import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Eye, Code, Send, Plus, X } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const whatsappTemplateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.enum(['membership', 'classes', 'payments', 'appointments', 'promotions', 'reminders', 'alerts', 'welcome', 'system']),
  event: z.string().min(1, 'Please select an event'),
  template_type: z.enum(['text', 'media', 'interactive']),
  header_text: z.string().optional(),
  body_text: z.string().min(1, 'Body text is required'),
  footer_text: z.string().optional(),
  is_active: z.boolean(),
  language: z.string()
});

type WhatsAppTemplateData = z.infer<typeof whatsappTemplateSchema>;

interface WhatsAppTemplate {
  id?: string;
  name: string;
  category: string;
  event: string;
  template_type: string;
  header_text?: string;
  body_text: string;
  footer_text?: string;
  buttons: any[];
  variables: string[];
  is_active: boolean;
  language: string;
  whatsapp_template_id?: string;
  status: string;
}

interface WhatsAppTemplateEditorProps {
  template?: WhatsAppTemplate;
  onSave: (template: WhatsAppTemplate) => void;
  onCancel: () => void;
}

const templateCategories = [
  { value: 'membership', label: 'Membership' },
  { value: 'classes', label: 'Classes' },
  { value: 'payments', label: 'Payments' },
  { value: 'appointments', label: 'Appointments' },
  { value: 'promotions', label: 'Promotions' },
  { value: 'reminders', label: 'Reminders' },
  { value: 'alerts', label: 'Alerts' },
  { value: 'welcome', label: 'Welcome' },
  { value: 'system', label: 'System' }
];

const eventTypes = [
  { value: 'member_welcome', label: 'Member Welcome', category: 'welcome' },
  { value: 'membership_renewal', label: 'Membership Renewal', category: 'membership' },
  { value: 'class_booking_confirmed', label: 'Class Booking Confirmed', category: 'classes' },
  { value: 'payment_received', label: 'Payment Received', category: 'payments' },
  { value: 'appointment_reminder', label: 'Appointment Reminder', category: 'reminders' },
  { value: 'special_offer', label: 'Special Offer', category: 'promotions' }
];

const availableVariables = [
  { name: 'member_name', description: 'Member\'s full name' },
  { name: 'branch_name', description: 'Branch name' },
  { name: 'class_name', description: 'Class name' },
  { name: 'payment_amount', description: 'Payment amount' },
  { name: 'company_name', description: 'Company name' }
];

export function WhatsAppTemplateEditor({ template, onSave, onCancel }: WhatsAppTemplateEditorProps) {
  const [previewMode, setPreviewMode] = useState(false);
  const [buttons, setButtons] = useState<Array<{ type: string; text: string; url?: string }>>(
    template?.buttons || []
  );

  const form = useForm<WhatsAppTemplateData>({
    resolver: zodResolver(whatsappTemplateSchema),
    defaultValues: {
      name: template?.name || '',
      category: (template?.category as any) || 'membership',
      event: template?.event || '',
      template_type: (template?.template_type as any) || 'text',
      header_text: template?.header_text || '',
      body_text: template?.body_text || '',
      footer_text: template?.footer_text || '',
      is_active: template?.is_active ?? true,
      language: template?.language || 'en'
    }
  });

  const insertVariable = (variable: string) => {
    const currentValue = form.getValues('body_text');
    form.setValue('body_text', currentValue + `{{${variable}}}`);
  };

  const addButton = () => {
    if (buttons.length < 3) {
      setButtons([...buttons, { type: 'url', text: '', url: '' }]);
    }
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const updateButton = (index: number, field: string, value: string) => {
    const updatedButtons = [...buttons];
    updatedButtons[index] = { ...updatedButtons[index], [field]: value };
    setButtons(updatedButtons);
  };

  const getPreviewText = () => {
    const formData = form.getValues();
    let preview = formData.body_text;
    availableVariables.forEach(variable => {
      const placeholder = `{{${variable.name}}}`;
      preview = preview.replace(new RegExp(placeholder, 'g'), `[${variable.name}]`);
    });
    return preview;
  };

  const onSubmit = (data: WhatsAppTemplateData) => {
    // Extract variables from body text
    const variableMatches = data.body_text.match(/\{\{([^}]+)\}\}/g);
    const extractedVariables = variableMatches 
      ? variableMatches.map(match => match.replace(/[{}]/g, ''))
      : [];

    onSave({
      ...template,
      ...data,
      buttons,
      variables: extractedVariables,
      status: template?.status || 'draft'
    } as WhatsAppTemplate);
  };

  const filteredEventTypes = eventTypes.filter(event => 
    event.category === form.watch('category')
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {template ? 'Edit WhatsApp Template' : 'Create WhatsApp Template'}
        </CardTitle>
        <CardDescription>
          Create and customize WhatsApp business templates for automated messaging
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter template name" {...field} />
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
                        {templateCategories.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="event"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredEventTypes.map(event => (
                          <SelectItem key={event.value} value={event.value}>
                            {event.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="template_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="text">Text Only</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="interactive">Interactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="header_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Header Text (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter header text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center justify-between">
                      <span>Message Body</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        {previewMode ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {previewMode ? 'Edit' : 'Preview'}
                      </Button>
                    </div>
                  </FormLabel>
                  <FormControl>
                    {previewMode ? (
                      <div className="min-h-32 p-3 border rounded-md bg-muted">
                        <p className="text-sm whitespace-pre-wrap">{getPreviewText()}</p>
                      </div>
                    ) : (
                      <Textarea
                        placeholder="Enter your WhatsApp message here..."
                        className="min-h-32"
                        {...field}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Available Variables</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableVariables.map(variable => (
                  <Button
                    key={variable.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(variable.name)}
                    className="justify-start text-xs"
                  >
                    {variable.name}
                  </Button>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="footer_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Footer Text (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter footer text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('template_type') === 'interactive' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Buttons (Max 3)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addButton}
                    disabled={buttons.length >= 3}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Button
                  </Button>
                </div>
                {buttons.map((button, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Button text"
                      value={button.text}
                      onChange={(e) => updateButton(index, 'text', e.target.value)}
                    />
                    <Input
                      placeholder="URL (optional)"
                      value={button.url || ''}
                      onChange={(e) => updateButton(index, 'url', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeButton(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div>
                      <FormLabel>Active</FormLabel>
                      <p className="text-sm text-muted-foreground">Enable this template</p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="button" variant="outline">
                <Send className="w-4 h-4 mr-2" />
                Send Test
              </Button>
              <Button type="submit">
                {template ? 'Update' : 'Create'} Template
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}