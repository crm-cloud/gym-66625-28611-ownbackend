
import { useState } from 'react';
import { Send, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const programOptions = [
  'Personal Training',
  'Group Classes',
  'Weight Loss Program',
  'Strength Training',
  'Yoga Classes',
  'Cardio Training',
  'Nutrition Coaching',
  'Senior Fitness'
];

export const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    interestedPrograms: [] as string[],
    referredBy: '',
    preferredContactTime: '',
    fitnessGoals: '',
    hasGymExperience: false,
    agreeToContact: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToContact) {
      toast({
        title: 'Agreement Required',
        description: 'Please agree to be contacted by our team.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call to create lead
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create lead object (in real app, this would be sent to API)
    const leadData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      interestedPrograms: formData.interestedPrograms,
      source: 'website',
      priority: formData.interestedPrograms.includes('Personal Training') ? 'high' : 'medium',
      referredBy: formData.referredBy || undefined,
      fitnessGoals: formData.fitnessGoals,
      hasGymExperience: formData.hasGymExperience,
      preferredContactTime: formData.preferredContactTime
    };

    console.log('Lead captured:', leadData);

    toast({
      title: 'Thank You!',
      description: 'We\'ve received your information and will contact you within 24 hours to discuss your fitness goals.',
    });

    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      message: '',
      interestedPrograms: [],
      referredBy: '',
      preferredContactTime: '',
      fitnessGoals: '',
      hasGymExperience: false,
      agreeToContact: false
    });
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProgramChange = (program: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        interestedPrograms: [...formData.interestedPrograms, program]
      });
    } else {
      setFormData({
        ...formData,
        interestedPrograms: formData.interestedPrograms.filter(p => p !== program)
      });
    }
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Start Your Fitness Journey Today
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to transform your life? Fill out the form below and our team will contact you 
            to discuss your fitness goals and find the perfect program for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Enhanced Contact Form */}
          <Card className="border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Get Started Today</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tell us about your fitness goals and we'll create a personalized plan for you.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-foreground mb-2">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-foreground mb-2">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-foreground mb-2">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-3 block">
                    What programs interest you? (Select all that apply)
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {programOptions.map((program) => (
                      <div key={program} className="flex items-center space-x-2">
                        <Checkbox
                          id={program}
                          checked={formData.interestedPrograms.includes(program)}
                          onCheckedChange={(checked) => handleProgramChange(program, checked as boolean)}
                        />
                        <Label htmlFor={program} className="text-sm text-foreground">
                          {program}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="fitnessGoals" className="text-sm font-medium text-foreground mb-2">
                    What are your fitness goals?
                  </Label>
                  <Textarea
                    id="fitnessGoals"
                    name="fitnessGoals"
                    value={formData.fitnessGoals}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="e.g., Lose weight, build muscle, improve endurance, train for an event..."
                  />
                </div>

                <div>
                  <Label htmlFor="referredBy" className="text-sm font-medium text-foreground mb-2">
                    Referred by (if applicable)
                  </Label>
                  <Input
                    id="referredBy"
                    name="referredBy"
                    type="text"
                    value={formData.referredBy}
                    onChange={handleInputChange}
                    placeholder="Name of the member who referred you"
                  />
                </div>

                <div>
                  <Label htmlFor="preferredContactTime" className="text-sm font-medium text-foreground mb-2">
                    Best time to contact you
                  </Label>
                  <Input
                    id="preferredContactTime"
                    name="preferredContactTime"
                    type="text"
                    value={formData.preferredContactTime}
                    onChange={handleInputChange}
                    placeholder="e.g., Weekday mornings, evenings after 6pm"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-foreground mb-2">
                    Additional Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any questions or additional information you'd like to share..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasGymExperience"
                    checked={formData.hasGymExperience}
                    onCheckedChange={(checked) => setFormData({...formData, hasGymExperience: checked as boolean})}
                  />
                  <Label htmlFor="hasGymExperience" className="text-sm text-foreground">
                    I have previous gym experience
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToContact"
                    checked={formData.agreeToContact}
                    onCheckedChange={(checked) => setFormData({...formData, agreeToContact: checked as boolean})}
                    required
                  />
                  <Label htmlFor="agreeToContact" className="text-sm text-foreground">
                    I agree to be contacted by GymFit Pro regarding my fitness goals *
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full gap-2" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Get My Personalized Plan'}
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="border-0 shadow-medium">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Call Us</h3>
                    <p className="text-muted-foreground">Speak with our team</p>
                  </div>
                </div>
                <p className="text-lg font-medium text-foreground">+1 (555) 123-4567</p>
                <p className="text-sm text-muted-foreground">Mon-Fri: 6 AM - 10 PM | Sat-Sun: 7 AM - 9 PM</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-medium">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email Us</h3>
                    <p className="text-muted-foreground">Send us a message</p>
                  </div>
                </div>
                <p className="text-lg font-medium text-foreground">info@gymfitpro.com</p>
                <p className="text-sm text-muted-foreground">We respond within 24 hours</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-medium">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Visit Us</h3>
                    <p className="text-muted-foreground">Come see our facilities</p>
                  </div>
                </div>
                <p className="text-lg font-medium text-foreground">Multiple Locations</p>
                <p className="text-sm text-muted-foreground">Downtown & Westside California</p>
              </CardContent>
            </Card>

            <div className="bg-gradient-primary rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-3">🎉 Special Offer</h3>
              <p className="mb-4">
                New members get their first month FREE when they sign up for a 12-month membership!
              </p>
              <p className="text-sm text-white/80">
                Limited time offer. Contact us for details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
