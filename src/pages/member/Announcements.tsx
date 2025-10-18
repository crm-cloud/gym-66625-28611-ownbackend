import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export const MemberAnnouncements = () => {
  const { data: member, isLoading: memberLoading } = useMemberProfile();
  
  const { data: announcements, isLoading: announcementsLoading } = useSupabaseQuery(
    ['member-announcements', member?.branch_id],
    async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Filter announcements that target this member
      return (data || []).filter(announcement => {
        const isBranchMatch = !announcement.branch_ids || 
                             announcement.branch_ids.length === 0 ||
                             announcement.branch_ids.includes(member?.branch_id);
        
        const isRoleMatch = !announcement.target_roles || 
                           announcement.target_roles.length === 0 ||
                           announcement.target_roles.includes('member');
        
        const isNotExpired = !announcement.expires_at || 
                            new Date(announcement.expires_at) > new Date();
        
        return isBranchMatch && isRoleMatch && isNotExpired;
      });
    },
    {
      enabled: !!member?.branch_id
    }
  );

  if (memberLoading || announcementsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading announcements...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">Member profile not found.</p>
      </div>
    );
  }

  const getPriorityBadge = (priority: number) => {
    if (priority >= 3) {
      return <Badge variant="destructive">High Priority</Badge>;
    } else if (priority === 2) {
      return <Badge variant="default">Medium Priority</Badge>;
    } else {
      return <Badge variant="secondary">Low Priority</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="h-5 w-5" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Megaphone className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Announcements</h1>
        <p className="text-muted-foreground">Stay updated with the latest news from your gym</p>
      </div>

      {announcements && announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1 text-primary">
                      {getTypeIcon(announcement.notification_type)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{announcement.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(announcement.created_at), 'PPP')}
                        </div>
                        {announcement.expires_at && (
                          <Badge variant="outline" className="text-xs">
                            Expires: {format(new Date(announcement.expires_at), 'PP')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {getPriorityBadge(announcement.priority || 1)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Announcements</h3>
            <p className="text-muted-foreground text-center">
              There are no announcements at the moment. Check back later for updates!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
