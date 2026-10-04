import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, Sparkles, MessageCircle, AlertCircle } from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'hi' | 'en';
}

function pcmToBase64(pcmData: Float32Array): string {
  const pcm16 = new Int16Array(pcmData.length);
  for (let i = 0; i < pcmData.length; i++) {
    const s = Math.max(-1, Math.min(1, pcmData[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function playAudioChunk(ctx: AudioContext, base64Audio: string) {
  try {
    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }
    const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
    audioBuffer.copyToChannel(float32, 0);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start();
  } catch (e) {
    console.warn('Playback error:', e);
  }
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  lang = 'hi',
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let ws: WebSocket;
    let stream: MediaStream;

    const setupLiveSession = async () => {
      try {
        setErrorMessage(null);
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(`${protocol}//${window.location.host}/live`);
        wsRef.current = ws;

        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000,
        });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
        inputAudioCtxRef.current = inputCtx;
        outputAudioCtxRef.current = outputCtx;

        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        source.connect(processor);
        processor.connect(inputCtx.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN && !isMuted) {
            const inputData = e.inputBuffer.getChannelData(0);
            const base64 = pcmToBase64(inputData);
            ws.send(JSON.stringify({ audio: base64 }));
          }
        };

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.error) {
              setErrorMessage(msg.error);
            }
            if (msg.audio) {
              setIsSpeaking(true);
              playAudioChunk(outputCtx, msg.audio);
              setTimeout(() => setIsSpeaking(false), 1200);
            }
          } catch (e) {
            console.warn('Live message parse error:', e);
          }
        };

        ws.onerror = (e) => {
          console.warn('Live WebSocket error:', e);
          setErrorMessage('Gemini Live API से कनेक्ट करने में विफल');
        };

        ws.onclose = () => {
          setIsConnected(false);
        };
      } catch (err: any) {
        console.error('Setup Live error:', err);
        setErrorMessage(err.message || 'माइक्रोफ़ोन या वॉइस कनेक्शन में समस्या');
      }
    };

    setupLiveSession();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (inputAudioCtxRef.current) {
        inputAudioCtxRef.current.close().catch(() => {});
      }
      if (outputAudioCtxRef.current) {
        outputAudioCtxRef.current.close().catch(() => {});
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between text-center space-y-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Gemini 3.8 Live API</span>
          </div>
          <h3 className="text-base font-bold text-white">टोकी AI वॉइस चैट (Toki Live)</h3>
          <p className="text-xs text-slate-400">
            शॉर्ट वीडियो आइडिया, स्क्रिप्ट और मस्ती के लिए सीधे बात करें
          </p>
        </div>

        {/* Animated Speaking / Listening Orb */}
        <div className="relative w-36 h-36 flex items-center justify-center my-2">
          {/* Glowing Animated Pulse Rings */}
          {isConnected && (
            <>
              <div
                className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${
                  isSpeaking
                    ? 'border-cyan-400 scale-125 opacity-60 animate-ping'
                    : 'border-rose-500 scale-110 opacity-30 animate-pulse'
                }`}
              />
              <div
                className={`absolute inset-2 rounded-full border border-purple-500/40 animate-spin duration-700`}
              />
            </>
          )}

          {/* Central Sphere */}
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
              isSpeaking
                ? 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700 shadow-cyan-500/50 scale-105'
                : isConnected
                ? 'bg-gradient-to-tr from-[#fe2c55] via-purple-600 to-[#00f2fe] shadow-rose-500/40'
                : 'bg-slate-900 border border-slate-800'
            }`}
          >
            {isSpeaking ? (
              <Volume2 className="w-12 h-12 text-white animate-bounce" />
            ) : isConnected ? (
              <Mic className="w-12 h-12 text-white animate-pulse" />
            ) : (
              <MicOff className="w-10 h-10 text-slate-500" />
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-white flex items-center justify-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isSpeaking
                  ? 'bg-cyan-400 animate-ping'
                  : isConnected
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <span>
              {isSpeaking
                ? 'टोकी बोल रहा है (Toki Speaking)...'
                : isConnected
                ? 'टोकी सुन रहा है... कुछ भी बोलें!'
                : 'कनेक्ट हो रहा है...'}
            </span>
          </p>
          <p className="text-[11px] text-slate-400">
            {isConnected ? 'हिंदी या English में अपनी रील के बारे में पूछें' : 'लाइव सेशन शुरू हो रहा है'}
          </p>
        </div>

        {/* Error notice if any */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-[11px] text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Bottom Control Buttons */}
        <div className="w-full flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsMuted((m) => !m)}
            className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
              isMuted
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isMuted ? 'अनम्यूट करें' : 'म्यूट करें'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            समाप्त करें
          </button>
        </div>
      </div>
    </div>
  );
};
