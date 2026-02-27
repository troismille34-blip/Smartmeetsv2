import OpenAI from 'openai';
import { config } from '../config/env.js';
import { logger } from '../utils/index.js';
import { TranscriptionResult } from '../types/index.js';

class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Transcribe audio file using Whisper API
   */
  async transcribeAudio(
    audioBuffer: Buffer,
    options: {
      language?: string;
      temperature?: number;
      fileName?: string;
    } = {}
  ): Promise<TranscriptionResult> {
    try {
      logger.info('🎙️ Starting audio transcription', { fileName: options.fileName });

      const file = new File([audioBuffer], options.fileName || 'audio.webm', {
        type: 'audio/webm',
      });

      const transcription = await this.client.audio.transcriptions.create({
        file,
        model: config.openai.whisperModel,
        language: options.language || 'de',
        temperature: options.temperature || 0.3,
        response_format: 'verbose_json' as any,
      });

      const transcriptionAny = transcription as any;

      logger.info('✅ Transcription completed', {
        textLength: transcription.text.length,
        language: transcriptionAny.language,
      });

      const segments = this.parseTranscription(transcription.text);

      return {
        text: transcription.text,
        language: transcriptionAny.language || 'de',
        duration: Math.round(transcriptionAny.duration || 0),
        segments,
      };
    } catch (error) {
      logger.error('❌ Transcription failed', error);
      throw new Error(`Transcription service error: ${error}`);
    }
  }

  /**
   * Generate meeting summary using GPT-4
   */
  async generateSummary(
    transcript: string,
    meetingTitle?: string
  ): Promise<{
    executiveSummary: string;
    keyTopics: string[];
    decisions: Record<string, string>;
    nextSteps: string[];
  }> {
    try {
      logger.info('📝 Generating meeting summary');

      const prompt = `
Du bist ein Experte für Meeting-Analyse. Analysiere das folgende Meeting-Transkript und gebe folgende Informationen in strukturiertem JSON-Format:

1. executiveSummary: 2-3 Sätze Zusammenfassung
2. keyTopics: Array mit 3-5 Hauptthemen
3. decisions: Objekt mit getroffenen Entscheidungen
4. nextSteps: Array mit nächsten Schritten

Meeting Titel: ${meetingTitle || 'Unnamed Meeting'}

Transkript:
${transcript.substring(0, 4000)}

Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne weitere Erklärungen.`;

      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Assistent für Meeting-Analyse. Antworte immer in JSON-Format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content || '{}';

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const summary = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        executiveSummary: 'Meeting analysiert',
        keyTopics: [],
        decisions: {},
        nextSteps: [],
      };

      logger.info('✅ Summary generation completed');

      return summary;
    } catch (error) {
      logger.error('❌ Summary generation failed', error);
      // Return default summary on error
      return {
        executiveSummary: 'Meeting summary could not be generated',
        keyTopics: [],
        decisions: {},
        nextSteps: [],
      };
    }
  }

  /**
   * Extract action items from transcript
   */
  async extractActionItems(
    transcript: string
  ): Promise<
    Array<{
      task: string;
      assignee?: string;
      dueDate?: string;
      priority: 'high' | 'medium' | 'low';
    }>
  > {
    try {
      logger.info('✅ Extracting action items');

      const prompt = `
Analysiere das folgende Meeting-Transkript und extrahiere alle Action Items/To-Dos.

Für jedes Action Item gib folgendes JSON-Format an:
{
  "task": "Beschreibung der Aufgabe",
  "assignee": "Name des Zuständigen (falls erwähnt)",
  "dueDate": "Termin (falls erwähnt)",
  "priority": "high|medium|low"
}

Transkript:
${transcript}

Antworte mit einem JSON-Array, nichts anderes.`;

      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Assistent zur Extraktion von Action Items. Antworte nur mit JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content || '[]';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const items = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      logger.info('✅ Action items extracted', { count: items.length });

      return items;
    } catch (error) {
      logger.error('❌ Action item extraction failed', error);
      return [];
    }
  }

  /**
   * Detect speaker sentiment
   */
  async analyzeSentiment(text: string): Promise<{
    overall: number; // -1 to 1
    segments: Array<{ text: string; sentiment: number }>;
  }> {
    try {
      logger.info('🎭 Analyzing sentiment');

      const prompt = `
Analysiere die Stimmung des folgenden Textes auf einer Skala von -1 (sehr negativ) bis 1 (sehr positiv).

Gib folgendes JSON-Format zurück:
{
  "overall": <-1 bis 1>,
  "segments": [
    { "text": "Textausschnitt", "sentiment": <-1 bis 1> }
  ]
}

Text:
${text.substring(0, 2000)}`;

      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Sentiment-Analyse-Expert. Antworte nur mit JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = response.choices[0].message.content || '{"overall": 0, "segments": []}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const sentiment = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { overall: 0, segments: [] };

      logger.info('✅ Sentiment analysis completed');

      return sentiment;
    } catch (error) {
      logger.error('❌ Sentiment analysis failed', error);
      return { overall: 0, segments: [] };
    }
  }

  /**
   * Parse transcription into segments with timestamps
   */
  private parseTranscription(text: string): TranscriptionResult['segments'] {
    // Split text into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    // Estimate timing (rough estimate - ~150 words per minute)
    let currentTime = 0;
    const segmentDuration = 10; // seconds per segment

    return sentences.map((sentence, index) => ({
      timestamp: this.formatTime(currentTime),
      text: sentence.trim(),
      confidence: 0.95,
    })).filter(s => s.text.length > 0);
  }

  /**
   * Format seconds to MM:SS
   */
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Test API connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.models.retrieve('gpt-4-turbo-preview');
      logger.info('✅ OpenAI API connection successful');
      return true;
    } catch (error) {
      logger.error('❌ OpenAI API connection failed', error);
      return false;
    }
  }
}

export const openaiService = new OpenAIService();

export default openaiService;
