
import { Star, Award, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const TrainersSection = () => {
  const trainers = [
    {
      name: 'Sarah Johnson',
      title: 'Head Personal Trainer',
      experience: '8+ years',
      specialties: ['Strength Training', 'Weight Loss', 'Nutrition'],
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612c2be?w=300&h=400&fit=crop&crop=face',
      certifications: ['NASM-CPT', 'Precision Nutrition']
    },
    {
      name: 'Mike Rodriguez',
      title: 'HIIT & Cardio Specialist',
      experience: '6+ years',
      specialties: ['HIIT Training', 'Cardio', 'Athletic Performance'],
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face',
      certifications: ['ACSM-CPT', 'TRX Certified']
    },
    {
      name: 'Emily Chen',
      title: 'Yoga & Wellness Coach',
      experience: '5+ years',
      specialties: ['Yoga', 'Meditation', 'Flexibility'],
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face',
      certifications: ['RYT-500', 'Meditation Teacher']
    },
    {
      name: 'David Kim',
      title: 'Strength & Conditioning',
      experience: '7+ years',
      specialties: ['Powerlifting', 'Bodybuilding', 'Sports Performance'],
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&crop=face',
      certifications: ['CSCS', 'USAPL Coach']
    }
  ];

  return (
    <section id="trainers" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Meet Our Expert Trainers
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our certified trainers are passionate about helping you achieve your fitness goals 
            with personalized guidance and proven expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trainers.map((trainer, index) => (
            <Card key={index} className="overflow-hidden hover-scale transition-all duration-300 border-0 shadow-medium hover:shadow-strong">
              <div className="aspect-[3/4] overflow-hidden">
                <img 
                  src={trainer.image} 
                  alt={trainer.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{trainer.name}</h3>
                  <p className="text-primary font-medium">{trainer.title}</p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{trainer.experience}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="font-medium text-foreground">{trainer.rating}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-foreground text-sm">Specialties:</h4>
                  <div className="flex flex-wrap gap-1">
                    {trainer.specialties.map((specialty, specialtyIndex) => (
                      <Badge key={specialtyIndex} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-foreground text-sm flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Certifications:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {trainer.certifications.map((cert, certIndex) => (
                      <Badge key={certIndex} variant="outline" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
