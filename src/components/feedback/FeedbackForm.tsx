
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, Send, FileText, Tag, Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { FeedbackType, FeedbackRating } from '@/types/feedback';

const feedbackSchema = z.object({
  type: z.enum(['facility', 'trainer', 'class', 'equipment', 'service', 'general']),
  category: z.string().min(1, 'Category is required'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  rating: z.number().min(1).max(5),
  relatedEntityName: z.string().optional(),
  isAnonymous: z.boolean().default(false)
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  onSubmit: (data: FeedbackFormData) => void;
  onCancel?: () => void;
}

const feedbackCategories = {
  facility: ['Cleanliness', 'Temperature', 'Lighting', 'Noise', 'Accessibility', 'Safety'],
  trainer: ['Service Quality', 'Professionalism', 'Knowledge', 'Communication', 'Punctuality'],
  class: ['Scheduling', 'Difficulty Level', 'Instruction Quality', 'Music', 'Equipment'],
  equipment: ['Maintenance', 'Availability', 'Cleanliness', 'Safety', 'Functionality'],
  service: ['Staff', 'Front Desk', 'Billing', 'Communication', 'Response Time'],
  general: ['Overall Experience', 'Suggestions', 'Complaints', 'Compliments', 'Other']
};

export const FeedbackForm = ({ onSubmit, onCancel }: FeedbackFormProps) => {
  const [selectedRating, setSelectedRating] = useState<FeedbackRating | null>(null);
  const { toast } = useToast();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      isAnonymous: false
    }
  });

  const selectedType = form.watch('type') as FeedbackType;
  const availableCategories = selectedType ? feedbackCategories[selectedType] : [];

  const handleSubmit = (data: FeedbackFormData) => {
    if (!selectedRating) {
      toast({
        title: 'Rating Required',
        description: 'Please provide a rating for your feedback.',
        variant: 'destructive'
      });
      return;
    }

    onSubmit({
      ...data,
      rating: selectedRating
    });

    toast({
      title: 'Feedback Submitted',
      description: 'Thank you for your feedback! We\'ll review it and get back to you soon.'
    });

    form.reset();
    setSelectedRating(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Share Your Feedback
        </CardTitle>
        <CardDescription>
          Help us improve your gym experience by sharing your thoughts and suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="facility">Facility</SelectItem>
                        <SelectItem value="trainer">Trainer</SelectItem>
                        <SelectItem value="class">Class</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!selectedType}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief summary of your feedback" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please provide detailed feedback..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Rating</FormLabel>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer transition-colors ${
                      selectedRating && star <= selectedRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground hover:text-yellow-400'
                    }`}
                    onClick={() => setSelectedRating(star as FeedbackRating)}
                  />
                ))}
                {selectedRating && (
                  <Badge variant="outline" className="ml-2">
                    {selectedRating} star{selectedRating !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="relatedEntityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related To (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Trainer name, Class name, Equipment number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAnonymous"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Submit anonymously</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Your name won't be visible to staff, but we may still contact you for follow-up.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Submit Feedback
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
