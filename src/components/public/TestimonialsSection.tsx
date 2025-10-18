
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Jessica Martinez',
      role: 'Marketing Executive',
      content: 'GymFit Pro completely transformed my relationship with fitness. The trainers are incredible, and the community support kept me motivated throughout my journey.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612c2be?w=100&h=100&fit=crop&crop=face',
      achievement: 'Lost 30 lbs in 4 months'
    },
    {
      name: 'Robert Chen',
      role: 'Software Engineer',
      content: 'The flexibility of having multiple locations and 24/7 access fits perfectly with my busy schedule. Best investment I\'ve made for my health.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      achievement: 'Gained 15 lbs muscle'
    },
    {
      name: 'Amanda Thompson',
      role: 'Teacher',
      content: 'I was intimidated by gyms before, but GymFit Pro made me feel welcome from day one. The yoga classes are amazing and the staff is so supportive.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      achievement: 'Improved flexibility 200%'
    },
    {
      name: 'Marcus Johnson',
      role: 'Business Owner',
      content: 'The personal training program helped me reach goals I never thought possible. My trainer customized everything to my needs and pushed me to excel.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      achievement: 'Marathon finisher'
    },
    {
      name: 'Lisa Rodriguez',
      role: 'Nurse',
      content: 'After my injury, I needed specialized care. The trainers worked with my physical therapist to create a safe, effective recovery program.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612c2be?w=100&h=100&fit=crop&crop=face',
      achievement: 'Full recovery achieved'
    },
    {
      name: 'David Park',
      role: 'Accountant',
      content: 'The nutrition coaching combined with the workout plans gave me the complete lifestyle change I needed. Couldn\'t be happier with the results.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      achievement: 'Lowered cholesterol 40%'
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Real Stories, Real Results
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hear from our members who have transformed their lives through dedication, 
            expert guidance, and our supportive community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover-scale transition-all duration-300 border-0 shadow-medium hover:shadow-strong">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                      ))}
                    </div>
                  </div>
                  <Quote className="w-6 h-6 text-primary/20" />
                </div>

                <p className="text-muted-foreground mb-4 italic">
                  "{testimonial.content}"
                </p>

                <div className="bg-gradient-primary/10 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-primary">
                    🎉 {testimonial.achievement}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-primary rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Join Over 5,000 Success Stories</h3>
            <p className="text-xl text-white/90 mb-6">
              Your transformation story starts here. Take the first step today.
            </p>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold">4.9★</div>
                <div className="text-white/80 text-sm">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">95%</div>
                <div className="text-white/80 text-sm">Achieve Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">3 Mo.</div>
                <div className="text-white/80 text-sm">Avg. Results</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
