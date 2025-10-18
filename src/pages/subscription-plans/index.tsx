import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Crown,
  Check,
  Building2,
  Users,
  Calendar,
  Settings,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SubscriptionPlansPage() {
  const { authState } = useAuth();

  const currentPlan = {
    name: 'Enterprise',
    status: 'active',
    billingCycle: 'monthly',
    nextBilling: '2024-02-15',
    price: '$299/month'
  };

  const usage = {
    branches: { current: 1, limit: 10 },
    members: { current: 0, limit: 2000 },
    trainers: { current: 0, limit: 50 },
    storage: { current: 25, limit: 100 } // GB
  };

  const features = [
    'Unlimited member management',
    'Advanced analytics & reports',
    'Multi-branch support',
    'Custom branding',
    'API access',
    'Priority support',
    'Advanced integrations',
    'Custom workflows'
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscription Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your gym management system subscription and usage
          </p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Admin Access
        </Badge>
      </div>

      {/* Current Plan Overview */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Current Plan: {currentPlan.name}</CardTitle>
                <CardDescription>
                  {currentPlan.price} • Next billing: {currentPlan.nextBilling}
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className="bg-success/10 text-success border-success/20"
            >
              {currentPlan.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Branches Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="font-medium">Branches</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.branches.current}/{usage.branches.limit}
                </span>
              </div>
              <Progress 
                value={(usage.branches.current / usage.branches.limit) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {usage.branches.limit - usage.branches.current} branches remaining
              </p>
            </div>

            {/* Members Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-medium">Total Members</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.members.current}/{usage.members.limit}
                </span>
              </div>
              <Progress 
                value={(usage.members.current / usage.members.limit) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {usage.members.limit - usage.members.current} members remaining
              </p>
            </div>

            {/* Trainers Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium">Trainers</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.trainers.current}/{usage.trainers.limit}
                </span>
              </div>
              <Progress 
                value={(usage.trainers.current / usage.trainers.limit) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {usage.trainers.limit - usage.trainers.current} trainers remaining
              </p>
            </div>

            {/* Storage Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <span className="font-medium">Storage</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.storage.current}GB/{usage.storage.limit}GB
                </span>
              </div>
              <Progress 
                value={(usage.storage.current / usage.storage.limit) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {usage.storage.limit - usage.storage.current}GB remaining
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
            <CardDescription>
              Everything included in your {currentPlan.name} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>
              Manage your subscription and billing details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Plan</span>
                <span>{currentPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Billing Cycle</span>
                <span className="capitalize">{currentPlan.billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Amount</span>
                <span className="font-semibold">{currentPlan.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Next Billing</span>
                <span>{currentPlan.nextBilling}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status</span>
                <Badge variant="secondary" className="bg-success/10 text-success">
                  Active
                </Badge>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button className="w-full" variant="outline">
                Update Payment Method
              </Button>
              <Button className="w-full" variant="outline">
                Download Invoice
              </Button>
              <Button className="w-full" variant="outline">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Alerts */}
      <Card className="border-warning/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-warning" />
            <CardTitle>Usage Alerts</CardTitle>
          </div>
          <CardDescription>
            Stay informed about your subscription usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Branch Limit</p>
                <p className="text-sm text-muted-foreground">
                  You're using {usage.branches.current} of {usage.branches.limit} available branches
                </p>
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success">
                Good
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Member Capacity</p>
                <p className="text-sm text-muted-foreground">
                  You have {usage.members.limit - usage.members.current} member slots remaining
                </p>
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success">
                Excellent
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}