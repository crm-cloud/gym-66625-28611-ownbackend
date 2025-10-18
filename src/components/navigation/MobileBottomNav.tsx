
import { Home, Calendar, ShoppingBag, User, Dumbbell } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Classes',
    href: '/member/classes',
    icon: Calendar,
  },
  {
    name: 'Workouts',
    href: '/diet-workout',
    icon: Dumbbell,
  },
  {
    name: 'Store',
    href: '/store',
    icon: ShoppingBag,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
];

export const MobileBottomNav = () => {
  const { authState } = useAuth();

  // Only show for members
  if (!authState.user || authState.user.role !== 'member') {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
      <nav className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-0 flex-1',
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-5 w-5 mb-1', isActive && 'text-primary')} />
                  <span className="text-xs font-medium truncate">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
