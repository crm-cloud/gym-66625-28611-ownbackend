import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, MapPin, ChevronDown } from 'lucide-react';
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
import { useRBAC } from '@/hooks/useRBAC';
import { UserRole } from '@/types/auth';
import { Badge } from '@/components/ui/badge';
import { getNavigationForUser } from '@/config/navigationConfig';
import { useState } from 'react';

export function EnhancedAppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { currentUser, getUserPermissions } = useRBAC();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const currentPath = location.pathname;
  
  const collapsed = state === 'collapsed';

  if (!currentUser) {
    console.warn('⚠️ [Sidebar] Rendering without user - this should not happen');
    return null;
  }

  // Get filtered navigation groups using centralized configuration
  const userPermissions = getUserPermissions();
  const navigationGroups = getNavigationForUser(
    currentUser.role,
    userPermissions,
    currentUser.teamRole
  );

  console.log('🎯 [Sidebar] Navigation loaded:', {
    role: currentUser.role,
    teamRole: currentUser.teamRole,
    permissionsCount: userPermissions.length,
    navigationGroupsCount: navigationGroups.length,
    totalNavItems: navigationGroups.reduce((sum, g) => sum + g.items.length, 0)
  });

  const isActive = (path: string) => currentPath === path;

  const getRoleDisplayName = (role: UserRole, teamRole?: string) => {
    if (role === 'team' && teamRole) {
      return `${teamRole.charAt(0).toUpperCase() + teamRole.slice(1)} Panel`;
    }
    return `${role.charAt(0).toUpperCase() + role.slice(1)} Panel`;
  };

  const toggleGroup = (groupId: string) => {
    if (!collapsed) {
      setExpandedGroups(prev => ({
        ...prev,
        [groupId]: !prev[groupId]
      }));
    }
  };

  // Animation variants
  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 56 }
  } as const;

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -10 }
  } as const;

  const groupVariants = {
    open: {
      height: 'auto' as const,
      opacity: 1,
      transition: { opacity: { duration: 0.2 } }
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: { opacity: { duration: 0.1 } }
    }
  } as const;

  return (
    <motion.div
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
      className="relative"
    >
      <Sidebar className="h-full border-r border-sidebar-border" collapsible="icon">
        <SidebarContent className="px-0">
          {/* Brand */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Dumbbell className="w-4 h-4 text-white" />
              </motion.div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    variants={contentVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    transition={{ duration: 0.2 }}
                    className="flex-1"
                  >
                    <h2 className="font-bold text-sidebar-foreground">GymFit Pro</h2>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-sidebar-foreground/60">
                        {getRoleDisplayName(currentUser.role, currentUser.teamRole)}
                      </p>
                      {currentUser.teamRole && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          {currentUser.teamRole}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Branch Selector for non-global roles */}
          <AnimatePresence>
            {!collapsed && (currentUser.role === 'team' || currentUser.role === 'member') && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                transition={{ duration: 0.2 }}
                className="px-4 py-2 border-b border-sidebar-border"
              >
                <div className="flex items-center gap-2 text-sm text-sidebar-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{currentUser.branchName || 'No Branch'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            {navigationGroups.map((group) => (
              <SidebarGroup key={group.id}>
                {!collapsed && (
                  <SidebarGroupLabel 
                    className="cursor-pointer hover:bg-sidebar-accent/50 transition-colors duration-200"
                    onClick={() => toggleGroup(group.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{group.title}</span>
                      <motion.div
                        animate={{ 
                          rotate: expandedGroups[group.id] !== false ? 0 : -90 
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </SidebarGroupLabel>
                )}
                <AnimatePresence>
                  {(collapsed || expandedGroups[group.id] !== false) && (
                    <motion.div
                      variants={collapsed ? undefined : groupVariants}
                      initial={collapsed ? undefined : 'open'}
                      animate={collapsed ? undefined : 'open'}
                      exit={collapsed ? undefined : 'closed'}
                    >
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {group.items.map((item) => {
                            const IconComponent = item.icon;
                            return (
                              <SidebarMenuItem key={item.id}>
                                <SidebarMenuButton asChild isActive={isActive(item.url)}>
                                  <motion.div whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 300 }}>
                                    <NavLink 
                                      to={item.url} 
                                      className={({ isActive }) => 
                                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full ${
                                          isActive 
                                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                                        }`
                                      }
                                    >
                                      <IconComponent className="w-5 h-5 shrink-0" />
                                      <AnimatePresence>
                                        {!collapsed && (
                                          <motion.span
                                            variants={contentVariants}
                                            initial="collapsed"
                                            animate="expanded"
                                            exit="collapsed"
                                            transition={{ duration: 0.15 }}
                                          >
                                            {item.title}
                                          </motion.span>
                                        )}
                                      </AnimatePresence>
                                    </NavLink>
                                  </motion.div>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SidebarGroup>
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    </motion.div>
  );
}
