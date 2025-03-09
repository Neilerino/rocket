type ApiErrorCode = 
  | 'NETWORK_ERROR' 
  | 'UNAUTHORIZED' 
  | 'NOT_FOUND' 
  | 'BAD_REQUEST' 
  | 'SERVER_ERROR'
  | 'VALIDATION_ERROR';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: Record<string, any>;
}

export const isApiError = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { error: ApiError } => {
  return !response.success && !!response.error;
};

export const handleApiError = (error: ApiError): never => {
  // Log the error or send it to an error tracking service
  console.error(`API Error: ${error.code} - ${error.message}`, error.details);
  
  // You could implement custom error handling logic based on error codes
  switch (error.code) {
    case 'UNAUTHORIZED':
      // Redirect to login or refresh token
      break;
    case 'VALIDATION_ERROR':
      // Handle validation errors differently
      break;
    case 'SERVER_ERROR':
      // Show a server error message
      break;
  }
  
  throw error;
};
