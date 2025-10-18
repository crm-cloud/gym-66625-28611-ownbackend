import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, MessageSquare, MessageCircle, Eye, Plus } from 'lucide-react';
import { getAllPredefinedTemplates, PredefinedTemplate } from '@/data/predefinedTemplates';
import { useToast } from '@/hooks/use-toast';

export function PredefinedTemplatesSection() {
  const [previewTemplate, setPreviewTemplate] = useState<PredefinedTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const templates = getAllPredefinedTemplates();

  const handleUseTemplate = (template: PredefinedTemplate, type: 'email' | 'sms' | 'whatsapp') => {
    // In a real app, this would open the editor with the template pre-filled
    toast({
      title: 'Template Selected',
      description: `${template.name} has been loaded in the ${type} editor. You can now customize it further.`,
    });
  };

  const handlePreview = (template: PredefinedTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const TemplateCard = ({ template, type }: { template: PredefinedTemplate; type: 'email' | 'sms' | 'whatsapp' }) => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {template.category}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">
            Variables: {template.variables.slice(0, 3).map(v => `{{${v}}}`).join(', ')}
            {template.variables.length > 3 && ` +${template.variables.length - 3} more`}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => handlePreview(template)}
            >
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => handleUseTemplate(template, type)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Use Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            SMS Templates  
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            WhatsApp Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.email.map((template) => (
              <TemplateCard key={template.id} template={template} type="email" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sms" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.sms.map((template) => (
              <TemplateCard key={template.id} template={template} type="sms" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.whatsapp.map((template) => (
              <TemplateCard key={template.id} template={template} type="whatsapp" />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Template Preview: {previewTemplate?.name}
              <Badge variant="outline">{previewTemplate?.category}</Badge>
            </DialogTitle>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                <p className="text-sm">{previewTemplate.description}</p>
              </div>

              {previewTemplate.subject && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Subject</h4>
                  <div className="p-3 bg-muted rounded-md text-sm font-medium">
                    {previewTemplate.subject}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Content</h4>
                <div className="p-4 bg-muted rounded-md">
                  {previewTemplate.content.includes('<') ? (
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: previewTemplate.content }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm">{previewTemplate.content}</pre>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Available Variables</h4>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.variables.map((variable) => (
                    <Badge key={variable} variant="secondary" className="text-xs">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}