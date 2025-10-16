import { useToast } from '../hooks/use-toast';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN'
}

// Error interface
export interface AppError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  details?: any;
}

// Create standardized error object
export const createError = (error: any): AppError => {
  // Network errors
  if (!error.response) {
    return {
      type: ErrorType.NETWORK,
      message: 'Network error. Please check your connection and try again.',
    };
  }

  const { status, data } = error.response;

  // Authentication errors
  if (status === 401) {
    return {
      type: ErrorType.AUTH,
      message: data.message || 'Authentication failed. Please log in again.',
      statusCode: status,
      details: data
    };
  }

  // Forbidden errors
  if (status === 403) {
    return {
      type: ErrorType.AUTH,
      message: data.message || 'You do not have permission to perform this action.',
      statusCode: status,
      details: data
    };
  }

  // Validation errors
  if (status === 400) {
    return {
      type: ErrorType.VALIDATION,
      message: data.message || 'Invalid input. Please check your data and try again.',
      statusCode: status,
      details: data
    };
  }

  // Not found errors
  if (status === 404) {
    return {
      type: ErrorType.NOT_FOUND,
      message: data.message || 'The requested resource was not found.',
      statusCode: status,
      details: data
    };
  }

  // Server errors
  if (status >= 500) {
    return {
      type: ErrorType.SERVER,
      message: 'Server error. Please try again later.',
      statusCode: status,
      details: data
    };
  }

  // Unknown errors
  return {
    type: ErrorType.UNKNOWN,
    message: data.message || 'An unexpected error occurred.',
    statusCode: status,
    details: data
  };
};

// React hook for handling errors in components
export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = (error: any) => {
    const appError = createError(error);
    
    // Display toast notification
    toast({
      title: getErrorTitle(appError.type),
      description: appError.message,
      variant: 'destructive',
    });

    // Log error to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', appError);
    }

    return appError;
  };

  return { handleError };
};

// Get appropriate error title based on error type
const getErrorTitle = (errorType: ErrorType): string => {
  switch (errorType) {
    case ErrorType.NETWORK:
      return 'Connection Error';
    case ErrorType.AUTH:
      return 'Authentication Error';
    case ErrorType.VALIDATION:
      return 'Validation Error';
    case ErrorType.SERVER:
      return 'Server Error';
    case ErrorType.NOT_FOUND:
      return 'Not Found';
    default:
      return 'Error';
  }
};