<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# 

---

# Frontend Service Module Design for Training Plan API

## Architecture Overview

This service module implements a layered architecture optimized for React Query integration:

```
src/
├── services/
│   ├── api/
│   │   ├── client.ts        # Axios instance with interceptors
│   │   ├── plans.ts         # Plan-related endpoints
│   │   ├── intervals.ts     # Interval operations
│   │   └── ...             # Other resource modules
│   ├── hooks/
│   │   ├── plans/
│   │   │   ├── usePlans.ts
│   │   │   └── usePlanMutations.ts
│   │   └── ...             # Other hook categories
│   └── types/
│       └── api.ts          # TypeScript interfaces
```


## Core Components

### 1. API Client Configuration

```typescript
// services/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Version': '1.0'
  }
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  response => ({
    success: true,
    data: response.data.data,
    meta: response.data.meta
  }),
  error => ({
    success: false,
    error: error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: 'Connection problem'
    }
  })
);

export default apiClient;
```


### 2. Resource Service Modules

```typescript
// services/api/plans.ts
import apiClient from './client';

interface PlanFilters {
  isTemplate?: boolean;
  isPublic?: boolean;
  tags?: string[];
}

export const PlanService = {
  async getPlans(filters: PlanFilters, pagination = { limit: 20, offset: 0 }) {
    return apiClient.get('/plans', {
      params: {
        ...filters,
        ...pagination
      }
    });
  },

  async getPlanById(id: string) {
    return apiClient.get(`/plans/${id}`);
  },

  async createPlan(planData: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>) {
    return apiClient.post('/plans', planData);
  },

  async updatePlan(id: string, updateData: Partial<Plan>) {
    return apiClient.put(`/plans/${id}`, updateData);
  },

  async deletePlan(id: string) {
    return apiClient.delete(`/plans/${id}`);
  }
};
```


### 3. React Query Hooks

```typescript
// services/hooks/plans/usePlans.ts
import { useQuery } from '@tanstack/react-query';
import { PlanService } from '../../api/plans';

export const usePlans = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['plans', filters],
    queryFn: () => PlanService.getPlans(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

export const usePlanById = (planId: string, options = {}) => {
  return useQuery({
    queryKey: ['plans', planId],
    queryFn: () => PlanService.getPlanById(planId),
    enabled: !!planId,
    ...options
  });
};
```


### 4. Mutation Hooks with Optimistic Updates

```typescript
// services/hooks/plans/usePlanMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlanService } from '../../api/plans';

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: PlanService.createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    }
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => PlanService.updatePlan(id, data),
    onMutate: async updatedPlan => {
      await queryClient.cancelQueries(['plans', updatedPlan.id]);
      const previousPlan = queryClient.getQueryData(['plans', updatedPlan.id]);
      
      queryClient.setQueryData(['plans', updatedPlan.id], updatedPlan);
      return { previousPlan };
    },
    onError: (err, variables, context) => {
      if (context?.previousPlan) {
        queryClient.setQueryData(
          ['plans', variables.id],
          context.previousPlan
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['plans']);
    }
  });
};
```


## Key Features

### 1. Pagination Support

```typescript
export const usePaginatedPlans = (filters = {}, pageSize = 20) => {
  return useInfiniteQuery({
    queryKey: ['plans', 'infinite', filters],
    queryFn: ({ pageParam = 0 }) => 
      PlanService.getPlans(filters, { limit: pageSize, offset: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.meta.total > allPages.length * pageSize 
        ? allPages.length * pageSize 
        : undefined;
    }
  });
};
```


### 2. Error Handling

```typescript
// services/api/errorHandler.ts
export const handleApiError = (error: ApiError) => {
  switch (error.code) {
    case 'UNAUTHORIZED':
      // Redirect to login
      break;
    case 'VALIDATION_ERROR':
      // Format validation errors
      return formatValidationErrors(error.details);
    default:
      return error.message;
  }
};

// Usage in components
const { error } = usePlans();
if (error) {
  const message = handleApiError(error);
  showToast(message);
}
```


### 3. Type Safety

```typescript
// services/types/api.ts
export interface Plan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isTemplate: boolean;
  isPublic: boolean;
  tags?: string[];
  intervals?: PlanInterval[];
}

export interface PlanInterval {
  id: string;
  planId: string;
  name: string;
  duration: string;
  order: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```


## Usage Example

```tsx
// components/PlanList.tsx
import { usePlans, useDeletePlan } from '../services/hooks/plans';

const PlanList = () => {
  const { data, isLoading, error } = usePlans({ isTemplate: false });
  const deleteMutation = useDeletePlan();

  if (isLoading) return <Loader />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {data?.map(plan => (
        <div key={plan.id}>
          <h3>{plan.name}</h3>
          <button 
            onClick={() => deleteMutation.mutate(plan.id)}
            disabled={deleteMutation.isLoading}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};
```


## Best Practices

1. **Query Key Management**
    - Use consistent query key structures
    - Centralize key generation functions

```ts
export const planKeys = {
  all: ['plans'] as const,
  lists: () => [...planKeys.all, 'list'],
  details: (id: string) => [...planKeys.all, id]
};
```

2. **Cache Configuration**

```ts
// app.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => 
        error.code !== 401 && failureCount < 3
    }
  }
});
```

3. **Webhook Integration**

```ts
// services/api/webhooks.ts
export const WebhookService = {
  subscribe: (events: string[], callbackUrl: string) => 
    apiClient.post('/webhooks', { events, url: callbackUrl }),
  
  handleEvent: (event: WebhookEvent) => {
    queryClient.invalidateQueries({
      predicate: query => 
        shouldInvalidateQuery(query, event)
    });
  }
};
```

4. **Analytics Integration**

```ts
// services/hooks/analytics/useTrainingVolume.ts
export const useTrainingVolume = (params: VolumeParams) => {
  return useQuery({
    queryKey: ['analytics', 'volume', params],
    queryFn: () => AnalyticsService.getVolumeData(params),
    keepPreviousData: true
  });
};
```


This service architecture provides:

- Full type safety with TypeScript
- Consistent error handling
- Optimized caching strategies
- Scalable structure for API endpoint additions
- Reusable hook patterns
- Comprehensive test coverage capabilities

The modular design allows individual resource services to be developed and maintained independently while maintaining consistent patterns across the application.

<div style="text-align: center">⁂</div>

[^1]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/56319419/0d591a2a-0f45-4a0a-af28-f6fe30f76fb5/paste.txt

