import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Share2, Plus, Users, TrendingUp, DollarSign, Gift, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Referral {
  id: string;
  referrer_id: string | null;
  referrer_name?: string;
  referrer_email?: string;
  referred_email: string;
  referred_id?: string | null;
  referred_name?: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'expired';
  signup_bonus_amount: number;
  membership_bonus_amount: number;
  created_at: string;
  completed_at?: string | null;
  membership_id?: string | null;
  converted_at?: string | null;
}

interface ReferralSettings {
  bonusAmount: number;
  expiryDays: number;
  isActive: boolean;
}

// Fetch referrals from the database with user information
const fetchReferrals = async (): Promise<Referral[]> => {
  // First, get all referrals
  const { data: referralsData, error: referralsError } = await supabase
    .from('referrals')
    .select('*')
    .order('created_at', { ascending: false });

  if (referralsError) {
    console.error('Error fetching referrals:', referralsError);
    throw referralsError;
  }

  if (!referralsData || referralsData.length === 0) {
    return [];
  }

  // Get unique user IDs from referrers and referred users
  const userIds = [
    ...new Set(
      referralsData.flatMap(ref => [
        ref.referrer_id,
        ref.referred_id
      ]).filter(Boolean) as string[]
    )
  ];

  // Fetch user profiles data
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, email, full_name')
    .in('user_id', userIds);

  if (profilesError) {
    console.error('Error fetching profile data:', profilesError);
    // Continue with just the referral data if user fetch fails
    return referralsData.map(ref => ({
      ...ref,
      referrer_name: ref.referrer_id ? 'User' : 'Unknown',
      referred_name: ref.referred_email,
      status: ref.status as 'pending' | 'completed' | 'expired'
    }));
  }

  // Create a map of user IDs to profile data
  const profilesMap = new Map(profilesData?.map(profile => [profile.user_id, profile]) || []);

  // Combine referral data with user information
  return referralsData.map(ref => {
    const referrer = ref.referrer_id ? profilesMap.get(ref.referrer_id) : null;
    const referredUser = ref.referred_id ? profilesMap.get(ref.referred_id) : null;

    return {
      ...ref,
      referrer_name: referrer?.full_name || referrer?.email || 'Unknown',
      referrer_email: referrer?.email || 'Unknown',
      referred_name: referredUser?.full_name || ref.referred_email,
      referred_email: referredUser?.email || ref.referred_email,
      status: ref.status as 'pending' | 'completed' | 'expired'
    };
  });
};

export default function ReferralManagement() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<ReferralSettings>({
    bonusAmount: 50,
    expiryDays: 30,
    isActive: true
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Fetch referrals
  const { data: referrals = [], isLoading, error } = useQuery({
    queryKey: ['referrals'],
    queryFn: fetchReferrals
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('referrals_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'referrals' 
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['referrals'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const stats = useMemo(() => {
    const completedReferrals = referrals.filter(r => r.status === 'completed');
    const pendingReferrals = referrals.filter(r => r.status === 'pending');
    
    return {
      totalReferrals: referrals.length,
      completedReferrals: completedReferrals.length,
      pendingReferrals: pendingReferrals.length,
      totalBonusPaid: completedReferrals.reduce(
        (sum, r) => sum + (r.signup_bonus_amount + r.membership_bonus_amount), 
        0
      )
    };
  }, [referrals]);

  const conversionRate = stats.totalReferrals > 0 
    ? ((stats.completedReferrals / stats.totalReferrals) * 100).toFixed(1)
    : '0';

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Referral code copied to clipboard');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast.error('Failed to copy referral code');
    }
  };

  const handleMarkAsCompleted = async (referralId: string) => {
    try {
      const { error } = await supabase
        .from('referrals')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', referralId);

      if (error) throw error;
      
      toast.success('Referral marked as completed');
    } catch (error) {
      console.error('Error updating referral status:', error);
      toast.error('Failed to update referral status');
    }
  };

  const handleUpdateSettings = async () => {
    try {
      // TODO: Update referral settings in the database
      // This would typically update a settings table or similar
      toast.success('Referral settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'default';
    }
  };
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  if (isLoading) {
    return <div>Loading referrals...</div>;
  }
  
  if (error) {
    return <div>Error loading referrals. Please try again later.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Referral Management</h1>
          <p className="text-muted-foreground">Track and manage member referrals and bonuses</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referrals.length > 0 
                ? ((stats.completedReferrals / referrals.length) * 100).toFixed(1) 
                : '0'}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReferrals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bonus Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalBonusPaid.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="referrals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="referrals">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Referrer
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Referred
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Referral Code
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Bonus Paid
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Completed At
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {referrals.map((referral) => (
                  <tr key={referral.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">
                        {referral.referrer_name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {referral.referrer_email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">
                        {referral.referred_name || referral.referred_email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {referral.referred_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-mono bg-muted px-2 py-1 rounded text-sm">
                          {referral.referral_code}
                        </span>
                        <button 
                          onClick={() => handleCopyCode(referral.referral_code)}
                          className="ml-2 text-muted-foreground hover:text-foreground"
                        >
                          {copiedCode === referral.referral_code ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(referral.status)}>
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {(referral.signup_bonus_amount + referral.membership_bonus_amount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(referral.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(referral.completed_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {referral.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarkAsCompleted(referral.id)}
                        >
                          Mark as Completed
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Referral Settings</CardTitle>
              <p className="text-sm text-muted-foreground">Note: Database integration in progress. Changes are saved locally for now.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bonusAmount">Bonus Amount ($)</Label>
                  <Input
                    id="bonusAmount"
                    type="number"
                    value={settings.bonusAmount}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      bonusAmount: Number(e.target.value) 
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="expiryDays">Referral Expiry (days)</Label>
                  <Input
                    id="expiryDays"
                    type="number"
                    value={settings.expiryDays}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      expiryDays: Number(e.target.value) 
                    }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={settings.isActive}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    isActive: e.target.checked 
                  }))}
                  className="rounded border-input"
                />
                <Label htmlFor="isActive">Enable Referral Program</Label>
              </div>
              
              <Button onClick={handleUpdateSettings}>
                Update Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}