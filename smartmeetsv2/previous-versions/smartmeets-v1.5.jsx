import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, Mic, Download, Send, Settings, Clock, Tag, CheckCircle2,
  AlertCircle, Play, Pause, Square, Copy, Trash2, Save, X, Menu,
  Edit2, ZoomIn, ZoomOut, Home, FileText, BarChart3, MessageSquare,
  ChevronDown, Volume2, Loader
} from 'lucide-react';

// ============================================================================
// DESIGN SYSTEM - Modern & Professional
// ============================================================================

const theme = {
  colors: {
    primary: '#0066FF',
    primaryHover: '#0052CC',
    primaryLight: '#E3F2FD',
    secondary: '#6C757D',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    text: '#1E293B',
    textLight: '#64748B',
    accent: '#8B5CF6',
    accentLight: '#EDE9FE'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px'
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 20px 25px rgba(0, 0, 0, 0.1)',
    xl: '0 25px 50px rgba(0, 0, 0, 0.15)'
  }
};

// ============================================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================================

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: { bg: theme.colors.successLight, border: theme.colors.success, icon: '✓' },
    error: { bg: theme.colors.dangerLight, border: theme.colors.danger, icon: '✕' },
    warning: { bg: theme.colors.warningLight, border: theme.colors.warning, icon: '!' },
    info: { bg: theme.colors.primaryLight, border: theme.colors.primary, icon: 'ℹ' }
  };

  const style = typeStyles[type];

  return (
    <div style={{
      position: 'fixed',
      bottom: theme.spacing.lg,
      right: theme.spacing.lg,
      background: style.bg,
      border: `2px solid ${style.border}`,
      borderRadius: theme.borderRadius.lg,
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      boxShadow: theme.shadows.lg,
      zIndex: 10000,
      animation: 'slideIn 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.md,
      maxWidth: '400px'
    }}>
      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{style.icon}</span>
      <span style={{ color: theme.colors.text, fontWeight: '500' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginLeft: theme.spacing.md
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

const Button = ({ children, variant = 'primary', size = 'md', icon, onClick, disabled, fullWidth, loading }) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    fontFamily: '"Inter", system-ui, sans-serif',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto'
  };

  const variants = {
    primary: {
      background: theme.colors.primary,
      color: '#FFFFFF'
    },
    secondary: {
      background: theme.colors.bg,
      color: theme.colors.text,
      border: `1px solid ${theme.colors.border}`
    },
    ghost: {
      background: 'transparent',
      color: theme.colors.text
    },
    danger: {
      background: theme.colors.danger,
      color: '#FFFFFF'
    },
    success: {
      background: theme.colors.success,
      color: '#FFFFFF'
    }
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '15px', fontWeight: '600' }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...baseStyles,
        ...variants[variant],
        ...sizes[size]
      }}
      onMouseOver={(e) => !disabled && !loading && (e.currentTarget.style.opacity = '0.9')}
      onMouseOut={(e) => !disabled && !loading && (e.currentTarget.style.opacity = '1')}
    >
      {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

const Card = ({ children, title, actions, padding = 'lg', hover = false }) => (
  <div style={{
    background: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    border: `1px solid ${theme.colors.border}`
  }}
  onMouseOver={(e) => hover && (e.currentTarget.style.transform = 'translateY(-4px)')}
  onMouseOut={(e) => hover && (e.currentTarget.style.transform = 'translateY(0)')}
  >
    {title && (
      <div style={{
        padding: `${theme.spacing.lg}`,
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: theme.colors.bg
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: theme.colors.text }}>{title}</h3>
        {actions && <div style={{ display: 'flex', gap: theme.spacing.sm }}>{actions}</div>}
      </div>
    )}
    <div style={{ padding: theme.spacing[padding] }}>
      {children}
    </div>
  </div>
);

const Badge = ({ children, variant = 'default', icon }) => {
  const variants = {
    default: { background: theme.colors.bg, color: theme.colors.text },
    success: { background: theme.colors.successLight, color: '#065F46' },
    warning: { background: theme.colors.warningLight, color: '#92400E' },
    primary: { background: theme.colors.primaryLight, color: '#1E40AF' },
    danger: { background: theme.colors.dangerLight, color: '#991B1B' }
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: theme.spacing.xs,
      padding: '6px 12px',
      borderRadius: theme.borderRadius.sm,
      fontSize: '12px',
      fontWeight: '600',
      ...variants[variant]
    }}>
      {icon && <span style={{ display: 'flex', width: '14px', height: '14px' }}>{icon}</span>}
      {children}
    </span>
  );
};

