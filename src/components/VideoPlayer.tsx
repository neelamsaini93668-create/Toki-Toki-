import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Volume2, VolumeX, Heart } from 'lucide-react';
import { VideoItem } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface VideoPlayerProps {
  video: VideoItem;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onLike: () => void;
  onDoubleTapLike?: () => void;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  isActive,
  isMuted,
  onToggleMute,
  onLike,
  onDoubleTapLike,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [videoFailed, setVideoFailed] = useState<boolean>(false);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const lastTapRef = useRef<number>(0);

  // Synchronize playback with isActive state
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (isActive) {
      el.currentTime = video.trimStart || 0;
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay with audio was prevented, fallback to muted
            el.muted = true;
            el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          });
      }
      // Start audio beat
      if (!isMuted) {
        audioEngine.playSound(video.sound.type, video.sound.bpm);
      }
    } else {
      el.pause();
      setIsPlaying(false);
      audioEngine.stopSound();
    }
  }, [isActive, video.sound, video.trimStart, video.trimEnd]);

  // Synchronize mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
    audioEngine.setMuted(isMuted);
    if (!isMuted && isActive) {
      audioEngine.playSound(video.sound.type, video.sound.bpm);
    }
  }, [isMuted, isActive, video.sound]);

  // Update progress respecting trim points
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const start = video.trimStart || 0;
      const end = video.trimEnd || videoRef.current.duration || 1;
      const effectiveDuration = Math.max(0.5, end - start);

      if (cur >= end) {
        videoRef.current.currentTime = start;
      } else if (cur < start) {
        videoRef.current.currentTime = start;
      }

      const currentProgress = ((cur - start) / effectiveDuration) * 100;
      setProgress(Math.max(0, Math.min(100, currentProgress)));
      setDuration(effectiveDuration);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;

    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
      audioEngine.stopSound();
    } else {
      el.play()
        .then(() => {
          setIsPlaying(true);
          if (!isMuted) {
            audioEngine.playSound(video.sound.type, video.sound.bpm);
          }
        })
        .catch(() => setIsPlaying(false));
    }
  };

  // Handle double tap / click to like
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (now - lastTapRef.current < 300) {
      // Double tap detected!
      audioEngine.playLikeSound();
      if (!video.isLiked) {
        onLike();
      }
      if (onDoubleTapLike) onDoubleTapLike();

      // Spawn heart particle
      const newHeart: FloatingHeart = { id: Date.now() + Math.random(), x, y };
      setHearts((prev) => [...prev, newHeart]);
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
      }, 900);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      // Single tap after delay toggles play if not followed by double tap
      setTimeout(() => {
        if (lastTapRef.current === now) {
          togglePlay();
        }
      }, 260);
    }
  };

  // Manual scrubber jump
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.current.currentTime = pct * (videoRef.current.duration || 10);
    setProgress(pct * 100);
  };

  // Canvas visualizer animation loop (for fallback or rhythmic background pulse)
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas || !videoFailed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;
    const render = () => {
      tick++;
      canvas.width = canvas.parentElement?.clientWidth || 360;
      canvas.height = canvas.parentElement?.clientHeight || 640;

      // Draw dynamic gradient background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const hue1 = (tick * 0.4) % 360;
      const hue2 = (hue1 + 70) % 360;
      grad.addColorStop(0, `hsl(${hue1}, 70%, 15%)`);
      grad.addColorStop(0.5, `hsl(${hue2}, 80%, 20%)`);
      grad.addColorStop(1, `hsl(${hue1 + 140}, 65%, 10%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sound wave bars
      const numBars = 32;
      const barWidth = canvas.width / numBars;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

      for (let i = 0; i < numBars; i++) {
        const h = Math.sin(tick * 0.08 + i * 0.3) * 60 + Math.cos(tick * 0.05 + i * 0.5) * 40 + 80;
        const x = i * barWidth;
        const y = canvas.height * 0.7 - h / 2;
        ctx.fillRect(x + 2, y, barWidth - 4, h);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [videoFailed]);

  // Compute filter styling from video.filter
  const filterCss =
    video.filter === 'black-and-white'
      ? 'grayscale(100%) contrast(125%)'
      : video.filter === 'sepia'
      ? 'sepia(100%) contrast(115%) saturate(110%)'
      : video.filter === 'vibrant'
      ? 'saturate(210%) contrast(125%) brightness(108%)'
      : 'none';

  return (
    <div
      onClick={handleTap}
      className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden select-none cursor-pointer group"
    >
      {/* Dynamic Background Blur */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${video.gradient} opacity-40 blur-3xl scale-125 pointer-events-none`}
      />

      {/* Real HTML5 Video element */}
      {!videoFailed ? (
        <video
          ref={videoRef}
          src={video.videoUrl}
          loop
          playsInline
          muted={isMuted}
          style={{ filter: filterCss }}
          onTimeUpdate={handleTimeUpdate}
          onError={() => setVideoFailed(true)}
          className="relative z-10 w-full h-full object-cover max-h-full"
        />
      ) : (
        /* Fallback Dynamic Visualizer Canvas */
        <canvas
          ref={canvasRef}
          style={{ filter: filterCss }}
          className="relative z-10 w-full h-full object-cover"
        />
      )}

      {/* Floating Animated Hearts on Double Tap */}
      {hearts.map((h) => (
        <div
          key={h.id}
          style={{ left: h.x, top: h.y }}
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-bounce"
        >
          <Heart className="w-20 h-20 text-rose-500 fill-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
        </div>
      ))}

      {/* Paused Indicator Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-opacity">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-950/70 border border-white/20 flex items-center justify-center text-white shadow-2xl scale-110 active:scale-95 transition-transform">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white translate-x-1 text-white" />
          </div>
        </div>
      )}

      {/* Mute/Unmute Quick Badge (Top Right) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleMute();
        }}
        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md border border-slate-700/60 shadow-lg cursor-pointer transition-transform active:scale-90"
        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
      </button>

      {/* Bottom Timeline Progress Bar */}
      <div
        onClick={handleScrubberClick}
        className="absolute bottom-0 left-0 right-0 z-20 h-1.5 bg-white/20 hover:h-2.5 transition-all cursor-pointer group/scrubber"
      >
        <div
          className="h-full bg-gradient-to-r from-rose-500 to-pink-500 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white opacity-0 group-hover/scrubber:opacity-100 shadow-md" />
        </div>
      </div>
    </div>
  );
};
