import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { NotFoundError, ValidationError, ApiResponse } from '../types/index.js';
import openaiService from '../services/openaiService.js';
import { logger } from '../utils/index.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

/**
 * POST /api/transcriptions/upload
 * Upload and transcribe audio file
 */
router.post(
  '/upload',
  authenticate,
  upload.single('audio'),
  asyncHandler(async (req: any, res) => {
    const { meetingId, language = 'de' } = req.body;
    const userId = req.userId;

    if (!req.file) {
      throw new ValidationError('Audio file is required');
    }

    if (!meetingId) {
      throw new ValidationError('Meeting ID is required');
    }

    logger.info('📁 Processing audio file', {
      fileName: req.file.originalname,
      size: req.file.size,
      meetingId,
    });

    // Check meeting exists and user has access
    const meetingResult = await pool.query(
      'SELECT id, organizer_id FROM meetings WHERE id = $1',
      [meetingId]
    );

    if (meetingResult.rows.length === 0) {
      throw new NotFoundError('Meeting', meetingId);
    }

    const meeting = meetingResult.rows[0];
    if (meeting.organizer_id !== userId) {
      throw new ValidationError('You do not have permission to transcribe this meeting');
    }

    // Transcribe audio
    logger.info('🎙️ Starting transcription...');
    const transcriptionResult = await openaiService.transcribeAudio(req.file.buffer, {
      language,
      fileName: req.file.originalname,
    });

    const transcriptId = uuidv4();

    // Save transcript
    await pool.query(
      `INSERT INTO transcripts (id, meeting_id, content, language, duration_seconds)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        transcriptId,
        meetingId,
        transcriptionResult.text,
        language,
        transcriptionResult.duration,
      ]
    );

    // Save segments
    for (const segment of transcriptionResult.segments) {
      const [mins, secs] = segment.timestamp.split(':').map(Number);
      const startTime = mins * 60 + secs;

      await pool.query(
        `INSERT INTO transcript_segments
         (id, transcript_id, speaker_name, start_time, end_time, content, confidence_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          uuidv4(),
          transcriptId,
          'Speaker',
          startTime,
          startTime + 10,
          segment.text,
          segment.confidence,
        ]
      );
    }

    // Update meeting
    await pool.query(
      `UPDATE meetings 
       SET duration_seconds = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [transcriptionResult.duration, meetingId]
    );

    logger.info('✅ Transcription completed', {
      transcriptId,
      segments: transcriptionResult.segments.length,
    });

    res.status(201).json({
      success: true,
      data: {
        transcriptId,
        text: transcriptionResult.text,
        segmentCount: transcriptionResult.segments.length,
        language: transcriptionResult.language,
        duration: transcriptionResult.duration,
      },
      message: 'Audio transcribed successfully',
      statusCode: 201,
      timestamp: new Date(),
    } as ApiResponse);
  })
);

/**
 * GET /api/transcriptions/:meetingId
 * Get transcript for meeting
 */
router.get(
  '/:meetingId',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const { meetingId } = req.params;
    const userId = req.userId;

    // Get transcript
    const transcriptResult = await pool.query(
      `SELECT * FROM transcripts WHERE meeting_id = $1`,
      [meetingId]
    );

    if (transcriptResult.rows.length === 0) {
      throw new NotFoundError('Transcript for meeting', meetingId);
    }

    const transcript = transcriptResult.rows[0];

    // Get segments
    const segmentsResult = await pool.query(
      `SELECT * FROM transcript_segments 
       WHERE transcript_id = $1 
       ORDER BY start_time ASC`,
      [transcript.id]
    );

    logger.info('✅ Transcript retrieved', { meetingId });

    res.json({
      success: true,
      data: {
        transcript: {
          id: transcript.id,
          meetingId: transcript.meeting_id,
          content: transcript.content,
          language: transcript.language,
          durationSeconds: transcript.duration_seconds,
          segments: segmentsResult.rows.map((row) => ({
            id: row.id,
            speakerName: row.speaker_name,
            startTime: row.start_time,
            endTime: row.end_time,
            content: row.content,
            isEdited: row.is_edited,
            confidenceScore: row.confidence_score,
          })),
          createdAt: transcript.created_at,
        },
      },
      statusCode: 200,
      timestamp: new Date(),
    } as ApiResponse);
  })
);

/**
 * PATCH /api/transcriptions/:transcriptId/segments/:segmentId
 * Update transcript segment
 */
router.patch(
  '/:transcriptId/segments/:segmentId',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const { transcriptId, segmentId } = req.params;
    const { content, speakerName } = req.body;
    const userId = req.userId;

    if (!content && !speakerName) {
      throw new ValidationError('Content or speaker name required for update');
    }

    // Check segment exists
    const segmentResult = await pool.query(
      `SELECT ts.* FROM transcript_segments ts
       JOIN transcripts t ON ts.transcript_id = t.id
       WHERE ts.id = $1 AND ts.transcript_id = $2`,
      [segmentId, transcriptId]
    );

    if (segmentResult.rows.length === 0) {
      throw new NotFoundError('Transcript segment', segmentId);
    }

    // Update segment
    const updates = [];
    const values = [segmentId, userId];
    let paramIndex = 3;

    if (content) {
      updates.push(`content = $${paramIndex++}`);
      values.push(content);
    }
    if (speakerName) {
      updates.push(`speaker_name = $${paramIndex++}`);
      values.push(speakerName);
    }

    updates.push('is_edited = true');
    updates.push(`edited_by = $${paramIndex++}`);
    values.push(userId);

    await pool.query(
      `UPDATE transcript_segments 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      values
    );

    logger.info('✅ Segment updated', { segmentId });

    res.json({
      success: true,
      message: 'Segment updated successfully',
      statusCode: 200,
      timestamp: new Date(),
    } as ApiResponse);
  })
);

/**
 * DELETE /api/transcriptions/:transcriptId
 * Delete transcript
 */
router.delete(
  '/:transcriptId',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const { transcriptId } = req.params;

    // Delete segments first
    await pool.query('DELETE FROM transcript_segments WHERE transcript_id = $1', [
      transcriptId,
    ]);

    // Delete transcript
    const result = await pool.query('DELETE FROM transcripts WHERE id = $1 RETURNING *', [
      transcriptId,
    ]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Transcript', transcriptId);
    }

    logger.info('✅ Transcript deleted', { transcriptId });

    res.json({
      success: true,
      message: 'Transcript deleted successfully',
      statusCode: 200,
      timestamp: new Date(),
    } as ApiResponse);
  })
);

export default router;
