import { PrescriptionFilters } from '../../api/prescriptions';

interface PrescriptionCacheKeyOptions {
  filters?: PrescriptionFilters;
}

/**
 * Creates a consistent cache key for prescription queries
 */
export const createPrescriptionCacheKey = (options: PrescriptionCacheKeyOptions = {}) => {
  const { filters = {} } = options;
  const baseKey = ['prescriptions'];
  
  // Add filters to the cache key
  if (filters.groupId) {
    baseKey.push('group', String(filters.groupId));
  }
  
  if (filters.intervalId) {
    baseKey.push('interval', String(filters.intervalId));
  }
  
  if (filters.id) {
    baseKey.push('id', String(filters.id));
  }
  
  return baseKey;
};
