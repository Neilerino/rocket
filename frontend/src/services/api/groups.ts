import apiClient from './client';
import { ApiResponse } from './errorHandler';
import { Group, CreateGroupDto, UpdateGroupDto } from '../types';

export const GroupService = {
  async getGroupsByPlanId(planId: number): Promise<ApiResponse<Group[]>> {
    return apiClient.get(`/groups/plan/${planId}`);
  },

  async getGroupById(id: number): Promise<ApiResponse<Group>> {
    return apiClient.get(`/groups/${id}`);
  },

  async createGroup(groupData: CreateGroupDto): Promise<ApiResponse<Group>> {
    return apiClient.post('/groups', groupData);
  },

  async updateGroup(id: number, updateData: UpdateGroupDto): Promise<ApiResponse<Group>> {
    return apiClient.put(`/groups/${id}`, updateData);
  },

  async deleteGroup(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/groups/${id}`);
  },

  async assignGroupToInterval(groupId: number, intervalId: number): Promise<ApiResponse<void>> {
    return apiClient.post(`/groups/${groupId}/intervals/${intervalId}`, {});
  },

  async removeGroupFromInterval(groupId: number, intervalId: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/groups/${groupId}/intervals/${intervalId}`);
  }
};
