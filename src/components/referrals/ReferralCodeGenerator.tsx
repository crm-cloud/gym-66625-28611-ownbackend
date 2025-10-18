import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const ReferralCodeGenerator = ({
  referralCode,
  onGenerate,
  isLoading,
}: {
  referralCode: string | null;
  onGenerate: () => Promise<void>;
  isLoading: boolean;
}) => {
  const { toast } = useToast();

  const handleCopy = () => {
    if (!referralCode) return;
    copyToClipboard(referralCode);
    toast({
      title: 'Copied!',
      description: 'Referral code copied to clipboard.',
    });
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg border shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Referral Code</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onGenerate}
          disabled={isLoading}
          className="text-primary"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {referralCode ? 'Regenerate' : 'Generate'}
        </Button>
      </div>
      
      {referralCode ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex-1 px-4 py-3 bg-muted rounded-md font-mono text-sm">
              {referralCode}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopy}
              className="h-10 w-10 p-0 flex items-center justify-center"
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this code with friends and earn rewards when they sign up!
          </p>
        </div>
      ) : (
        <div className="py-4 text-center">
          <p className="text-muted-foreground mb-4">
            Generate a unique referral code to share with friends and start earning rewards.
          </p>
          <Button 
            onClick={onGenerate} 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Referral Code'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