const Input = ({ placeholder, value, onChange, type = 'text', icon, disabled }) => (
  <div style={{ position: 'relative', width: '100%' }}>
    {icon && (
      <div style={{
        position: 'absolute',
        left: theme.spacing.md,
        top: '50%',
        transform: 'translateY(-50%)',
        color: theme.colors.textLight,
        display: 'flex',
        alignItems: 'center'
      }}>
        {icon}
      </div>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        width: '100%',
        padding: icon ? `12px 16px 12px 42px` : '12px 16px',
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.md,
        fontSize: '14px',
        fontFamily: '"Inter", system-ui, sans-serif',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
        background: disabled ? theme.colors.bg : theme.colors.surface
      }}
      onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
      onBlur={(e) => e.target.style.borderColor = theme.colors.border}
    />
  </div>
);

const Select = ({ options, value, onChange, placeholder }) => (
  <select
    value={value}
    onChange={onChange}
    style={{
      width: '100%',
      padding: '12px 16px',
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      fontSize: '14px',
      fontFamily: '"Inter", system-ui, sans-serif',
      outline: 'none',
      cursor: 'pointer',
      background: theme.colors.surface
    }}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
);

// ============================================================================
// AUDIO RECORDER HOOK (ECHTE IMPLEMENTIERUNG)
// ============================================================================

const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true,
          autoGainControl: true 
        } 
      });
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Stop all tracks
        streamRef.current?.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      // Timer
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch (error) {
      throw new Error(`Microphone access denied: ${error.message}`);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          setIsRecording(false);
          setIsPaused(false);
          clearInterval(timerRef.current);
          streamRef.current?.getTracks().forEach(track => track.stop());
          resolve(blob);
        };
        mediaRecorderRef.current.stop();
      }
    });
  };

  return {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset: () => {
      setIsRecording(false);
      setIsPaused(false);
      setDuration(0);
      setAudioBlob(null);
      chunksRef.current = [];
      clearInterval(timerRef.current);
    }
  };
};

// ============================================================================
// SPEECH-TO-TEXT HOOK (Web Speech API)
// ============================================================================

const useSpeechRecognition = () => {
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'de-DE';
    }
  }, []);

  const transcribeFromBlob = async (audioBlob) => {
    // Fallback für Offline: Simple Placeholder basierend auf Dauer
    const duration = Math.round(audioBlob.size / 16000);
    const placeholder = `[Automatische Transkription - ${duration}s Audio]
    
Dies ist eine Platzhalter-Transkription. Für echte Transkription bitte:
1. OpenAI Whisper API verwenden (empfohlen)
2. Google Cloud Speech-to-Text API
3. Azure Speech Services

Web Speech API funktioniert nur in Echtzeit während der Aufnahme, nicht für bestehende Blobs.`;

    return [
      {
        timestamp: '00:00',
        speaker: 'System',
        text: placeholder,
        edited: false
      }
    ];
  };

  return { transcribeFromBlob };
};

// ============================================================================
// MAIN COMPONENT - SMARTMEETS V1.5
// ============================================================================

