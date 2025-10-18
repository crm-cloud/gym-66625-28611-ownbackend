
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, Users, DollarSign, Calendar, Award } from 'lucide-react';
import { TrainerProfile, TrainerSpecialty } from '@/types/trainer';

interface TrainerCardProps {
  trainer: TrainerProfile;
  showBookButton?: boolean;
  showDetails?: boolean;
  onBook?: (trainerId: string) => void;
  onViewProfile?: (trainerId: string) => void;
}

const specialtyLabels: Record<TrainerSpecialty, string> = {
  strength_training: 'Strength Training',
  cardio: 'Cardio',
  yoga: 'Yoga',
  pilates: 'Pilates',
  crossfit: 'CrossFit',
  martial_arts: 'Martial Arts',
  dance: 'Dance',
  swimming: 'Swimming',
  rehabilitation: 'Rehabilitation',
  nutrition: 'Nutrition',
  weight_loss: 'Weight Loss',
  bodybuilding: 'Bodybuilding',
  sports_performance: 'Sports Performance',
  senior_fitness: 'Senior Fitness',
  youth_fitness: 'Youth Fitness'
};

export const TrainerCard = ({
  trainer,
  showBookButton = true,
  showDetails = true,
  onBook,
  onViewProfile
}: TrainerCardProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'on_leave': return 'bg-gray-100 text-gray-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={trainer.avatar} alt={trainer.fullName} />
            <AvatarFallback>{getInitials(trainer.fullName)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg truncate">{trainer.fullName}</h3>
              <Badge className={getStatusColor(trainer.status)}>
                {trainer.status.replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{trainer.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-sm">{trainer.totalClients} clients</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{trainer.experience}y exp</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Specialties */}
        <div>
          <h4 className="text-sm font-medium mb-2">Specialties</h4>
          <div className="flex flex-wrap gap-1">
            {trainer.specialties.slice(0, 3).map((specialty) => (
              <Badge key={specialty} variant="secondary" className="text-xs">
                {specialtyLabels[specialty]}
              </Badge>
            ))}
            {trainer.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{trainer.specialties.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Bio */}
        {showDetails && (
          <div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {trainer.bio}
            </p>
          </div>
        )}

        {/* Certifications */}
        {showDetails && trainer.certifications.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Award className="w-4 h-4" />
              Certifications
            </h4>
            <div className="space-y-1">
              {trainer.certifications.slice(0, 2).map((cert) => (
                <div key={cert.id} className="text-xs text-muted-foreground">
                  {cert.name} - {cert.issuingOrganization}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">${trainer.hourlyRate}/hr</span>
          </div>
          
          {trainer.packageRates.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Packages from ${trainer.packageRates[0].price}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {showBookButton && (
            <Button 
              className="flex-1"
              onClick={() => onBook?.(trainer.id)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Session
            </Button>
          )}
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewProfile?.(trainer.id)}
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
