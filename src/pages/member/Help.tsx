
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  Phone, 
  Mail,
  Clock,
  MapPin,
  Book,
  Video,
  FileText
} from 'lucide-react';

export default function Help() {
  const faqs = [
    {
      id: '1',
      question: 'How do I book a class?',
      answer: 'You can book classes through the Classes section in your dashboard. Simply browse available classes, select your preferred time slot, and click "Book Now". You\'ll receive a confirmation email with all the details.'
    },
    {
      id: '2',
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel your booking up to 2 hours before the class starts. Go to your booked classes and click "Cancel Booking". Please note that late cancellations may incur a fee.'
    },
    {
      id: '3',
      question: 'How do I track my progress?',
      answer: 'Your progress is automatically tracked through your workouts and visits. You can view detailed progress reports in the Goals & Progress section, including weight changes, workout frequency, and achievement milestones.'
    },
    {
      id: '4',
      question: 'What should I bring to the gym?',
      answer: 'Bring a water bottle, towel, and appropriate workout clothing and shoes. We provide all necessary equipment. First-time visitors should bring a valid ID for registration.'
    },
    {
      id: '5',
      question: 'How do I update my membership plan?',
      answer: 'Contact our front desk or use the Billing section in your dashboard to view and update your membership plan. Our staff can help you choose the best plan for your needs.'
    },
    {
      id: '6',
      question: 'Are personal trainers available?',
      answer: 'Yes, we have certified personal trainers available. You can book sessions through the app or speak with our front desk to match you with a trainer based on your goals and schedule.'
    }
  ];

  const resources = [
    {
      title: 'Workout Guides',
      description: 'Step-by-step exercise instructions and workout routines',
      icon: Book,
      type: 'guide'
    },
    {
      title: 'Video Tutorials',
      description: 'Visual demonstrations of proper exercise form',
      icon: Video,
      type: 'video'
    },
    {
      title: 'Nutrition Tips',
      description: 'Healthy eating guidelines and meal planning',
      icon: FileText,
      type: 'article'
    },
    {
      title: 'Safety Guidelines',
      description: 'Important safety rules and equipment usage',
      icon: HelpCircle,
      type: 'guide'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground">Find answers to common questions and get the help you need</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for help topics..."
          className="pl-10 h-12 text-base"
        />
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="hours">Hours & Location</TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat Support
                </CardTitle>
                <CardDescription>Get instant help from our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Our chat support is available during gym hours to help with immediate questions and concerns.
                </p>
                <Button className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Phone Support
                </CardTitle>
                <CardDescription>Speak directly with our team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-medium">Downtown Branch</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Available Monday-Friday: 6AM-10PM<br />
                  Saturday-Sunday: 7AM-9PM
                </p>
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Support
                </CardTitle>
                <CardDescription>Send us a detailed message</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    For non-urgent inquiries, feedback, or detailed questions.
                  </p>
                  <p className="font-medium">support@gymfit.com</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  We typically respond within 24 hours
                </p>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submit a Ticket</CardTitle>
                <CardDescription>Report an issue or make a request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  For technical issues, billing questions, or special requests that need detailed tracking.
                </p>
                <Button variant="outline" className="w-full">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Create Ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" />
                      {resource.title}
                    </CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      View {resource.type === 'video' ? 'Videos' : resource.type === 'guide' ? 'Guides' : 'Articles'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
              <CardDescription>New to our gym? Get started with these essential steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  'Complete your profile and health questionnaire',
                  'Schedule a complimentary fitness assessment',
                  'Take a facility tour with our staff',
                  'Book your first group class or personal training session',
                  'Download our mobile app for easy booking and tracking'
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Operating Hours
                </CardTitle>
                <CardDescription>When we're open to serve you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Monday - Friday</span>
                    <span>5:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Saturday</span>
                    <span>6:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sunday</span>
                    <span>7:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Holidays</span>
                    <span>Limited hours - check app</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location & Directions
                </CardTitle>
                <CardDescription>Find us and get directions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-medium">Downtown Branch</p>
                  <p className="text-sm text-muted-foreground">
                    123 Main Street<br />
                    Downtown, NY 10001
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Parking:</strong> Free parking available</p>
                  <p className="text-sm"><strong>Public Transit:</strong> Bus routes 15, 23, 45</p>
                  <p className="text-sm"><strong>Nearby:</strong> Next to Central Coffee & City Bank</p>
                </div>
                <Button variant="outline" className="w-full">
                  <MapPin className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
