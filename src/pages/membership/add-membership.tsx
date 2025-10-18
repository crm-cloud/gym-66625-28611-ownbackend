import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stepper } from '@/components/ui/stepper';
import { ArrowLeft, Users, CreditCard, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';
import { useToast } from '@/hooks/use-toast';
import { MemberForm } from '@/components/member/MemberForm';
import { AssignMembershipDrawer } from '@/components/membership/AssignMembershipDrawer';
import { useMembershipWorkflow } from '@/hooks/useMembershipWorkflow';
import { MemberFormData } from '@/types/member';
import { MembershipFormData } from '@/types/membership';

type WorkflowStep = 'member-info' | 'membership-plan' | 'payment' | 'confirmation';

interface WorkflowState {
  currentStep: WorkflowStep;
  memberData?: MemberFormData;
  membershipData?: MembershipFormData & { membershipPlanId: string };
  workflowResult?: { memberId: string; membershipId: string; invoiceId: string };
  isComplete: boolean;
}

export const AddMembershipWorkflowPage = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { hasPermission } = useRBAC();
  const { toast } = useToast();
  const { executeWorkflow, processPayment, isLoading } = useMembershipWorkflow();

  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    currentStep: 'member-info',
    isComplete: false
  });

  const [showMembershipDrawer, setShowMembershipDrawer] = useState(false);

  // Check permissions
  const canCreateMembers = hasPermission('members.create');
  const canAssignMemberships = hasPermission('members.edit');

  if (!canCreateMembers) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to create members.</p>
      </div>
    );
  }

  const steps = [
    {
      id: 'member-info',
      title: 'Member Information',
      description: 'Basic member details and profile',
      icon: Users,
      completed: !!workflowState.memberData
    },
    {
      id: 'membership-plan',
      title: 'Membership Plan',
      description: 'Select and configure membership',
      icon: CreditCard,
      completed: !!workflowState.membershipData
    },
    {
      id: 'payment',
      title: 'Payment & Billing',
      description: 'Process payment and generate invoice',
      icon: FileText,
      completed: false
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      description: 'Review and complete registration',
      icon: CheckCircle,
      completed: workflowState.isComplete
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === workflowState.currentStep);

  const handleMemberDataSubmit = (data: MemberFormData) => {
    setWorkflowState(prev => ({
      ...prev,
      memberData: data,
      currentStep: 'membership-plan'
    }));
    setShowMembershipDrawer(true);
  };

  const handleMembershipDataSubmit = async (data: MembershipFormData & { membershipPlanId: string }) => {
    if (!workflowState.memberData) return;

    try {
      // Execute the complete workflow: member + membership + invoice
      const result = await executeWorkflow.mutateAsync({
        memberData: workflowState.memberData,
        membershipData: data,
        membershipPlanId: data.membershipPlanId,
      });

      setWorkflowState(prev => ({
        ...prev,
        membershipData: data,
        workflowResult: result,
        currentStep: 'payment'
      }));
      setShowMembershipDrawer(false);

      toast({
        title: 'Member & Membership Created',
        description: `${workflowState.memberData.fullName} has been registered. Please process payment to activate membership.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create member and membership. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handlePaymentProcess = async () => {
    if (!workflowState.workflowResult || !workflowState.membershipData) return;

    try {
      // Process payment using the created membership and invoice
      await processPayment.mutateAsync({
        membershipId: workflowState.workflowResult.membershipId,
        invoiceId: workflowState.workflowResult.invoiceId,
        amount: workflowState.membershipData.totalInclGst || workflowState.membershipData.gstRate || 0,
        paymentMethod: 'cash', // Default, could be made configurable
        notes: 'Initial membership payment'
      });

      setWorkflowState(prev => ({
        ...prev,
        currentStep: 'confirmation',
        isComplete: true
      }));

      toast({
        title: 'Payment Processed Successfully',
        description: `${workflowState.memberData?.fullName}'s membership is now active.`,
      });

    } catch (error) {
      toast({
        title: 'Payment Error',
        description: 'Failed to process payment. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleStartOver = () => {
    setWorkflowState({
      currentStep: 'member-info',
      isComplete: false
    });
  };

  const handleGoToMember = () => {
    if (workflowState.workflowResult) {
      navigate(`/members/${workflowState.workflowResult.memberId}/profile`);
    } else {
      navigate('/members');
    }
  };

  const getRoleSpecificTitle = () => {
    switch (authState.user?.role) {
      case 'super-admin':
      case 'admin':
        return 'Add New Member & Membership';
      case 'team':
        if (authState.user.teamRole === 'manager') {
          return 'Register New Member';
        }
        return 'Member Registration';
      default:
        return 'Add Membership';
    }
  };

  const getRoleSpecificDescription = () => {
    switch (authState.user?.role) {
      case 'super-admin':
      case 'admin':
        return 'Complete member registration workflow with membership assignment and payment processing';
      case 'team':
        if (authState.user.teamRole === 'manager') {
          return 'Register new members and assign appropriate membership plans';
        }
        return 'Process new member registrations and membership assignments';
      default:
        return 'Add new membership for existing or new members';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/members')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Members
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{getRoleSpecificTitle()}</h1>
            <p className="text-muted-foreground">{getRoleSpecificDescription()}</p>
          </div>
        </div>
        <Badge variant="outline">
          {authState.user?.role === 'team' && authState.user.teamRole 
            ? `${authState.user.teamRole} Access` 
            : `${authState.user?.role} Access`
          }
        </Badge>
      </div>

      {/* Progress Stepper */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Registration Progress</h3>
            <span className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === workflowState.currentStep;
              const isCompleted = step.completed;
              const isPast = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                      ${isCompleted || isPast 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : isActive 
                          ? 'border-primary text-primary bg-primary/10' 
                          : 'border-muted-foreground text-muted-foreground'
                      }
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      flex-1 h-0.5 mx-4 transition-colors
                      ${isPast || isCompleted ? 'bg-primary' : 'bg-muted'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {workflowState.currentStep === 'member-info' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Member Information
                </CardTitle>
                <CardDescription>
                  Enter the new member's personal details and information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MemberForm 
                  onSubmit={handleMemberDataSubmit}
                  isLoading={false}
                />
              </CardContent>
            </Card>
          )}

          {workflowState.currentStep === 'membership-plan' && workflowState.memberData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Membership Plan Selection
                </CardTitle>
                <CardDescription>
                  Choose and configure the membership plan for {workflowState.memberData.fullName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Select a membership plan to continue
                  </p>
                  <Button onClick={() => setShowMembershipDrawer(true)}>
                    Choose Membership Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {workflowState.currentStep === 'payment' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Payment & Billing
                </CardTitle>
                <CardDescription>
                  Process payment and generate invoice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {workflowState.memberData && workflowState.membershipData && (
                  <div className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Registration Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Member:</span>
                          <p className="font-medium">{workflowState.memberData.fullName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p className="font-medium">{workflowState.memberData.email}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Branch:</span>
                          <p className="font-medium">{workflowState.memberData.branchId}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Plan:</span>
                          <p className="font-medium">Selected Plan</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                    <Button 
                      onClick={handlePaymentProcess}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Processing...' : 'Process Payment & Complete Registration'}
                    </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setWorkflowState(prev => ({ ...prev, currentStep: 'membership-plan' }))}
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {workflowState.currentStep === 'confirmation' && workflowState.isComplete && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  Registration Complete
                </CardTitle>
                <CardDescription>
                  Member has been successfully registered with their membership
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success" />
                  <h3 className="text-xl font-semibold mb-2">Welcome to the Gym!</h3>
                  <p className="text-muted-foreground mb-6">
                    {workflowState.memberData?.fullName} has been successfully registered and their membership is now active.
                  </p>
                  
                  <div className="flex gap-3 justify-center">
                    <Button onClick={handleGoToMember}>
                      View Member Profile
                    </Button>
                    <Button variant="outline" onClick={handleStartOver}>
                      Register Another Member
                    </Button>
                  </div>
                </div>

                <div className="bg-success-light p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Next Steps:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Member will receive welcome email with login details</li>
                    <li>• Membership card will be prepared for pickup</li>
                    <li>• Schedule orientation session if needed</li>
                    <li>• Add member to relevant WhatsApp groups</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/members')}
              >
                <Users className="w-4 h-4 mr-2" />
                View All Members
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/membership/plans')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Plans
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/leads')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Convert Lead
              </Button>
            </CardContent>
          </Card>

          {/* Role-specific help */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Help & Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {authState.user?.role === 'team' && authState.user.teamRole === 'staff' && (
                <>
                  <p>• Verify member's ID documents</p>
                  <p>• Take member's photo for profile</p>
                  <p>• Explain gym rules and policies</p>
                  <p>• Schedule facility tour</p>
                </>
              )}
              {(authState.user?.role === 'admin' || authState.user?.teamRole === 'manager') && (
                <>
                  <p>• Review membership plan pricing</p>
                  <p>• Apply discounts if applicable</p>
                  <p>• Assign appropriate trainer</p>
                  <p>• Set up payment reminders</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Membership Assignment Drawer */}
      {workflowState.memberData && (
        <AssignMembershipDrawer
          open={showMembershipDrawer}
          onClose={() => setShowMembershipDrawer(false)}
          memberName={workflowState.memberData.fullName}
          onSubmit={handleMembershipDataSubmit}
        />
      )}
    </div>
  );
};