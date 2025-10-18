
import { Target, Users, Trophy, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const AboutSection = () => {
  const features = [
    {
      icon: Target,
      title: 'Goal-Oriented Training',
      description: 'Personalized fitness plans designed to help you achieve your specific health and fitness goals.'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Join a vibrant community of fitness enthusiasts who motivate and support each other.'
    },
    {
      icon: Trophy,
      title: 'Proven Results',
      description: 'Track record of helping thousands achieve their fitness transformations with measurable results.'
    },
    {
      icon: Heart,
      title: 'Holistic Wellness',
      description: 'Focus on overall wellness including physical fitness, mental health, and nutritional guidance.'
    }
  ];

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Why Choose GymFit Pro?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're more than just a gym. We're your partners in building a healthier, stronger, 
            and more confident version of yourself.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover-scale border-0 shadow-medium hover:shadow-strong transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-gradient-primary rounded-2xl p-8 md:p-12 text-white text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Fitness Journey?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of members who have already transformed their lives with our proven methods and supportive community.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold">10,000+</div>
              <div className="text-white/80">Workouts Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">95%</div>
              <div className="text-white/80">Member Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-white/80">Access Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
