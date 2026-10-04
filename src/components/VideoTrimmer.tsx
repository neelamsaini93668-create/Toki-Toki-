import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Scissors,
  Play,
  Pause,
  RotateCcw,
  Check,
  X,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sliders,
} from 'lucide-react';

interface VideoTrimmerProps {
  videoUrl: string;
  originalVideoUrl?: string;
  onApplyTrim: (trimmedUrl: string, startTime: number, endTime: number) => void;
  onCancel: () => void;
  lang?: 'hi' | 'en';
}

export const VideoTrimmer: React.FC<VideoTrimmerProps> = ({
  videoUrl,
  originalVideoUrl,
  onApplyTrim,
  onCancel,
  lang = 'hi',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const filmstripRef = useRef<HTMLDivElement>(null);

  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [trimProgress, setTrimProgress] = useState<number>(0);
  const [activeDragHandle, setActiveDragHandle] = useState<'start' | 'end' | null>(null);

  // Initialize video metadata and duration
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 10;
      setDuration(dur);
      setStartTime(0);
      setEndTime(dur);
      generateThumbnails(dur);
    }
  };

  // Generate 8 filmstrip snapshot thumbnails across the video
  const generateThumbnails = useCallback((videoDuration: number) => {
    if (!videoUrl || videoDuration <= 0) return;

    const count = 8;
    const snapTimes = Array.from({ length: count }, (_, i) => (videoDuration * i) / (count - 1));
    const offscreenVideo = document.createElement('video');
    offscreenVideo.crossOrigin = 'anonymous';
    offscreenVideo.muted = true;
    offscreenVideo.src = videoUrl;

    const canvas = document.createElement('canvas');
    canvas.width = 90;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const generatedImgs: string[] = [];

    const captureFrame = (index: number) => {
      if (index >= snapTimes.length) {
        setThumbnails(generatedImgs);
        return;
      }

      offscreenVideo.currentTime = snapTimes[index];
      offscreenVideo.onseeked = () => {
        ctx.drawImage(offscreenVideo, 0, 0, canvas.width, canvas.height);
        generatedImgs.push(canvas.toDataURL('image/jpeg', 0.6));
        captureFrame(index + 1);
      };
    };

    offscreenVideo.onloadedmetadata = () => {
      captureFrame(0);
    };

    offscreenVideo.onerror = () => {
      // Fallback empty thumbnails
      setThumbnails([]);
    };
  }, [videoUrl]);

  // Handle video timeupdate and loop strictly between startTime and endTime
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    if (curr >= endTime) {
      videoRef.current.currentTime = startTime;
      if (!isPlaying) {
        videoRef.current.pause();
      }
    } else if (curr < startTime) {
      videoRef.current.currentTime = startTime;
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime >= endTime || videoRef.current.currentTime < startTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Seek video when start handle moves
  const handleStartChange = (val: number) => {
    const newStart = Math.max(0, Math.min(val, endTime - 0.5));
    setStartTime(Number(newStart.toFixed(1)));
    if (videoRef.current) {
      videoRef.current.currentTime = newStart;
      setCurrentTime(newStart);
    }
  };

  // Seek video when end handle moves
  const handleEndChange = (val: number) => {
    const newEnd = Math.min(duration, Math.max(val, startTime + 0.5));
    setEndTime(Number(newEnd.toFixed(1)));
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(startTime, newEnd - 0.5);
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Quick preset trims
  const applyPreset = (preset: 'full' | 'first3' | 'first10' | 'middle' | 'last5') => {
    if (!duration) return;
    if (preset === 'full') {
      handleStartChange(0);
      handleEndChange(duration);
    } else if (preset === 'first3') {
      handleStartChange(0);
      handleEndChange(Math.min(3, duration));
    } else if (preset === 'first10') {
      handleStartChange(0);
      handleEndChange(Math.min(10, duration));
    } else if (preset === 'middle') {
      const mid = duration / 2;
      const span = Math.min(5, duration / 2);
      handleStartChange(Math.max(0, mid - span / 2));
      handleEndChange(Math.min(duration, mid + span / 2));
    } else if (preset === 'last5') {
      handleStartChange(Math.max(0, duration - 5));
      handleEndChange(duration);
    }
  };

  // Apply Trim: perform fast client-side clipping
  const handlePerformTrim = async () => {
    if (!videoRef.current || duration <= 0) return;
    setIsProcessing(true);
    setTrimProgress(10);

    try {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      video.muted = false;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = (e) => reject(e);
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 1280;
      const ctx = canvas.getContext('2d');

      if (!ctx || typeof (canvas as any).captureStream !== 'function') {
        // Fallback: update with timestamp parameters
        setTrimProgress(100);
        setTimeout(() => {
          setIsProcessing(false);
          onApplyTrim(videoUrl, startTime, endTime);
        }, 300);
        return;
      }

      const stream = (canvas as any).captureStream(30);

      // Attempt capturing audio
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination);
        dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
      } catch (e) {
        console.warn('Audio capture omitted for trim stream:', e);
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const trimDuration = endTime - startTime;

      recorder.onstop = () => {
        const trimmedBlob = new Blob(chunks, { type: mimeType });
        const trimmedUrl = URL.createObjectURL(trimmedBlob);
        setIsProcessing(false);
        onApplyTrim(trimmedUrl, startTime, endTime);
      };

      video.currentTime = startTime;
      await new Promise((r) => {
        video.onseeked = () => r(null);
      });

      recorder.start(100);
      await video.play();

      const startTimeMs = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTimeMs) / 1000;
        setTrimProgress(Math.min(95, Math.round((elapsed / trimDuration) * 100)));

        if (video.currentTime >= endTime || video.ended || elapsed >= trimDuration + 0.5) {
          clearInterval(interval);
          video.pause();
          recorder.stop();
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
      }, 1000 / 30);
    } catch (err) {
      console.warn('Trim render fallback:', err);
      setIsProcessing(false);
      onApplyTrim(videoUrl, startTime, endTime);
    }
  };

  // Calculate percentage positions for timeline UI
  const startPercent = duration > 0 ? (startTime / duration) * 100 : 0;
  const endPercent = duration > 0 ? (endTime / duration) * 100 : 100;
  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const clipDuration = (endTime - startTime).toFixed(1);

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#fe2c55] to-cyan-400 p-0.5 flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
              <Scissors className="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>वीडियो ट्रिम टूल (Trim Video)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {clipDuration}s क्लिप
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              प्रारंभ (Start) और समाप्ति (End) बिंदु चुनकर वीडियो छोटा करें
            </p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          title="बंद करें (Close)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Video Viewfinder Preview */}
      <div className="relative flex-1 my-3 bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner group">
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = startTime;
              videoRef.current.play().catch(() => {});
            }
          }}
          className="w-full h-full object-contain max-h-[46vh]"
        />

        {/* Center Big Play/Pause Overlay Button */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-2xl transition-transform active:scale-90 cursor-pointer"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white translate-x-0.5" />
          )}
        </button>

        {/* Video Time Badge Overlay */}
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-white border border-white/10 flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>
            {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
          </span>
        </div>

        {/* Trim Range Badge Overlay */}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
          <span>कट रेंज:</span>
          <span className="text-white font-mono">
            {startTime.toFixed(1)}s - {endTime.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* TIMELINE & FILMSTRIP TRIMMING CONTROLLER */}
      <div className="space-y-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
        {/* Filmstrip Bar Container */}
        <div className="relative pt-2 pb-1 select-none">
          <div
            ref={filmstripRef}
            className="relative h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-between"
          >
            {/* Filmstrip Frame Thumbnails */}
            {thumbnails.length > 0 ? (
              <div className="w-full h-full flex">
                {thumbnails.map((thumb, idx) => (
                  <div key={idx} className="flex-1 h-full relative overflow-hidden border-r border-black/40">
                    <img src={thumb} alt="" className="w-full h-full object-cover opacity-75" />
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback gradient waveform */
              <div className="w-full h-full flex items-center justify-around px-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    style={{ height: `${20 + ((i * 7) % 30)}px` }}
                    className="w-1.5 rounded-full bg-slate-700/60"
                  />
                ))}
              </div>
            )}

            {/* Dark Mask for LEFT (Unselected before startTime) */}
            <div
              style={{ width: `${startPercent}%` }}
              className="absolute left-0 top-0 bottom-0 bg-black/75 backdrop-blur-[1px] pointer-events-none transition-all"
            />

            {/* Active Selected Clip Box */}
            <div
              style={{
                left: `${startPercent}%`,
                width: `${Math.max(2, endPercent - startPercent)}%`,
              }}
              className="absolute top-0 bottom-0 border-y-2 border-[#00f2fe] bg-[#00f2fe]/10 pointer-events-none shadow-lg shadow-cyan-500/20"
            />

            {/* Dark Mask for RIGHT (Unselected after endTime) */}
            <div
              style={{
                left: `${endPercent}%`,
                right: 0,
              }}
              className="absolute top-0 bottom-0 bg-black/75 backdrop-blur-[1px] pointer-events-none transition-all"
            />

            {/* Current Playhead Marker */}
            <div
              style={{ left: `${Math.min(100, Math.max(0, currentPercent))}%` }}
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 pointer-events-none z-20 shadow-[0_0_8px_#fe2c55]"
            >
              <div className="w-2 h-2 rounded-full bg-rose-500 -translate-x-[3px] -translate-y-1" />
            </div>

            {/* Left Trim Handle (Start) */}
            <div
              style={{ left: `${startPercent}%` }}
              className="absolute top-0 bottom-0 -translate-x-1/2 z-30 flex items-center justify-center cursor-ew-resize group"
            >
              <div className="w-4 h-full bg-[#00f2fe] rounded-l-md flex items-center justify-center shadow-lg shadow-cyan-500/50 hover:scale-105 active:scale-110 transition-transform">
                <div className="w-0.5 h-6 bg-slate-950 rounded-full" />
              </div>
            </div>

            {/* Right Trim Handle (End) */}
            <div
              style={{ left: `${endPercent}%` }}
              className="absolute top-0 bottom-0 -translate-x-1/2 z-30 flex items-center justify-center cursor-ew-resize group"
            >
              <div className="w-4 h-full bg-[#fe2c55] rounded-r-md flex items-center justify-center shadow-lg shadow-rose-500/50 hover:scale-105 active:scale-110 transition-transform">
                <div className="w-0.5 h-6 bg-slate-950 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Dual Range Sliders for Precision Input */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Start Point Slider & Precision Steppers */}
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                <span>[ शुरुआत (Start):</span>
                <strong className="text-white font-mono text-xs">{startTime.toFixed(1)}s</strong>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleStartChange(startTime - 0.1)}
                  className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => handleStartChange(startTime + 0.1)}
                  className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0.1, duration)}
              step={0.1}
              value={startTime}
              onChange={(e) => handleStartChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00f2fe]"
            />
          </div>

          {/* End Point Slider & Precision Steppers */}
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                <span>समाप्ति (End) ]:</span>
                <strong className="text-white font-mono text-xs">{endTime.toFixed(1)}s</strong>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleEndChange(endTime - 0.1)}
                  className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => handleEndChange(endTime + 0.1)}
                  className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0.1, duration)}
              step={0.1}
              value={endTime}
              onChange={(e) => handleEndChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#fe2c55]"
            />
          </div>
        </div>

        {/* Quick Presets row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] font-bold text-slate-400 shrink-0">प्रीसेट:</span>
          {[
            { id: 'full', label: 'पूरी वीडियो (Full)' },
            { id: 'first3', label: 'पहले 3s' },
            { id: 'first10', label: 'पहले 10s' },
            { id: 'middle', label: 'मध्य भाग' },
            { id: 'last5', label: 'अंतिम 5s' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id as any)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Processing Progress Bar if trimming */}
      {isProcessing && (
        <div className="my-2 bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-white font-bold">
            <span className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-rose-500 animate-spin" />
              <span>वीडियो ट्रिम हो रहा है... ({trimProgress}%)</span>
            </span>
            <span className="text-cyan-400 font-mono">{clipDuration}s</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${trimProgress}%` }}
              className="h-full bg-gradient-to-r from-[#fe2c55] via-pink-500 to-[#00f2fe] transition-all duration-150"
            />
          </div>
        </div>
      )}

      {/* Action Footer Buttons */}
      <div className="flex items-center gap-2.5 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors"
        >
          रद्द करें
        </button>

        <button
          type="button"
          onClick={handlePerformTrim}
          disabled={isProcessing || endTime <= startTime}
          className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#fe2c55] via-pink-500 to-[#00f2fe] text-white font-bold text-xs shadow-lg shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{isProcessing ? 'ट्रिम किया जा रहा है...' : `कट लागू करें (${clipDuration}s Trim)`}</span>
        </button>
      </div>
    </div>
  );
};
