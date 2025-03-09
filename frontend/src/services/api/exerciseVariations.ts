import apiClient from './client';
import { ApiResponse } from './errorHandler';
import { ExerciseVariation, CreateExerciseVariationDto } from '../types';

export const ExerciseVariationService = {
  async getVariationsByExerciseId(exerciseId: number): Promise<ApiResponse<ExerciseVariation[]>> {
    return apiClient.get(`/exercise-variations/exercise/${exerciseId}`);
  },

  async getVariationById(id: number): Promise<ApiResponse<ExerciseVariation>> {
    return apiClient.get(`/exercise-variations/${id}`);
  },

  async createVariation(variationData: CreateExerciseVariationDto): Promise<ApiResponse<ExerciseVariation>> {
    return apiClient.post('/exercise-variations', variationData);
  },

  async deleteVariation(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/exercise-variations/${id}`);
  }
};
