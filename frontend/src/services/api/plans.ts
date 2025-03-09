import apiClient from './client';
import { ApiResponse } from './errorHandler';
import { Plan, CreatePlanDto, UpdatePlanDto } from '../types';

interface PlanFilters {
  id?: number;
  userId?: number;
}

interface PaginationParams {
  limit?: number;
  offset?: number;
}

export const PlanService = {
  async getPlans(
    filters: PlanFilters,
    pagination: PaginationParams = { limit: 20, offset: 0 },
  ): Promise<ApiResponse<Plan[]>> {
    return apiClient.get('/plans', {
      params: {
        ...filters,
        ...pagination,
      },
    });
  },

  async getPlanById(id: number): Promise<ApiResponse<Plan>> {
    return apiClient.get(`/plans/${id}`);
  },

  async getPlansByUserId(userId: number): Promise<ApiResponse<Plan[]>> {
    return apiClient.get(`/plans/user/${userId}`);
  },

  async createPlan(planData: CreatePlanDto): Promise<ApiResponse<Plan>> {
    return apiClient.post('/plans', planData);
  },

  async updatePlan(id: number, updateData: UpdatePlanDto): Promise<ApiResponse<Plan>> {
    return apiClient.put(`/plans/${id}`, updateData);
  },

  async deletePlan(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/plans/${id}`);
  },
};
