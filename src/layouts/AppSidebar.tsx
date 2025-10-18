
import { NavLink, useLocation } from 'react-router-dom';
import { Dumbbell, MapPin } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';
import { UserRole } from '@/types/auth';
import { Badge } from '@/components/ui/badge';
import { getNavigationForUser } from '@/config/navigationConfig';

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { authState } = useAuth();
  const { getUserPermissions } = useRBAC();
  const currentPath = location.pathname;
  
  const collapsed = state === 'collapsed';

  if (!authState.user) return null;

  // Get filtered navigation groups using centralized configuration
  const navigationGroups = getNavigationForUser(
    authState.user.role,
    getUserPermissions(),
    authState.user.teamRole
  );

  const isActive = (path: string) => currentPath === path;

  const getRoleDisplayName = (role: UserRole, teamRole?: string) => {
    if (role === 'team' && teamRole) {
      return `${teamRole.charAt(0).toUpperCase() + teamRole.slice(1)} Panel`;
    }
    return `${role.charAt(0).toUpperCase() + role.slice(1)} Panel`;
  };

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent className="px-0">
        {/* Brand */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div className="flex-1">
                <h2 className="font-bold text-sidebar-foreground">GymFit Pro</h2>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-sidebar-foreground/60">
                    {getRoleDisplayName(authState.user.role, authState.user.teamRole)}
                  </p>
                  {authState.user.teamRole && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {authState.user.teamRole}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Branch Selector for non-global roles */}
        {!collapsed && (authState.user.role === 'team' || authState.user.role === 'member') && (
          <div className="px-4 py-2 border-b border-sidebar-border">
            <div className="flex items-center gap-2 text-sm text-sidebar-foreground">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{authState.user.branchName || 'No Branch'}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.id}>
            {!collapsed && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <NavLink 
                          to={item.url} 
                          className={({ isActive }) => 
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                              isActive 
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                            }`
                          }
                        >
                          <IconComponent className="w-5 h-5 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
