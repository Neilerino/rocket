import apiClient from './client';
import { ApiResponse } from './errorHandler';
import { Exercise, CreateExerciseDto, UpdateExerciseDto } from '../types';

export const ExerciseService = {
  async getExercisesByUserId(userId: number): Promise<ApiResponse<Exercise[]>> {
    return apiClient.get(`/exercises/user/${userId}`);
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
  }
};
