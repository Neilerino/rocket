import { QueryClient } from '@tanstack/react-query';

/**
 * Configure the React Query client with default options
 * 
 * This client is used for all data fetching operations in the application
 * and provides caching, refetching, and state management capabilities.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default staleTime - how long data is considered fresh
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // Default cacheTime - how long inactive data remains in cache
      gcTime: 1000 * 60 * 10, // 10 minutes
      
      // Default retry configuration
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Default refetch behavior
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      // Default retry configuration for mutations
      retry: 0,
    },
  },
});

export default queryClient;
