/**
 * Custom API Error class
 * Provides structured error information from API responses
 */

export interface ApiErrorData {
  message: string;
  code?: string;
  field?: string;
  details?: any;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly field?: string;
  public readonly details?: any;

  constructor(
    message: string,
    status: number = 500,
    data?: Partial<ApiErrorData>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = data?.code;
    this.field = data?.field;
    this.details = data?.details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }

  /**
   * Check if error is a not found error
   */
  isNotFoundError(): boolean {
    return this.status === 404;
  }

  /**
   * Check if error is a server error
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if (this.isAuthError()) {
      return 'You do not have permission to perform this action.';
    }
    
    if (this.isValidationError()) {
      return this.message || 'Please check your input and try again.';
    }
    
    if (this.isNotFoundError()) {
      return 'The requested resource was not found.';
    }
    
    if (this.isServerError()) {
      return 'A server error occurred. Please try again later.';
    }
    
    return this.message || 'An unexpected error occurred.';
  }

  /**
   * Create ApiError from axios error
   */
  static fromAxiosError(error: any): ApiError {
    const status = error.response?.status || 500;
    const data = error.response?.data;
    
    const message = data?.error || data?.message || error.message || 'An error occurred';
    const code = data?.code;
    const field = data?.field;
    const details = data?.details;

    return new ApiError(message, status, { code, field, details });
  }
}
