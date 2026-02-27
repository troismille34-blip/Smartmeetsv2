import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'secure_password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'smartmeets',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('🔴 Unexpected error on idle client', err);
});

export const initializeDatabase = async () => {
  try {
    console.log('📊 Initializing database schema...');

    // 1. USERS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255),
        avatar_url TEXT,
        company_id UUID,
        role VARCHAR(50) DEFAULT 'user',
        outlook_id VARCHAR(255),
        outlook_email VARCHAR(255),
        outlook_token TEXT,
        google_id VARCHAR(255),
        google_token TEXT,
        phone VARCHAR(20),
        timezone VARCHAR(50) DEFAULT 'Europe/Zurich',
        language VARCHAR(10) DEFAULT 'de',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
    `);

    // 2. COMPANIES TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255) UNIQUE,
        logo_url TEXT,
        subscription_plan VARCHAR(50) DEFAULT 'starter',
        max_users INT DEFAULT 5,
        max_meetings INT DEFAULT 20,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. MEETINGS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company_id UUID REFERENCES companies(id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        status VARCHAR(50) DEFAULT 'scheduled',
        recording_url TEXT,
        video_url TEXT,
        duration_seconds INT,
        participant_count INT DEFAULT 0,
        is_recording BOOLEAN DEFAULT false,
        is_public BOOLEAN DEFAULT false,
        meeting_link VARCHAR(255),
        outlook_event_id VARCHAR(255),
        google_event_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_meetings_organizer ON meetings(organizer_id);
      CREATE INDEX IF NOT EXISTS idx_meetings_company ON meetings(company_id);
      CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
    `);

    // 4. MEETING PARTICIPANTS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meeting_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'participant',
        join_time TIMESTAMP,
        leave_time TIMESTAMP,
        is_organizer BOOLEAN DEFAULT false,
        response_status VARCHAR(50) DEFAULT 'pending',
        speaker_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_participants_meeting ON meeting_participants(meeting_id);
      CREATE INDEX IF NOT EXISTS idx_participants_user ON meeting_participants(user_id);
    `);

    // 5. TRANSCRIPTS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transcripts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        content TEXT,
        language VARCHAR(10) DEFAULT 'de',
        dialect VARCHAR(50) DEFAULT 'swiss_german',
        duration_seconds INT,
        confidence_score FLOAT DEFAULT 0.95,
        is_edited BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_transcripts_meeting ON transcripts(meeting_id);
    `);

    // 6. TRANSCRIPT SEGMENTS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transcript_segments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
        participant_id UUID REFERENCES meeting_participants(id) ON DELETE SET NULL,
        speaker_name VARCHAR(255),
        start_time INT NOT NULL,
        end_time INT NOT NULL,
        content TEXT NOT NULL,
        is_edited BOOLEAN DEFAULT false,
        edited_by UUID REFERENCES users(id),
        confidence_score FLOAT DEFAULT 0.95,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_segments_transcript ON transcript_segments(transcript_id);
      CREATE INDEX IF NOT EXISTS idx_segments_time ON transcript_segments(start_time, end_time);
    `);

    // 7. ACTION ITEMS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS action_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        task_description TEXT NOT NULL,
        assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
        assignee_email VARCHAR(255),
        due_date DATE,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'open',
        timestamp_in_meeting INT,
        segment_id UUID REFERENCES transcript_segments(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_actions_meeting ON action_items(meeting_id);
      CREATE INDEX IF NOT EXISTS idx_actions_assignee ON action_items(assignee_id);
      CREATE INDEX IF NOT EXISTS idx_actions_status ON action_items(status);
    `);

    // 8. MEETING SUMMARIES TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meeting_summaries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        executive_summary TEXT,
        key_topics TEXT[],
        decisions JSONB,
        next_steps TEXT[],
        sentiment_score FLOAT,
        key_speakers VARCHAR(255)[],
        duration_minutes INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_summaries_meeting ON meeting_summaries(meeting_id);
    `);

    // 9. SPEAKER PROFILES TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS speaker_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        voice_fingerprint BYTEA,
        known_names TEXT[],
        accent VARCHAR(50),
        language_proficiency VARCHAR(50),
        speaking_pace INT,
        confidence_threshold FLOAT DEFAULT 0.85,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_profiles_user ON speaker_profiles(user_id);
    `);

    // 10. CALENDAR INVITATIONS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS calendar_invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        recipient_email VARCHAR(255) NOT NULL,
        recipient_name VARCHAR(255),
        invitation_type VARCHAR(50) DEFAULT 'email',
        outlook_event_id VARCHAR(255),
        google_event_id VARCHAR(255),
        sent_at TIMESTAMP,
        response_received_at TIMESTAMP,
        response_status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_invitations_meeting ON calendar_invitations(meeting_id);
      CREATE INDEX IF NOT EXISTS idx_invitations_email ON calendar_invitations(recipient_email);
    `);

    // 11. AUDIT LOGS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(100),
        entity_id UUID,
        changes JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_logs_user ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_logs_entity ON audit_logs(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_logs_created ON audit_logs(created_at);
    `);

    console.log('✅ Database schema initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export const closeDatabase = async () => {
  await pool.end();
  console.log('📊 Database connection closed');
};

export default pool;
