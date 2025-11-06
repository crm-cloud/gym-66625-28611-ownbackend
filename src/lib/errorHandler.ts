import { toast } from 'sonner';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    
    // Capture stack trace in development
    if (process.env.NODE_ENV === 'development') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  
  // Handle network errors
  if (!error.response) {
    toast.error('Network Error', {
      description: 'Unable to connect to the server. Please check your internet connection.',
    });
    return;
  }

  const { status, data } = error.response;
  
  switch (status) {
    case 429: // Too Many Requests
      toast.error('Too Many Requests', {
        description: data?.message || 'You have made too many requests. Please wait a moment and try again.',
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        },
      });
      break;
      
    case 401: // Unauthorized
      // Handle unauthorized (e.g., redirect to login)
      toast.error('Session Expired', {
        description: 'Your session has expired. Please log in again.',
      });
      // Redirect to login after a delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      break;
      
    case 403: // Forbidden
      toast.error('Access Denied', {
        description: data?.message || 'You do not have permission to perform this action.',
      });
      break;
      
    case 404: // Not Found
      toast.error('Not Found', {
        description: data?.message || 'The requested resource was not found.',
      });
      break;
      
    case 500: // Internal Server Error
      toast.error('Server Error', {
        description: data?.message || 'An unexpected error occurred. Please try again later.',
      });
      break;
      
    default:
      // Handle other 4xx/5xx errors
      const errorMessage = data?.message || 'An error occurred. Please try again.';
      toast.error('Error', {
        description: errorMessage,
      });
  }
  
  // Return a rejected promise with the error
  return Promise.reject(new ApiError(
    data?.message || 'An error occurred',
    status,
    data
  ));
};

export const withErrorHandling = async (promise: Promise<any>) => {
  try {
    return await promise;
  } catch (error) {
    return handleApiError(error);
  }
};
