import { ApiError } from './ApiError';
import { toast } from '@/hooks/use-toast';

/**
 * Error Handler Service
 * Centralized error handling and user notification
 */

export interface ErrorHandlerOptions {
  silent?: boolean;
  customMessage?: string;
  onError?: (error: ApiError) => void;
}

class ErrorHandlerService {
  /**
   * Handle API errors with user notifications
   */
  handle(error: any, options?: ErrorHandlerOptions): ApiError {
    const apiError = error instanceof ApiError 
      ? error 
      : ApiError.fromAxiosError(error);

    // Log error for debugging
    console.error('[API Error]', {
      message: apiError.message,
      status: apiError.status,
      code: apiError.code,
      field: apiError.field,
      details: apiError.details,
    });

    // Show toast notification unless silent
    if (!options?.silent) {
      this.showErrorToast(apiError, options?.customMessage);
    }

    // Call custom error handler if provided
    if (options?.onError) {
      options.onError(apiError);
    }

    return apiError;
  }

  /**
   * Show error toast notification
   */
  private showErrorToast(error: ApiError, customMessage?: string): void {
    const message = customMessage || error.getUserMessage();
    
    toast({
      title: this.getErrorTitle(error),
      description: message,
      variant: 'destructive',
    });
  }

  /**
   * Get appropriate error title based on error type
   */
  private getErrorTitle(error: ApiError): string {
    if (error.isAuthError()) {
      return 'Permission Denied';
    }
    
    if (error.isValidationError()) {
      return 'Validation Error';
    }
    
    if (error.isNotFoundError()) {
      return 'Not Found';
    }
    
    if (error.isServerError()) {
      return 'Server Error';
    }
    
    return 'Error';
  }

  /**
   * Handle authentication errors (redirect to login)
   */
  handleAuthError(): void {
    // Clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Redirect to login
    window.location.href = '/login';
  }

  /**
   * Format validation errors for forms
   */
  formatValidationErrors(error: ApiError): Record<string, string> {
    if (!error.details || typeof error.details !== 'object') {
      return {};
    }

    const formatted: Record<string, string> = {};
    
    // Handle different validation error formats
    if (Array.isArray(error.details)) {
      error.details.forEach((err: any) => {
        if (err.field && err.message) {
          formatted[err.field] = err.message;
        }
      });
    } else {
      Object.keys(error.details).forEach(key => {
        const value = error.details[key];
        if (typeof value === 'string') {
          formatted[key] = value;
        } else if (Array.isArray(value)) {
          formatted[key] = value.join(', ');
        }
      });
    }

    return formatted;
  }
}

export const errorHandler = new ErrorHandlerService();
