
import { SidebarProvider } from '@/components/ui/sidebar';
import { EnhancedAppSidebar } from './EnhancedAppSidebar';
import { AppHeader } from './AppHeader';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';
import { LoadingState } from '@/components/LoadingState';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { authState } = useAuth();
  const { isLoadingPermissions } = useRBAC();

  // Wait for both auth and permissions to load
  if (authState.isLoading || isLoadingPermissions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState size="lg" text="Loading your workspace..." />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <EnhancedAppSidebar />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1 p-6 pb-20 md:pb-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </SidebarProvider>
  );
};
