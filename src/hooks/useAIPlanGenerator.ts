import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { aiService } from '@/services/aiService';

export const useAIPlanGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePlan = async (params: {
    planType: 'diet' | 'workout';
    duration: number;
    preferences: any;
    userData?: any;
  }) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await aiService.generatePlan({
        planType: params.planType,
        duration: params.duration,
        preferences: {
          ...params.preferences,
        },
        userData: params.userData || {},
      });

      toast({
        title: 'Success',
        description: `${params.planType === 'diet' ? 'Diet' : 'Workout'} plan generated successfully!`,
      });

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to generate plan. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePlan,
    isGenerating,
    error,
  };
};
