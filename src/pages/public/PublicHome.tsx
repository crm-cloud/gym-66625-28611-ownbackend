
import { PublicLayout } from '@/layouts/PublicLayout';
import { HeroSection } from '@/components/public/HeroSection';
import { AboutSection } from '@/components/public/AboutSection';
import { ClassesSection } from '@/components/public/ClassesSection';
import { TrainersSection } from '@/components/public/TrainersSection';
import { TestimonialsSection } from '@/components/public/TestimonialsSection';
import { LocationsSection } from '@/components/public/LocationsSection';
import { ContactSection } from '@/components/public/ContactSection';

export default function PublicHome() {
  return (
    <PublicLayout>
      <HeroSection />
      <AboutSection />
      <ClassesSection />
      <TrainersSection />
      <TestimonialsSection />
      <LocationsSection />
      <ContactSection />
    </PublicLayout>
  );
}
