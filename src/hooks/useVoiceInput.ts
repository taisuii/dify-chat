/**
 * 语音输入 Hook
 * 基于 Web Speech API
 */
import { useState, useRef, useCallback, useEffect } from 'react';

// 类型已在 shims.d.ts 中定义，无需导入

export interface VoiceInputOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface UseVoiceInputReturn {
  isRecording: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
}

export const useVoiceInput = (options: VoiceInputOptions = {}): UseVoiceInputReturn => {
  const {
    lang = 'zh-CN',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // 检查浏览器是否支持语音识别
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // 初始化语音识别
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptPart = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      } else if (interimTranscript) {
        setTranscript((prev) => {
          // 移除之前的临时结果
          const lastFinalIndex = prev.lastIndexOf('。');
          const basePart = lastFinalIndex >= 0 ? prev.substring(0, lastFinalIndex + 1) : prev;
          return basePart + interimTranscript;
        });
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error);
      setIsRecording(false);
      
      // 处理常见错误
      switch (event.error) {
        case 'not-allowed':
          setError('麦克风权限被拒绝');
          break;
        case 'no-speech':
          setError('未检测到语音输入');
          break;
        case 'network':
          setError('网络错误，请检查网络连接');
          break;
        default:
          setError(`语音识别错误: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [lang, continuous, interimResults, maxAlternatives, isSupported]);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setError('您的浏览器不支持语音识别');
      return;
    }

    if (!recognitionRef.current) return;

    try {
      setError(null);
      setIsRecording(true);
      recognitionRef.current.start();
    } catch (err) {
      setError('启动语音识别失败');
      setIsRecording(false);
    }
  }, [isSupported]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  }, [isRecording]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isRecording,
    transcript,
    error,
    isSupported,
    startRecording,
    stopRecording,
    resetTranscript,
  };
};
