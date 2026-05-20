'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Browser SpeechRecognition type declarations
interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: ISpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
}

interface ISpeechRecognitionEvent extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  }
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language?: string; // BCP-47 code e.g. 'hi-IN', 'en-IN'
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LANG_MAP: Record<string, string> = {
  hi: 'hi-IN',
  mr: 'mr-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  en: 'en-IN',
};

type State = 'idle' | 'listening' | 'processing' | 'error';

export default function VoiceInput({
  onTranscript,
  language = 'hi',
  disabled = false,
  className,
  size = 'md',
}: VoiceInputProps) {
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) setIsSupported(false);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setState('idle');
  }, []);

  const start = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      setErrorMsg('Speech recognition not supported in this browser.');
      setState('error');
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.lang = LANG_MAP[language] ?? 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setState('listening');

    recognition.onresult = (e: ISpeechRecognitionEvent) => {
      setState('processing');
      const transcript = e.results[0]?.[0]?.transcript ?? '';
      if (transcript.trim()) {
        onTranscript(transcript.trim());
      }
      setState('idle');
    };

    recognition.onerror = (e: ISpeechRecognitionErrorEvent) => {
      const msg =
        e.error === 'not-allowed'
          ? 'Microphone access denied. Please allow microphone in browser settings.'
          : e.error === 'no-speech'
          ? 'No speech detected. Please try again.'
          : `Voice error: ${e.error}`;
      setErrorMsg(msg);
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    };

    recognition.onend = () => {
      if (state === 'listening') setState('idle');
    };

    recognition.start();
  }, [language, onTranscript, state]);

  const toggle = () => {
    if (state === 'listening') {
      stop();
    } else if (state === 'idle') {
      setErrorMsg('');
      start();
    }
  };

  if (!isSupported) return null;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      <button
        type="button"
        onClick={toggle}
        disabled={disabled || state === 'processing'}
        title={
          state === 'listening'
            ? 'Stop listening'
            : state === 'processing'
            ? 'Processing...'
            : 'Start voice input'
        }
        className={cn(
          'relative rounded-full flex items-center justify-center transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950',
          sizeClasses[size],
          state === 'listening'
            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40 focus:ring-red-500'
            : state === 'processing'
            ? 'bg-purple-500/30 border border-purple-500/50 cursor-wait'
            : state === 'error'
            ? 'bg-orange-500/20 border border-orange-500/30 hover:bg-orange-500/30'
            : 'bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 hover:shadow-lg hover:shadow-green-500/20',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Listening pulse rings */}
        {state === 'listening' && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
            <span className="absolute inset-[-4px] rounded-full border-2 border-red-400/40 animate-pulse" />
          </>
        )}

        {state === 'processing' ? (
          <Loader2 className={cn(iconSizes[size], 'text-purple-400 animate-spin')} />
        ) : state === 'listening' ? (
          <MicOff className={cn(iconSizes[size], 'text-white')} />
        ) : (
          <Mic
            className={cn(
              iconSizes[size],
              state === 'error' ? 'text-orange-400' : 'text-green-400'
            )}
          />
        )}
      </button>

      {/* Status label */}
      {state === 'listening' && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs text-red-400 font-medium animate-pulse">Listening...</span>
        </div>
      )}

      {/* Error tooltip */}
      {state === 'error' && errorMsg && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 rounded-lg bg-slate-800 border border-orange-500/30 text-xs text-orange-300 text-center shadow-xl z-50">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
