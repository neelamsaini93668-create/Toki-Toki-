import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader2, Sparkles, Check, Copy } from 'lucide-react';

interface AudioTranscriberProps {
  onTranscribeComplete: (text: string) => void;
  className?: string;
  buttonLabel?: string;
}

export const AudioTranscriber: React.FC<AudioTranscriberProps> = ({
  onTranscribeComplete,
  className = '',
  buttonLabel = 'वॉइस से लिखें (AI Speech-to-Text)',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startVoiceRecording = async () => {
    setError(null);
    setLastResult(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await sendAudioToTranscribe(audioBlob, mimeType);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setError('माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया अनुमति दें।');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const sendAudioToTranscribe = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioData: base64Audio,
            mimeType: mimeType || 'audio/webm',
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'ट्रांसक्रिप्शन में समस्या आई');
        }

        const transcript = data.text || '';
        setLastResult(transcript);
        onTranscribeComplete(transcript);
        setIsTranscribing(false);
      };
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(err.message || 'ट्रांसक्राइब करने में असमर्थ');
      setIsTranscribing(false);
    }
  };

  const handleCopy = () => {
    if (lastResult) {
      navigator.clipboard.writeText(lastResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
          disabled={isTranscribing}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md select-none ${
            isRecording
              ? 'bg-rose-600 text-white animate-pulse ring-2 ring-white/50'
              : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700'
          } ${isTranscribing ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {isTranscribing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>gemini-3.5-transcribe चल रहा है...</span>
            </>
          ) : isRecording ? (
            <>
              <MicOff className="w-3.5 h-3.5 text-white animate-bounce" />
              <span>बोलना रोकें (Stop & Transcribe)</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span>{buttonLabel}</span>
            </>
          )}
        </button>

        {isRecording && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>सुन रहे हैं... बोलिए</span>
          </div>
        )}
      </div>

      {/* Transcription Preview & Feedback */}
      {lastResult && (
        <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs space-y-1 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-bold">
              <Sparkles className="w-3 h-3" />
              <span>ट्रांसक्रिप्ट (gemini-3.5-transcribe):</span>
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'कॉपी हुआ' : 'कॉपी'}</span>
            </button>
          </div>
          <p className="text-white font-medium leading-relaxed">{lastResult}</p>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-rose-400 font-medium">{error}</p>
      )}
    </div>
  );
};
