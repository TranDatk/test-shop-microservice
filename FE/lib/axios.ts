import axios from 'axios';
import { toast } from 'sonner';

// Create a custom axios instance with base configuration
const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    // Handle different error scenarios
    if (status === 401) {
      // Check if this is a login request
      const isLoginRequest = error.config?.url?.includes('/api/auth/login');
      
      if (isLoginRequest) {
        // Don't redirect on login failures
        toast.error('Invalid email or password. Please try again.');
      } else {
        // For other 401 errors, redirect to login
        window.location.href = '/auth/login';
        toast.error('Please log in to continue');
      }
    } else if (status === 403) {
      // Forbidden - user doesn't have sufficient permissions
      toast.error('You don\'t have permission to access this resource');
    } else if (status === 500) {
      // Server error
      toast.error('Something went wrong on our end');
    } else if (error.code === 'ERR_NETWORK') {
      // Network error
      toast.error('Unable to connect to the server');
    } else {
      // Other errors
      const message = error.response?.data?.error || 'Something went wrong';
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 