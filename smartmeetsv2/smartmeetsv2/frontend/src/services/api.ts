// ============================================================================
// SmartMeets V2.0 - API Client (Axios with Interceptors)
// ============================================================================

import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Meeting,
  Transcript,
  TranscriptSegment,
  ApiResponse,
} from '../types';

// Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// REQUEST INTERCEPTOR - Auto-inject JWT token
// ============================================================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('smartmeets_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================================
// RESPONSE INTERCEPTOR - Handle errors globally
// ============================================================================
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth state
      localStorage.removeItem('smartmeets_token');
      localStorage.removeItem('smartmeets_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH API
// ============================================================================
export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('smartmeets_token');
    localStorage.removeItem('smartmeets_user');
  },
};

// ============================================================================
// TRANSCRIPTION API
// ============================================================================
export const transcriptionApi = {
  upload: async (
    audioFile: File,
    meetingId: string,
    language = 'de'
  ): Promise<ApiResponse<Transcript>> => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('meetingId', meetingId);
    formData.append('language', language);

    const response = await apiClient.post<ApiResponse<Transcript>>(
      '/transcriptions/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, // 2 minutes for large files
      }
    );
    return response.data;
  },

  getTranscript: async (meetingId: string): Promise<ApiResponse<Transcript>> => {
    const response = await apiClient.get<ApiResponse<Transcript>>(
      `/transcriptions/${meetingId}`
    );
    return response.data;
  },

  updateSegment: async (
    transcriptId: string,
    segmentId: string,
    data: Partial<TranscriptSegment>
  ): Promise<ApiResponse<TranscriptSegment>> => {
    const response = await apiClient.patch<ApiResponse<TranscriptSegment>>(
      `/transcriptions/${transcriptId}/segments/${segmentId}`,
      data
    );
    return response.data;
  },

  deleteTranscript: async (transcriptId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/transcriptions/${transcriptId}`
    );
    return response.data;
  },
};

// ============================================================================
// MEETINGS API (placeholder for future implementation)
// ============================================================================
export const meetingsApi = {
  getAll: async (): Promise<ApiResponse<Meeting[]>> => {
    const response = await apiClient.get<ApiResponse<Meeting[]>>('/meetings');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Meeting>> => {
    const response = await apiClient.get<ApiResponse<Meeting>>(`/meetings/${id}`);
    return response.data;
  },

  create: async (data: Partial<Meeting>): Promise<ApiResponse<Meeting>> => {
    const response = await apiClient.post<ApiResponse<Meeting>>('/meetings', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Meeting>): Promise<ApiResponse<Meeting>> => {
    const response = await apiClient.put<ApiResponse<Meeting>>(`/meetings/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/meetings/${id}`);
    return response.data;
  },
};

export default apiClient;
