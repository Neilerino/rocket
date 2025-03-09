import apiClient from './client';
import { ApiResponse } from './errorHandler';
import { PlanInterval, CreatePlanIntervalDto } from '../types';

export interface IntervalFilters {
  planId?: number;
  id?: number;
}

interface PaginationParams {
  limit?: number;
  offset?: number;
}

export const IntervalService = {
  async getIntervals(
    filters: IntervalFilters,
    pagination: PaginationParams = { limit: 20, offset: 0 },
  ): Promise<ApiResponse<PlanInterval[]>> {
    return apiClient.get('/intervals', {
      params: {
        ...filters,
        ...pagination,
      },
    });
  },

  /**
   * Create a new interval with the required description field
   */
  async createInterval(intervalData: CreatePlanIntervalDto): Promise<ApiResponse<PlanInterval>> {
    return apiClient.post('/intervals', intervalData);
  },

  /**
   * Update an existing interval
   */
  async updateInterval(
    id: number,
    updateData: Partial<CreatePlanIntervalDto>,
  ): Promise<ApiResponse<PlanInterval>> {
    return apiClient.put(`/intervals/${id}`, updateData);
  },

  /**
   * Delete an interval
   */
  async deleteInterval(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/intervals/${id}`);
  },

  /**
   * Reorder intervals within a plan
   */
  async reorderIntervals(
    planId: number,
    intervalIds: number[],
  ): Promise<ApiResponse<PlanInterval[]>> {
    return apiClient.put(`/plans/${planId}/intervals/reorder`, { intervalIds });
  },
};
