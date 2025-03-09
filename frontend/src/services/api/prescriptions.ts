import apiClient from './client';
import { ApiResponse } from './errorHandler';
import { IntervalExercisePrescription, CreatePrescriptionDto } from '../types';

export const PrescriptionService = {
  async getPrescriptionsByGroupId(groupId: number): Promise<ApiResponse<IntervalExercisePrescription[]>> {
    return apiClient.get(`/interval-exercise-prescriptions/group/${groupId}`);
  },

  async getPrescriptionsByIntervalId(intervalId: number): Promise<ApiResponse<IntervalExercisePrescription[]>> {
    return apiClient.get(`/interval-exercise-prescriptions/interval/${intervalId}`);
  },

  async createPrescription(prescriptionData: CreatePrescriptionDto): Promise<ApiResponse<IntervalExercisePrescription>> {
    return apiClient.post('/interval-exercise-prescriptions', prescriptionData);
  },

  async deletePrescription(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/interval-exercise-prescriptions/${id}`);
  }
};
