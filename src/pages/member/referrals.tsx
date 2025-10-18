import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Copy, 
  Check,
  Mail,
  MessageSquare,
  Gift,
  Calendar
} from 'lucide-react';
import {
  generateReferralCode,
  createReferral,
  fetchUserReferrals,
  fetchReferralAnalytics,
  fetchReferralSettings,
} from '@/services/referralService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function MemberReferralsPage() {
  const { authState } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referredEmail, setReferredEmail] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch or generate referral code
  useEffect(() => {
    const initReferralCode = async () => {
      if (authState.user?.id) {
        try {
          const { referrals } = await fetchUserReferrals(authState.user.id, 1, 1);
          if (referrals.length > 0) {
            setReferralCode(referrals[0].referral_code);
          } else {
            const code = await generateReferralCode();
            setReferralCode(code);
          }
        } catch (error) {
          console.error('Error initializing referral code:', error);
        }
      }
    };
    initReferralCode();
  }, [authState.user?.id]);

  // Fetch referrals
  const { data: referralsData, isLoading: referralsLoading } = useQuery({
    queryKey: ['user-referrals', authState.user?.id, page],
    queryFn: () => fetchUserReferrals(authState.user!.id, page, 10),
    enabled: !!authState.user?.id,
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ['referral-analytics', authState.user?.id],
    queryFn: () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      return fetchReferralAnalytics(authState.user!.id, startDate, endDate);
    },
    enabled: !!authState.user?.id,
  });

  // Fetch settings
  const { data: settings } = useQuery({
    queryKey: ['referral-settings'],
    queryFn: fetchReferralSettings,
  });

  // Create referral mutation
  const createReferralMutation = useMutation({
    mutationFn: () => createReferral(authState.user!.id, referredEmail),
    onSuccess: () => {
      toast({ title: 'Referral created successfully!' });
      setReferredEmail('');
      queryClient.invalidateQueries({ queryKey: ['user-referrals'] });
      queryClient.invalidateQueries({ queryKey: ['referral-analytics'] });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Failed to create referral', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      toast({ title: 'Referral code copied!' });
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      toast({ title: 'Failed to copy code', variant: 'destructive' });
    }
  };

  const handleShareEmail = () => {
    const subject = 'Join our gym!';
    const body = `I'd like to invite you to join our gym! Use my referral code: ${referralCode}\n\nYou'll get started with exclusive benefits!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleShareWhatsApp = () => {
    const message = `Join our gym using my referral code: ${referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddReferral = () => {
    if (!referredEmail.trim()) {
      toast({ title: 'Please enter an email address', variant: 'destructive' });
      return;
    }
    createReferralMutation.mutate();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referral Program</h1>
        <p className="text-muted-foreground">
          Share your code and earn rewards when your friends join!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Total Referrals
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_referrals || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Completed
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.completed_referrals || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.conversion_rate || 0}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Pending
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.pending_referrals || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting signup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Total Earned
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics?.total_bonus || 0}</div>
            <p className="text-xs text-muted-foreground">In credits</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-lg p-4 text-center">
              <div className="text-3xl font-bold font-mono tracking-wider">
                {referralCode || 'Loading...'}
              </div>
            </div>
            <Button onClick={handleCopyCode} size="lg">
              {copiedCode ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleShareEmail} variant="outline" className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Share via Email
            </Button>
            <Button onClick={handleShareWhatsApp} variant="outline" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Share on WhatsApp
            </Button>
          </div>

          {settings && (
            <div className="bg-primary/10 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold">Referral Rewards:</h4>
              <ul className="space-y-1 text-sm">
                <li>• ${settings.referral_signup_bonus} when your friend signs up</li>
                <li>• ${settings.referral_membership_bonus} when they purchase a membership</li>
                <li>• Credits can be used for memberships, training sessions, and more</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Referral */}
      <Card>
        <CardHeader>
          <CardTitle>Refer Someone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter friend's email"
              value={referredEmail}
              onChange={(e) => setReferredEmail(e.target.value)}
              type="email"
            />
            <Button 
              onClick={handleAddReferral}
              disabled={createReferralMutation.isPending}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {referralsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : referralsData?.referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No referrals yet. Start sharing your code!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {referralsData?.referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{referral.referred_email}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(referral.created_at!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        referral.status === 'paid' ? 'default' :
                        referral.status === 'completed' ? 'secondary' :
                        'outline'
                      }
                    >
                      {referral.status}
                    </Badge>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${referral.signup_bonus_amount + referral.membership_bonus_amount}
                      </p>
                      <p className="text-xs text-muted-foreground">earned</p>
                    </div>
                  </div>
                </div>
              ))}

              {referralsData && referralsData.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {page} of {referralsData.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(referralsData.totalPages, p + 1))}
                    disabled={page === referralsData.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
