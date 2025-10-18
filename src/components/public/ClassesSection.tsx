
import { Clock, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const ClassesSection = () => {
  const classes = [
    {
      name: 'HIIT Training',
      description: 'High-intensity interval training for maximum calorie burn and cardiovascular fitness.',
      duration: '45 min',
      capacity: '12 people',
      intensity: 'High',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      tags: ['Cardio', 'Strength', 'Fat Loss']
    },
    {
      name: 'Yoga Flow',
      description: 'Dynamic yoga sequences to improve flexibility, balance, and mindfulness.',
      duration: '60 min',
      capacity: '15 people',
      intensity: 'Low',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
      tags: ['Flexibility', 'Mindfulness', 'Recovery']
    },
    {
      name: 'Strength Training',
      description: 'Build muscle and increase strength with progressive resistance training.',
      duration: '50 min',
      capacity: '10 people',
      intensity: 'Medium',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
      tags: ['Strength', 'Muscle Building', 'Power']
    },
    {
      name: 'Cardio Blast',
      description: 'Heart-pumping cardio workout to boost endurance and burn calories.',
      duration: '40 min',
      capacity: '20 people',
      intensity: 'High',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      tags: ['Cardio', 'Endurance', 'Energy']
    },
    {
      name: 'Pilates Core',
      description: 'Focus on core strength, stability, and posture improvement.',
      duration: '45 min',
      capacity: '12 people',
      intensity: 'Medium',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop',
      tags: ['Core', 'Stability', 'Posture']
    },
    {
      name: 'Spin Class',
      description: 'High-energy indoor cycling class with motivating music and coaching.',
      duration: '45 min',
      capacity: '25 people',
      intensity: 'High',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      tags: ['Cycling', 'Cardio', 'Endurance']
    }
  ];

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <section id="classes" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Fitness Classes for Every Goal
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From high-intensity training to mindful yoga, find the perfect class 
            to match your fitness level and goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classes.map((classItem, index) => (
            <Card key={index} className="overflow-hidden hover-scale transition-all duration-300 border-0 shadow-medium hover:shadow-strong">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={classItem.image} 
                  alt={classItem.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-foreground">{classItem.name}</CardTitle>
                  <Badge variant={getIntensityColor(classItem.intensity)}>
                    {classItem.intensity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{classItem.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {classItem.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {classItem.capacity}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {classItem.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
