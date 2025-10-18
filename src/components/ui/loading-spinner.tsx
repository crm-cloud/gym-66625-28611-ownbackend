import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva(
  'animate-spin',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
      },
      variant: {
        default: 'text-primary',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
        success: 'text-success',
        warning: 'text-warning',
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  text?: string;
  centered?: boolean;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, text, centered = false, ...props }, ref) => {
    const Container = centered ? 'div' : React.Fragment;
    const containerProps = centered ? {
      className: 'flex items-center justify-center',
      ...props
    } : props;

    const spinner = (
      <div className={cn('flex items-center gap-2', className)} ref={ref}>
        <Loader2 className={spinnerVariants({ size, variant })} />
        {text && (
          <span className={cn(
            'font-medium',
            variant === 'muted' && 'text-muted-foreground',
            variant === 'destructive' && 'text-destructive',
            variant === 'success' && 'text-success',
            variant === 'warning' && 'text-warning',
            !variant && 'text-foreground'
          )}>
            {text}
          </span>
        )}
      </div>
    );

    if (centered) {
      return (
        <Container {...containerProps}>
          {spinner}
        </Container>
      );
    }

    return spinner;
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner, spinnerVariants };