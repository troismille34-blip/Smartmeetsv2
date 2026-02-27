// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  companyId?: string;
  role: 'admin' | 'user' | 'guest';
  outlookId?: string;
  googleId?: string;
  timezone: string;
  language: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  companyId?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  expiresIn: string;
}

// Meeting Types
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  organizerId: string;
  companyId?: string;
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'recording' | 'completed' | 'cancelled';
  recordingUrl?: string;
  videoUrl?: string;
  durationSeconds?: number;
  participantCount: number;
  isRecording: boolean;
  isPublic: boolean;
  meetingLink?: string;
  outlookEventId?: string;
  googleEventId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateMeetingInput {
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  attendees?: string[]; // Email addresses
  sendInvitations?: boolean;
}

export interface UpdateMeetingInput {
  title?: string;
  description?: string;
  status?: string;
}

// Meeting Participant Types
export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId?: string;
  email: string;
  name: string;
  role: 'organizer' | 'participant';
  joinTime?: Date;
  leaveTime?: Date;
  isOrganizer: boolean;
  responseStatus: 'pending' | 'accepted' | 'declined' | 'tentative';
  speakerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transcript Types
export interface Transcript {
  id: string;
  meetingId: string;
  content: string;
  language: string;
  dialect: string;
  durationSeconds: number;
  confidenceScore: number;
  isEdited: boolean;
  segments: TranscriptSegment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TranscriptSegment {
  id: string;
  transcriptId: string;
  participantId?: string;
  speakerName: string;
  startTime: number; // seconds
  endTime: number; // seconds
  content: string;
  isEdited: boolean;
  editedBy?: string;
  confidenceScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateSegmentInput {
  speakerName?: string;
  content?: string;
}

// Action Item Types
export interface ActionItem {
  id: string;
  meetingId: string;
  taskDescription: string;
  assigneeId?: string;
  assigneeEmail?: string;
  dueDate?: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'completed';
  timestampInMeeting?: number;
  segmentId?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Meeting Summary Types
export interface MeetingSummary {
  id: string;
  meetingId: string;
  executiveSummary: string;
  keyTopics: string[];
  decisions: Record<string, unknown>;
  nextSteps: string[];
  sentimentScore: number;
  keySpeakers: string[];
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

// Calendar Integration Types
export interface CalendarInvitation {
  id: string;
  meetingId: string;
  recipientEmail: string;
  recipientName?: string;
  invitationType: 'email' | 'teams' | 'slack';
  outlookEventId?: string;
  googleEventId?: string;
  sentAt?: Date;
  responseReceivedAt?: Date;
  responseStatus: 'pending' | 'accepted' | 'declined' | 'tentative';
  createdAt: Date;
  updatedAt: Date;
}

// Speaker Profile Types
export interface SpeakerProfile {
  id: string;
  userId: string;
  voiceFingerprint?: Buffer;
  knownNames: string[];
  accent?: string;
  languageProficiency?: string;
  speakingPace?: number;
  confidenceThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
  timestamp: Date;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Request Extensions
export interface AuthenticatedRequest {
  userId?: string;
  userEmail?: string;
  user?: User;
}

export interface TranscriptionRequest {
  audioBuffer: Buffer;
  mimeType: string;
  fileName: string;
  language?: string;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  duration: number;
  segments: Array<{
    timestamp: string;
    text: string;
    confidence: number;
  }>;
}

// Error Types
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    super(404, `${entity} not found${id ? ` with id: ${id}` : ''}`, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}
