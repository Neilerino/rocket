import apiClient from './client';
import { ApiResponse } from './errorHandler';
import {
  Exercise,
  CreateExerciseDto,
  UpdateExerciseDto,
  ExerciseVariation,
  CreateExerciseVariationDto,
} from '../types';

export interface ExerciseFilters {
  id?: number;
  userId?: number;
  planId?: number;
  groupId?: number;
  intervalId?: number;
}

export interface ExerciseVariationFilters {
  variationId?: number;
  exerciseId?: number;
  userId?: number;
  planId?: number;
  groupId?: number;
  intervalId?: number;
}

interface PaginationParams {
  limit?: number;
  offset?: number;
}

export const ExerciseService = {
  async getExercises(
    filters: ExerciseFilters,
    pagination: PaginationParams = { limit: 100, offset: 0 },
  ): Promise<ApiResponse<Exercise[]>> {
    return apiClient.get('/exercises', {
      params: {
        ...filters,
        ...pagination,
      },
    });
  },

  async getExerciseVariations(
    filters: ExerciseVariationFilters,
    pagination: PaginationParams = { limit: 100, offset: 0 },
  ): Promise<ApiResponse<ExerciseVariation[]>> {
    return apiClient.get('/exercise-variations', {
      params: {
        ...filters,
        ...pagination,
      },
    });
  },

  async getExerciseById(id: number): Promise<ApiResponse<Exercise>> {
    return apiClient.get(`/exercises/${id}`);
  },

  async createExercise(exerciseData: CreateExerciseDto): Promise<ApiResponse<Exercise>> {
    return apiClient.post('/exercises', exerciseData);
  },

  async updateExercise(id: number, updateData: UpdateExerciseDto): Promise<ApiResponse<Exercise>> {
    return apiClient.put(`/exercises/${id}`, updateData);
  },

  async deleteExercise(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/exercises/${id}`);
  },

  async createExerciseVariation(
    variationData: CreateExerciseVariationDto,
  ): Promise<ApiResponse<ExerciseVariation>> {
    return apiClient.post(`/exercises/${variationData.exerciseId}/create-variation`, variationData);
  },

  async deleteExerciseVariation(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/exercise-variations/${id}`);
  },
};
