// ============================================================================
// SmartMeets V2.0 - Zustand State Management
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Meeting,
  Transcript,
  TranscriptSegment,
  AuthState,
  MeetingState,
  TranscriptState,
} from '../types';
import { authApi } from '../services/api';

// ============================================================================
// AUTH STORE
// ============================================================================
interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          localStorage.setItem('smartmeets_token', response.token);
          localStorage.setItem('smartmeets_user', JSON.stringify(response.user));
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : 'Login failed. Please check your credentials.';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (email: string, name: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register({ email, name, password });
          localStorage.setItem('smartmeets_token', response.token);
          localStorage.setItem('smartmeets_user', JSON.stringify(response.user));
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : 'Registration failed.';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ignore logout errors
        } finally {
          localStorage.removeItem('smartmeets_token');
          localStorage.removeItem('smartmeets_user');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      setUser: (user: User) => set({ user }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'smartmeets-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ============================================================================
// MEETING STORE
// ============================================================================
interface MeetingStore extends MeetingState {
  setMeetings: (meetings: Meeting[]) => void;
  setCurrentMeeting: (meeting: Meeting | null) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, data: Partial<Meeting>) => void;
  removeMeeting: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMeetingStore = create<MeetingStore>()(
  persist(
    (set) => ({
      meetings: [],
      currentMeeting: null,
      isLoading: false,
      error: null,

      setMeetings: (meetings) => set({ meetings }),

      setCurrentMeeting: (meeting) => set({ currentMeeting: meeting }),

      addMeeting: (meeting) =>
        set((state) => ({ meetings: [...state.meetings, meeting] })),

      updateMeeting: (id, data) =>
        set((state) => ({
          meetings: state.meetings.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
          currentMeeting:
            state.currentMeeting?.id === id
              ? { ...state.currentMeeting, ...data }
              : state.currentMeeting,
        })),

      removeMeeting: (id) =>
        set((state) => ({
          meetings: state.meetings.filter((m) => m.id !== id),
          currentMeeting:
            state.currentMeeting?.id === id ? null : state.currentMeeting,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'smartmeets-meetings',
      partialize: (state) => ({
        meetings: state.meetings,
        currentMeeting: state.currentMeeting,
      }),
    }
  )
);

// ============================================================================
// TRANSCRIPT STORE
// ============================================================================
interface TranscriptStore extends TranscriptState {
  setTranscript: (transcript: Transcript | null) => void;
  setSegments: (segments: TranscriptSegment[]) => void;
  updateSegment: (id: string, data: Partial<TranscriptSegment>) => void;
  setRecording: (isRecording: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearTranscript: () => void;
}

export const useTranscriptStore = create<TranscriptStore>()((set) => ({
  transcript: null,
  segments: [],
  isLoading: false,
  isRecording: false,
  error: null,

  setTranscript: (transcript) =>
    set({ transcript, segments: transcript?.segments || [] }),

  setSegments: (segments) => set({ segments }),

  updateSegment: (id, data) =>
    set((state) => ({
      segments: state.segments.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
    })),

  setRecording: (isRecording) => set({ isRecording }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearTranscript: () => set({ transcript: null, segments: [], error: null }),
}));
