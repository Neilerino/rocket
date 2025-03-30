import apiClient from './client';
import { ApiResponse } from './errorHandler';
import { ParameterType } from '../types';

/**
 * Filters for listing parameter types.
 * Includes optional user ID, parameter type ID, and pagination.
 */
export interface ParameterTypeFilters {
  userId?: number;
  parameterTypeId?: number;
}

interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * Data Transfer Object for creating a new ParameterType.
 * `userId` is assumed to be required based on List API filters.
 */
export interface CreateParameterTypeDto {
  name: string;
  dataType: string; // e.g., 'integer', 'float', 'string', 'boolean', 'enum'
  defaultUnit: string; // e.g., 'kg', 'lbs', 'meters', 'seconds', 'mm'
  userId: number; // Assuming this is required for creation context
  minValue?: number;
  maxValue?: number;
}

/**
 * Fetches a list of ParameterTypes based on optional filters.
 * @param filters - Optional filters for user ID, parameter type ID, and pagination.
 * @returns A promise that resolves to an array of ParameterType objects.
 */

export const ParameterTypeService = {
  async getParameterTypes(
    filters: ParameterTypeFilters,
    pagination: PaginationParams = { limit: 20, offset: 0 },
  ): Promise<ApiResponse<ParameterType[]>> {
    return await apiClient.get<ParameterType[]>('/parameter-types', {
      params: { ...filters, ...pagination },
    });
  },

  async createParameterType(data: CreateParameterTypeDto): Promise<ApiResponse<ParameterType>> {
    return apiClient.post('/parameter-types', data);
  },
};
