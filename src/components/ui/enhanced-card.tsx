import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const enhancedCardVariants = cva(
  'rounded-lg border bg-card text-card-foreground',
  {
    variants: {
      variant: {
        default: 'shadow-sm',
        elevated: 'shadow-medium',
        outlined: 'border-2',
        ghost: 'border-0 shadow-none bg-transparent',
        gradient: 'bg-gradient-primary text-primary-foreground border-0',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hover: {
        none: '',
        lift: 'transition-all hover:shadow-medium hover:-translate-y-1',
        glow: 'transition-all hover:shadow-glow',
        scale: 'transition-all hover:scale-105',
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: 'none',
    },
  }
);

export interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof enhancedCardVariants> {
  asChild?: boolean;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(enhancedCardVariants({ variant, padding, hover, className }))}
      {...props}
    />
  )
);
EnhancedCard.displayName = 'EnhancedCard';

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { noPadding?: boolean }
>(({ className, noPadding = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5',
      !noPadding && 'p-6',
      className
    )}
    {...props}
  />
));
EnhancedCardHeader.displayName = 'EnhancedCardHeader';

const EnhancedCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
  }
>(({ className, level = 3, ...props }, ref) => {
  const headingProps = {
    ref,
    className: cn(
      'font-semibold leading-none tracking-tight',
      level === 1 && 'text-4xl',
      level === 2 && 'text-3xl',
      level === 3 && 'text-2xl',
      level === 4 && 'text-xl',
      level === 5 && 'text-lg',
      level === 6 && 'text-base',
      className
    ),
    ...props
  };

  switch (level) {
    case 1: return <h1 {...headingProps} />;
    case 2: return <h2 {...headingProps} />;
    case 3: return <h3 {...headingProps} />;
    case 4: return <h4 {...headingProps} />;
    case 5: return <h5 {...headingProps} />;
    case 6: return <h6 {...headingProps} />;
    default: return <h3 {...headingProps} />;
  }
});
EnhancedCardTitle.displayName = 'EnhancedCardTitle';

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
EnhancedCardDescription.displayName = 'EnhancedCardDescription';

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { noPadding?: boolean }
>(({ className, noPadding = false, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(!noPadding && 'p-6 pt-0', className)} 
    {...props} 
  />
));
EnhancedCardContent.displayName = 'EnhancedCardContent';

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { noPadding?: boolean }
>(({ className, noPadding = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center',
      !noPadding && 'p-6 pt-0',
      className
    )}
    {...props}
  />
));
EnhancedCardFooter.displayName = 'EnhancedCardFooter';

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  enhancedCardVariants,
};