// ============================================================================
// SmartMeets V2.0 - TypeScript Types
// ============================================================================

// User & Auth
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// Meeting
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  organizerId: string;
  participants?: Participant[];
  transcript?: Transcript;
  summary?: MeetingSummary;
  actionItems?: ActionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  meetingId: string;
  userId?: string;
  email: string;
  name: string;
  role: 'organizer' | 'attendee' | 'optional';
  status: 'pending' | 'accepted' | 'declined';
}

// Transcript
export interface Transcript {
  id: string;
  meetingId: string;
  status: 'processing' | 'completed' | 'failed';
  language: string;
  duration?: number;
  segments: TranscriptSegment[];
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptSegment {
  id: string;
  transcriptId: string;
  speakerName?: string;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
  isEdited: boolean;
}

// Summary & Action Items
export interface MeetingSummary {
  id: string;
  meetingId: string;
  summary: string;
  keyPoints: string[];
  decisions: string[];
  generatedAt: string;
}

export interface ActionItem {
  id: string;
  meetingId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  status: 'open' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Store States
export interface MeetingState {
  meetings: Meeting[];
  currentMeeting: Meeting | null;
  isLoading: boolean;
  error: string | null;
}

export interface TranscriptState {
  transcript: Transcript | null;
  segments: TranscriptSegment[];
  isLoading: boolean;
  isRecording: boolean;
  error: string | null;
}
