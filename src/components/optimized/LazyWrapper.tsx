import { Suspense, ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoadingState } from '@/components/LoadingState';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorBoundary?: boolean;
}

export const LazyWrapper = ({ 
  children, 
  fallback = <PageLoadingState />, 
  errorBoundary = true 
}: LazyWrapperProps) => {
  const content = (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );

  if (errorBoundary) {
    return <ErrorBoundary>{content}</ErrorBoundary>;
  }

  return content;
};