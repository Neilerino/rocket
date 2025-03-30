import { ParameterTypeFilters } from '../../api';

interface ParameterTypeCacheKeyOptions {
  filters?: ParameterTypeFilters;
}

/**
 * Creates a consistent cache key for ParameterType queries.
 * Includes base key and any provided filters (userId, parameterTypeId, page, pageSize).
 */
export const createParameterTypeCacheKey = (options: ParameterTypeCacheKeyOptions = {}) => {
  const { filters = {} } = options;
  const baseKey = ['parameterTypes']; // Use a consistent base key

  // Add specific filters to the cache key if they exist
  if (filters.userId !== undefined) {
    baseKey.push('user', String(filters.userId));
  }

  if (filters.parameterTypeId !== undefined) {
    baseKey.push('type', String(filters.parameterTypeId));
  }

  // Add pagination filters if they exist
  if (filters.page !== undefined) {
    baseKey.push('page', String(filters.page));
  }

  if (filters.pageSize !== undefined) {
    baseKey.push('pageSize', String(filters.pageSize));
  }

  // Return the complete key array
  return baseKey;
};
