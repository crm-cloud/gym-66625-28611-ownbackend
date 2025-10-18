
import { MapPin, Clock, Phone, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBranches } from '@/hooks/useBranches';

export const LocationsSection = () => {
  const { branches } = useBranches();

  const formatHours = (hours: any) => {
    if (!hours || typeof hours !== 'object') return 'Closed';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayKey = Object.keys(hours).find(key => 
      key.toLowerCase() === today
    ) || 'monday';
    
    const todayHours = hours[todayKey];
    return todayHours ? `${todayHours.open ?? ''} ${todayHours.open && todayHours.close ? '-' : ''} ${todayHours.close ?? ''}`.trim() || 'Closed' : 'Closed';
  };

  return (
    <section id="locations" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Convenient Locations
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find the GymFit Pro location nearest to you. All our facilities offer 
            the same high-quality equipment and expert training.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {branches.map((branch, index) => (
            <Card key={branch.id} className="hover-scale transition-all duration-300 border-0 shadow-medium hover:shadow-strong">
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img 
                  src={(branch?.images && Array.isArray(branch.images) && branch.images[0]) ? branch.images[0] : 'https://picsum.photos/800/450'} 
                  alt={branch.name || 'Branch image'}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-2xl text-foreground">{branch.name || 'Unnamed Branch'}</CardTitle>
                  <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>
                    {branch.status || 'inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      {branch.address?.street || 'Address not available'}
                    </p>
                    <p className="text-muted-foreground">
                      {[branch.address?.city, branch.address?.state, branch.address?.zipCode].filter(Boolean).join(', ') || ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <p className="text-muted-foreground">{branch.contact?.phone || 'N/A'}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Today: {formatHours(branch.hours)}</p>
                    <p className="text-sm text-muted-foreground">24/7 access for members</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Car className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Amenities</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(branch.amenities || []).slice(0, 3).map((amenity, amenityIndex) => (
                        <Badge key={amenityIndex} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {(branch.amenities?.length || 0) > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(branch.amenities?.length || 0) - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-primary/10 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">Capacity:</span>
                    <span className="text-sm text-primary font-semibold">
                      {(branch.currentMembers ?? 0)}/{(branch.capacity ?? 0)} members
                    </span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(() => {
                        const members = Number(branch.currentMembers ?? 0);
                        const capacity = Number(branch.capacity ?? 0);
                        if (!capacity || capacity <= 0) return 0;
                        const pct = (members / capacity) * 100;
                        return Math.max(0, Math.min(100, pct));
                      })()}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <div className="bg-gradient-primary rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">More Locations Coming Soon!</h3>
            <p className="text-xl text-white/90 mb-6">
              We're expanding across California to bring premium fitness closer to you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-lg font-semibold">San Francisco</div>
                <div className="text-white/80 text-sm">Opening Q2 2024</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">San Diego</div>
                <div className="text-white/80 text-sm">Opening Q3 2024</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">Sacramento</div>
                <div className="text-white/80 text-sm">Opening Q4 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
