import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBranchContext } from '@/hooks/useBranchContext';
import { toast } from '@/hooks/use-toast';
import type { PaymentProvider, CreatePaymentOrderParams, CreatePaymentOrderResponse } from '@/types/payment-gateway';

export const usePaymentGateway = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { authState } = useAuth();
  const { currentBranchId } = useBranchContext();

  const createPaymentOrder = async (params: Omit<CreatePaymentOrderParams, 'customerId' | 'customerEmail' | 'customerPhone' | 'customerName'>): Promise<CreatePaymentOrderResponse | null> => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-order', {
        body: {
          ...params,
          customerId: authState.user?.id,
          customerEmail: authState.user?.email || '',
          customerPhone: authState.user?.phone || '',
          customerName: authState.user?.email?.split('@')[0] || 'Member',
          branchId: params.branchId || currentBranchId,
        },
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Payment order creation failed');
      }

      return data;
    } catch (error: any) {
      console.error('Payment order creation error:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to create payment order',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const openPaymentGateway = (response: CreatePaymentOrderResponse, amount: number) => {
    const { provider, gatewayOrderId, paymentUrl, apiKey } = response;

    if (provider === 'razorpay') {
      // Load Razorpay script if not already loaded
      if (!(window as any).Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => initRazorpay(gatewayOrderId, apiKey || '', amount);
        document.body.appendChild(script);
      } else {
        initRazorpay(gatewayOrderId, apiKey || '', amount);
      }
    } else if (paymentUrl) {
      // Redirect to payment URL for other providers
      window.location.href = paymentUrl;
    } else {
      toast({
        title: 'Payment Error',
        description: 'Payment URL not available',
        variant: 'destructive',
      });
    }
  };

  const initRazorpay = (orderId: string, apiKey: string, amount: number) => {
    const options = {
      key: apiKey,
      order_id: orderId,
      amount: amount * 100,
      currency: 'INR',
      name: 'GymFit',
      description: 'Payment for membership',
      handler: (response: any) => {
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully',
        });
        // Reload to update payment status
        window.location.reload();
      },
      modal: {
        ondismiss: () => {
          toast({
            title: 'Payment Cancelled',
            description: 'You cancelled the payment',
            variant: 'destructive',
          });
        },
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return {
    createPaymentOrder,
    openPaymentGateway,
    isProcessing,
  };
};
