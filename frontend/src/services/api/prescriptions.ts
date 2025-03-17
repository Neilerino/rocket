import apiClient from './client';
import { ApiResponse } from './errorHandler';
import { IntervalExercisePrescription, CreatePrescriptionDto } from '../types';

export interface PrescriptionFilters {
  groupId?: number;
  intervalId?: number;
  id?: number;
}

interface PaginationParams {
  limit?: number;
  offset?: number;
}

export const PrescriptionService = {
  async getPrescriptions(
    filters: PrescriptionFilters,
    pagination: PaginationParams = { limit: 100, offset: 0 },
  ): Promise<ApiResponse<IntervalExercisePrescription[]>> {
    return apiClient.get('/interval-exercise-prescriptions', {
      params: {
        ...filters,
        ...pagination,
      },
    });
  },

  async getPrescriptionsByGroupId(groupId: number): Promise<ApiResponse<IntervalExercisePrescription[]>> {
    return this.getPrescriptions({ groupId });
  },

  async getPrescriptionsByIntervalId(intervalId: number): Promise<ApiResponse<IntervalExercisePrescription[]>> {
    return this.getPrescriptions({ intervalId });
  },

  /**
   * Create a new prescription
   */
  async createPrescription(prescriptionData: CreatePrescriptionDto): Promise<ApiResponse<IntervalExercisePrescription>> {
    return apiClient.post('/interval-exercise-prescriptions', prescriptionData);
  },

  /**
   * Delete a prescription
   */
  async deletePrescription(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/interval-exercise-prescriptions/${id}`);
  }
};
