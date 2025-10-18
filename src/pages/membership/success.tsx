import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SuccessLocationState {
  planId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export default function MembershipSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Type assertion for location.state
  const state = location.state as SuccessLocationState | undefined;

  useEffect(() => {
    if (!state?.planId) {
      // If user navigates directly to this page without state, redirect to plans
      navigate('/membership/plans');
      toast({
        title: 'No purchase found',
        description: 'Please select a membership plan to continue.',
      });
    }
  }, [navigate, state, toast]);

  if (!state?.planId) {
    return null; // Will redirect in useEffect
  }

  // Format the amount (assuming it's in cents)
  const amount = (state.amount / 100).toFixed(2);
  const currency = state.currency.toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-600" aria-hidden="true" />
        </div>
        
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Welcome to the Club!
        </h2>
        
        <p className="mt-2 text-sm text-gray-600">
          Your membership has been successfully activated. Here's what you can do next:
        </p>
        
        <div className="mt-8 bg-white py-6 px-4 shadow rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-600">Order Number</dt>
              <dd className="text-sm text-gray-900">{state.paymentIntentId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-600">Plan</dt>
              <dd className="text-sm text-gray-900">
                {state.planId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-600">Amount Paid</dt>
              <dd className="text-sm text-gray-900">{currency} {amount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-600">Status</dt>
              <dd className="text-sm text-green-600 font-medium">
                Active <span className="ml-1">✓</span>
              </dd>
            </div>
          </dl>
        </div>
        
        <div className="mt-8 space-y-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full justify-center"
            size="lg"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => navigate('/member/classes')}
            variant="outline"
            className="w-full justify-center"
          >
            <Dumbbell className="mr-2 h-4 w-4" />
            Book a Class
          </Button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help?{' '}
            <a href="/contact" className="font-medium text-indigo-600 hover:text-indigo-500">
              Contact our support team
            </a>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
}

// Add missing import for Dumbbell icon
import { Dumbbell } from 'lucide-react';
