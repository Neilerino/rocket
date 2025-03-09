import apiClient from './client';
import { ApiResponse } from './errorHandler';
import { PlanInterval, CreatePlanIntervalDto } from '../types';

export const IntervalService = {
  async getIntervalsByPlanId(planId: number): Promise<ApiResponse<PlanInterval[]>> {
    return apiClient.get(`/plans/${planId}/intervals`);
  },

  async getIntervalById(id: number): Promise<ApiResponse<PlanInterval>> {
    return apiClient.get(`/intervals/${id}`);
  },

  async createInterval(intervalData: CreatePlanIntervalDto): Promise<ApiResponse<PlanInterval>> {
    return apiClient.post('/intervals', intervalData);
  },

  async updateInterval(id: number, updateData: Partial<CreatePlanIntervalDto>): Promise<ApiResponse<PlanInterval>> {
    return apiClient.put(`/intervals/${id}`, updateData);
  },

  async deleteInterval(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/intervals/${id}`);
  },
  
  async reorderIntervals(planId: number, intervalIds: number[]): Promise<ApiResponse<PlanInterval[]>> {
    return apiClient.put(`/plans/${planId}/intervals/reorder`, { intervalIds });
  }
};