const SmartMeets = () => {
  const [activeTab, setActiveTab] = useState('record');
  const [transcript, setTranscript] = useState([]);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingCategory, setMeetingCategory] = useState('');
  const [meetingTags, setMeetingTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [toast, setToast] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const recorder = useAudioRecorder();
  const speechAPI = useSpeechRecognition();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('smartmeets_recordings');
    if (saved) {
      try {
        setRecordings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load recordings:', e);
      }
    }
  }, []);

  // Save to localStorage whenever recordings change
  useEffect(() => {
    if (recordings.length > 0) {
      localStorage.setItem('smartmeets_recordings', JSON.stringify(recordings));
    }
  }, [recordings]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecordingStart = async () => {
    try {
      await recorder.startRecording();
      showToast('Aufnahme gestartet', 'success');
    } catch (error) {
      showToast(`Fehler: ${error.message}`, 'error');
    }
  };

  const handleRecordingStop = async () => {
    try {
      setIsTranscribing(true);
      const blob = await recorder.stopRecording();
      
      // Transcribe
      const transcriptData = await speechAPI.transcribeFromBlob(blob);
      setTranscript(transcriptData);

      // Save recording
      const newRecording = {
        id: Date.now(),
        title: meetingTitle || `Meeting ${new Date().toLocaleString('de-DE')}`,
        date: new Date().toLocaleString('de-DE'),
        duration: recorder.duration,
        category: meetingCategory,
        tags: meetingTags,
        transcriptLength: transcriptData.length
      };

      setRecordings([newRecording, ...recordings]);
      setActiveTab('transcript');
      showToast('Aufnahme erfolgreich verarbeitet', 'success');
    } catch (error) {
      showToast(`Fehler bei Transkription: ${error.message}`, 'error');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsTranscribing(true);
      setUploadedFile(file);
      
      // Create blob from file
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      const transcriptData = await speechAPI.transcribeFromBlob(blob);
      setTranscript(transcriptData);

      // Save to recordings
      const newRecording = {
        id: Date.now(),
        title: file.name,
        date: new Date().toLocaleString('de-DE'),
        duration: Math.round(blob.size / 16000),
        category: meetingCategory,
        tags: meetingTags,
        transcriptLength: transcriptData.length
      };

      setRecordings([newRecording, ...recordings]);
      setActiveTab('transcript');
      showToast('Datei erfolgreich hochgeladen', 'success');
    } catch (error) {
      showToast(`Upload-Fehler: ${error.message}`, 'error');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTranscriptEdit = (index, newText) => {
    const updated = [...transcript];
    updated[index].text = newText;
    updated[index].edited = true;
    setTranscript(updated);
  };

  const addTag = () => {
    if (newTag.trim() && !meetingTags.includes(newTag.trim())) {
      setMeetingTags([...meetingTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setMeetingTags(meetingTags.filter(tag => tag !== tagToRemove));
  };

  const exportTranscript = (format) => {
    let content = '';

    if (format === 'txt') {
      content = `${meetingTitle || 'Meeting Transkript'}\n`;
      content += `${new Date().toLocaleString('de-DE')}\n`;
      content += `Kategorie: ${meetingCategory}\n`;
      content += `Tags: ${meetingTags.join(', ')}\n`;
      content += '\n---\n\n';
      
      transcript.forEach(item => {
        content += `[${item.timestamp}] ${item.speaker}:\n${item.text}\n\n`;
      });

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meetingTitle || 'Meeting'}_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('TXT exportiert', 'success');
    } else if (format === 'pdf') {
      // Simple PDF generation (without external library)
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 200 >>
stream
BT
/F1 12 Tf
50 750 Td
(${meetingTitle || 'Meeting Transkript'}) Tj
0 -20 Td
(${new Date().toLocaleString('de-DE')}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000229 00000 n
0000000338 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
588
%%EOF`;

      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meetingTitle || 'Meeting'}_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('PDF exportiert', 'success');
    }
  };

  const copyToClipboard = () => {
    const text = transcript.map(item => `[${item.timestamp}] ${item.speaker}: ${item.text}`).join('\n\n');
    navigator.clipboard.writeText(text);
    showToast('In Zwischenablage kopiert', 'success');
  };

  const deleteRecording = (id) => {
    setRecordings(recordings.filter(r => r.id !== id));
    showToast('Aufnahme gelöscht', 'info');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div style={{
      background: theme.colors.bg,
      minHeight: '100vh',
      fontFamily: '"Inter", system-ui, sans-serif',
      color: theme.colors.text
    }}>
      {/* Header */}
      <header style={{
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: `${theme.spacing.lg}`,
        boxShadow: theme.shadows.sm,
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <Mic size={28} style={{ color: theme.colors.primary }} />
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>SmartMeets</h1>
            <span style={{
              background: theme.colors.primaryLight,
              color: theme.colors.primary,
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: theme.borderRadius.sm,
              fontSize: '12px',
              fontWeight: '700',
              marginLeft: theme.spacing.md
            }}>
              v1.5
            </span>
          </div>
          <div style={{ display: 'flex', gap: theme.spacing.md }}>
            <Button variant="ghost" size="sm" icon={<Settings size={18} />}>
              Einstellungen
            </Button>
            <Button variant="ghost" size="sm" icon={<BarChart3 size={18} />}>
              Archiv
            </Button>
          </div>
        </div>
      </header>

      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: theme.spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.lg
      }}>
        {/* Left Column - Recording & Transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: theme.spacing.sm,
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: theme.spacing.md
          }}>
            {[
              { id: 'record', label: 'Aufnahme', icon: Mic },
              { id: 'transcript', label: 'Transkript', icon: FileText },
              { id: 'history', label: 'Verlauf', icon: Clock }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: activeTab === tab.id ? theme.colors.primary : theme.colors.textLight,
                    borderBottom: activeTab === tab.id ? `3px solid ${theme.colors.primary}` : 'none',
                    marginBottom: '-1px'
                  }}
                >
                  <TabIcon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Recording Tab */}
          {activeTab === 'record' && (
            <Card title="Audio-Aufnahme">
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
                {/* Recording Status */}
                <div style={{
                  padding: theme.spacing.lg,
                  background: recorder.isRecording ? theme.colors.primaryLight : theme.colors.bg,
                  borderRadius: theme.borderRadius.lg,
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ fontSize: '48px', fontWeight: '700', color: theme.colors.primary }}>
                    {formatDuration(recorder.duration)}
                  </div>
                  <p style={{
                    margin: `${theme.spacing.sm} 0 0`,
                    color: theme.colors.textLight,
                    fontSize: '14px'
                  }}>
                    {recorder.isRecording ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: theme.spacing.sm,
                        color: theme.colors.primary,
                        fontWeight: '600'
                      }}>
                        <span style={{
                          width: '10px',
                          height: '10px',
                          background: theme.colors.danger,
                          borderRadius: '50%',
                          animation: 'pulse 1s infinite'
                        }} />
                        {recorder.isPaused ? 'Pausiert' : 'Wird aufgenommen'}
                      </span>
                    ) : 'Bereit zur Aufnahme'}
                  </p>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
                  {!recorder.isRecording ? (
                    <Button 
                      size="lg" 
                      fullWidth
                      icon={<Mic size={20} />}
                      onClick={handleRecordingStart}
                    >
                      Aufnahme starten
                    </Button>
                  ) : (
                    <>
                      {!recorder.isPaused ? (
                        <Button 
                          size="lg"
                          variant="secondary"
                          fullWidth
                          icon={<Pause size={20} />}
                          onClick={recorder.pauseRecording}
                        >
                          Pause
                        </Button>
                      ) : (
                        <Button 
                          size="lg"
                          fullWidth
                          icon={<Play size={20} />}
                          onClick={recorder.resumeRecording}
                        >
                          Fortsetzen
                        </Button>
                      )}
                      <Button 
                        size="lg"
                        variant="danger"
                        fullWidth
                        icon={<Square size={20} />}
                        onClick={handleRecordingStop}
                        loading={isTranscribing}
                      >
                        {isTranscribing ? 'Wird verarbeitet...' : 'Stoppen'}
                      </Button>
                    </>
                  )}
                </div>

                {/* File Upload */}
                <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: theme.spacing.lg }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: theme.spacing.md,
                    padding: theme.spacing.lg,
                    border: `2px dashed ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.lg,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: theme.colors.bg
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = theme.colors.primary}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = theme.colors.border}
                  >
                    <Upload size={20} style={{ color: theme.colors.primary }} />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: '600', fontSize: '14px' }}>Audio/Video hochladen</p>
                      <p style={{ margin: 0, fontSize: '12px', color: theme.colors.textLight }}>MP3, WAV, MP4...</p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept="audio/*,video/*"
                      style={{ display: 'none' }}
                      disabled={isTranscribing}
                    />
                  </label>
                </div>
              </div>
            </Card>
          )}

          {/* Transcript Tab */}
          {activeTab === 'transcript' && (
            <Card 
              title="Transkript" 
              actions={
                transcript.length > 0 && (
                  <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={<Copy size={16} />}
                      onClick={copyToClipboard}
                    >
                      Kopieren
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={<Download size={16} />}
                      onClick={() => exportTranscript('txt')}
                    >
                      TXT
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={<Download size={16} />}
                      onClick={() => exportTranscript('pdf')}
                    >
                      PDF
                    </Button>
                  </div>
                )
              }
            >
              {transcript.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                  {transcript.map((item, index) => (
                    <div key={index} style={{
                      padding: theme.spacing.md,
                      background: theme.colors.bg,
                      borderRadius: theme.borderRadius.lg,
                      borderLeft: `4px solid ${item.edited ? theme.colors.warning : theme.colors.primary}`
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: theme.spacing.sm
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: theme.colors.primary }}>
                          {item.speaker} • {item.timestamp}
                        </span>
                        {item.edited && <Badge variant="warning">Bearbeitet</Badge>}
                      </div>
                      <textarea
                        value={item.text}
                        onChange={(e) => handleTranscriptEdit(index, e.target.value)}
                        style={{
                          width: '100%',
                          padding: theme.spacing.md,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: theme.borderRadius.md,
                          fontSize: '14px',
                          fontFamily: '"Inter", system-ui, sans-serif',
                          resize: 'vertical',
                          minHeight: '80px',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                        onBlur={(e) => e.target.style.borderColor = theme.colors.border}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: theme.spacing.xxl,
                  color: theme.colors.textLight
                }}>
                  <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Noch kein Transkript</p>
                  <p style={{ fontSize: '14px', margin: theme.spacing.sm + ' 0 0' }}>
                    Starten Sie eine Aufnahme oder laden Sie eine Datei hoch
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <Card title="Aufnahme-Verlauf">
              {recordings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                  {recordings.map(recording => (
                    <div key={recording.id} style={{
                      padding: theme.spacing.md,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.borderRadius.lg,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      hover: 'true'
                    }}>
                      <div>
                        <p style={{ margin: '0 0 4px', fontWeight: '600' }}>{recording.title}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: theme.colors.textLight }}>
                          {recording.date} • {formatDuration(recording.duration)} • {recording.transcriptLength} Segmente
                        </p>
                        {recording.tags.length > 0 && (
                          <div style={{ marginTop: theme.spacing.sm, display: 'flex', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
                            {recording.tags.map(tag => (
                              <Badge key={tag} variant="primary">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 size={16} />}
                        onClick={() => deleteRecording(recording.id)}
                      >
                        Löschen
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: theme.spacing.xxl,
                  color: theme.colors.textLight
                }}>
                  <Clock size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p>Noch keine Aufnahmen</p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Column - Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg, maxWidth: '350px', marginTop: theme.spacing.lg }}>
          <Card title="Meeting Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: theme.spacing.sm,
                  fontSize: '13px',
                  fontWeight: '600',
                  color: theme.colors.textLight
                }}>Titel</label>
                <Input
                  placeholder="z.B. Q1 Planning"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  icon={<FileText size={16} />}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: theme.spacing.sm,
                  fontSize: '13px',
                  fontWeight: '600',
                  color: theme.colors.textLight
                }}>Kategorie</label>
                <Select
                  placeholder="Wählen..."
                  value={meetingCategory}
                  onChange={(e) => setMeetingCategory(e.target.value)}
                  options={[
                    { value: 'internal', label: '🏢 Intern' },
                    { value: 'client', label: '👥 Kunden' },
                    { value: 'team', label: '👨‍💼 Team' },
                    { value: 'hr', label: '📋 HR' }
                  ]}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: theme.spacing.sm,
                  fontSize: '13px',
                  fontWeight: '600',
                  color: theme.colors.textLight
                }}>Tags</label>
                <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                  <Input
                    placeholder="Tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    icon={<Tag size={16} />}
                  />
                  <Button onClick={addTag} size="sm">+</Button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.xs }}>
                  {meetingTags.map(tag => (
                    <div
                      key={tag}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: theme.spacing.xs,
                        background: theme.colors.primaryLight,
                        color: theme.colors.primary,
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        borderRadius: theme.borderRadius.sm,
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          color: 'inherit'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {transcript.length > 0 && (
            <>
              <Card title="Zusammenfassung">
                <div style={{ fontSize: '13px', lineHeight: '1.6', color: theme.colors.text }}>
                  <p style={{ margin: '0 0 12px', fontWeight: '600' }}>Info:</p>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: theme.colors.textLight }}>
                    <li>{transcript.length} Segmente</li>
                    <li>{formatDuration(recorder.duration)} Dauer</li>
                    <li>{meetingTags.length} Tags</li>
                    <li>Bearbeitet: {transcript.filter(t => t.edited).length}</li>
                  </ul>
                </div>
              </Card>

              <Button
                fullWidth
                size="lg"
                icon={<Send size={18} />}
                onClick={() => showToast('Meeting-Protokoll wird vorbereitet...', 'info')}
              >
                Versenden
              </Button>
            </>
          )}
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Inter', system-ui, sans-serif;
          background: ${theme.colors.bg};
        }

        /* Responsive */
        @media (max-width: 1024px) {
          main {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          header {
            padding: ${theme.spacing.md} !important;
          }

          h1 {
            font-size: 20px !important;
          }

          main {
            padding: ${theme.spacing.md} !important;
            gap: ${theme.spacing.md} !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SmartMeets;
