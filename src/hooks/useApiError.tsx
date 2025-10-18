
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

interface UseApiErrorReturn {
  handleError: (error: any) => void;
  showNetworkError: () => void;
  showUnauthorizedError: () => void;
  showForbiddenError: () => void;
  showNotFoundError: () => void;
  showServerError: () => void;
}

export const useApiError = (): UseApiErrorReturn => {
  const handleError = useCallback((error: any) => {
    console.error('API Error:', error);

    let message = 'An unexpected error occurred';
    let title = 'Error';

    if (error?.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          title = 'Bad Request';
          message = data?.message || 'Invalid request data';
          break;
        case 401:
          title = 'Unauthorized';
          message = 'Please log in to continue';
          // Redirect to login could be handled here
          break;
        case 403:
          title = 'Access Denied';
          message = 'You don\'t have permission to perform this action';
          break;
        case 404:
          title = 'Not Found';
          message = 'The requested resource was not found';
          break;
        case 422:
          title = 'Validation Error';
          message = data?.message || 'Please check your input data';
          break;
        case 500:
          title = 'Server Error';
          message = 'Internal server error. Please try again later';
          break;
        case 503:
          title = 'Service Unavailable';
          message = 'Service is temporarily unavailable. Please try again later';
          break;
        default:
          title = 'Error';
          message = data?.message || `Request failed with status ${status}`;
      }
    } else if (error?.request) {
      title = 'Network Error';
      message = 'Unable to connect to the server. Please check your internet connection';
    } else if (error?.message) {
      message = error.message;
    }

    toast({
      title,
      description: message,
      variant: 'destructive',
    });
  }, []);

  const showNetworkError = useCallback(() => {
    toast({
      title: 'Network Error',
      description: 'Unable to connect to the server. Please check your internet connection.',
      variant: 'destructive',
    });
  }, []);

  const showUnauthorizedError = useCallback(() => {
    toast({
      title: 'Unauthorized',
      description: 'Please log in to continue.',
      variant: 'destructive',
    });
  }, []);

  const showForbiddenError = useCallback(() => {
    toast({
      title: 'Access Denied',
      description: 'You don\'t have permission to perform this action.',
      variant: 'destructive',
    });
  }, []);

  const showNotFoundError = useCallback(() => {
    toast({
      title: 'Not Found',
      description: 'The requested resource was not found.',
      variant: 'destructive',
    });
  }, []);

  const showServerError = useCallback(() => {
    toast({
      title: 'Server Error',
      description: 'Internal server error. Please try again later.',
      variant: 'destructive',
    });
  }, []);

  return {
    handleError,
    showNetworkError,
    showUnauthorizedError,
    showForbiddenError,
    showNotFoundError,
    showServerError,
  };
};
