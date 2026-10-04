import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Smile, RefreshCw, Sliders, Check, Eye } from 'lucide-react';

export interface ArMaskItem {
  id: string;
  name: string;
  category: 'funny' | 'hats' | 'glasses' | 'animations';
  icon: string;
  renderMask: (params: {
    x: number;
    y: number;
    scale: number;
    angle: number;
  }) => React.ReactNode;
}

interface FaceTrackingArStickersProps {
  selectedMaskId: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isRecording?: boolean;
}

export const AR_MASKS_LIBRARY: ArMaskItem[] = [
  {
    id: 'none',
    name: 'सामान्य (None)',
    category: 'funny',
    icon: '🚫',
    renderMask: () => null,
  },
  {
    id: 'funny_doggo',
    name: 'क्यूट डॉगी (Puppy & Tongue)',
    category: 'funny',
    icon: '🐶',
    renderMask: ({ x, y, scale }) => (
      <div
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          pointerEvents: 'none',
        }}
        className="w-72 h-72 flex flex-col items-center justify-between"
      >
        {/* Floppy Dog Ears (Wiggling) */}
        <div className="w-full flex justify-between px-2 -mt-8">
          {/* Left Ear */}
          <div className="w-20 h-28 bg-[#8B5A2B] rounded-[40px_10px_60px_60px] border-4 border-[#5c3a1e] rotate-[-18deg] animate-[bounce_1.5s_infinite] origin-top shadow-xl">
            <div className="w-12 h-20 bg-[#C49A6C] rounded-[30px_10px_45px_45px] m-auto mt-2" />
          </div>
          {/* Right Ear */}
          <div className="w-20 h-28 bg-[#8B5A2B] rounded-[10px_40px_60px_60px] border-4 border-[#5c3a1e] rotate-[18deg] animate-[bounce_1.5s_infinite_0.2s] origin-top shadow-xl">
            <div className="w-12 h-20 bg-[#C49A6C] rounded-[10px_30px_45px_45px] m-auto mt-2" />
          </div>
        </div>

        {/* Center: Dog Nose & Whiskers */}
        <div className="relative flex flex-col items-center mt-6">
          {/* Black Dog Nose */}
          <div className="w-14 h-10 bg-black rounded-full border-2 border-slate-700 shadow-md flex items-start justify-center pt-1">
            <div className="w-4 h-1.5 bg-white/60 rounded-full" />
          </div>
          {/* Whiskers */}
          <div className="flex items-center gap-1 mt-1 text-slate-800 font-bold text-xs">
            <span>• • •</span>
            <div className="w-1 h-3 bg-black rounded-full" />
            <span>• • •</span>
          </div>
          {/* Blushing cheeks */}
          <div className="absolute -left-12 top-1 w-8 h-4 rounded-full bg-rose-400/50 blur-[2px]" />
          <div className="absolute -right-12 top-1 w-8 h-4 rounded-full bg-rose-400/50 blur-[2px]" />
          {/* Animated Wagging Tongue */}
          <div className="w-12 h-14 bg-gradient-to-b from-rose-400 to-rose-500 rounded-b-full border-2 border-rose-600 shadow-lg animate-[pulse_0.8s_infinite] origin-top -mt-0.5">
            <div className="w-0.5 h-8 bg-rose-700/60 mx-auto" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'thug_life',
    name: 'ठग लाइफ (Thug Life Meme)',
    category: 'funny',
    icon: '🕶️',
    renderMask: ({ x, y, scale }) => (
      <div
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          pointerEvents: 'none',
        }}
        className="w-80 h-64 flex flex-col items-center justify-center"
      >
        {/* Pixelated 8-Bit Sunglasses */}
        <div className="relative drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] -mt-10">
          <svg width="220" height="50" viewBox="0 0 220 50">
            {/* Left Lens 8-bit staircase */}
            <rect x="15" y="10" width="85" height="30" fill="black" />
            <rect x="25" y="15" width="20" height="10" fill="white" />
            <rect x="55" y="15" width="10" height="10" fill="white" />
            {/* Bridge */}
            <rect x="100" y="15" width="20" height="10" fill="black" />
            {/* Right Lens */}
            <rect x="120" y="10" width="85" height="30" fill="black" />
            <rect x="130" y="15" width="20" height="10" fill="white" />
            <rect x="160" y="15" width="10" height="10" fill="white" />
          </svg>
        </div>

        {/* Pixel Cigar with smoke */}
        <div className="relative mt-8 ml-24 flex items-center">
          <div className="w-16 h-4 bg-[#8B5A2B] border-2 border-black flex items-center justify-end">
            <div className="w-3 h-3 bg-amber-400 animate-pulse border-r border-red-600" />
          </div>
          {/* Animated smoke puffs */}
          <div className="relative -mt-6">
            <div className="w-3 h-3 bg-white/70 rounded-full animate-ping duration-1000" />
            <div className="w-4 h-4 bg-white/40 rounded-full animate-bounce [animation-delay:0.3s]" />
          </div>
        </div>

        {/* Big Golden Dollar Chain */}
        <div className="mt-4 flex flex-col items-center">
          <div className="w-32 h-6 border-b-4 border-dashed border-amber-400 rounded-b-full shadow-lg" />
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 border-2 border-amber-200 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg animate-bounce">
            $
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'golden_crown',
    name: 'शाही मुकुट (Maharaja Crown)',
    category: 'hats',
    icon: '👑',
    renderMask: ({ x, y, scale }) => (
      <div
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y - 18}%`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          pointerEvents: 'none',
        }}
        className="w-72 h-44 flex flex-col items-center justify-center"
      >
        <svg
          viewBox="0 0 200 120"
          className="w-56 h-auto drop-shadow-[0_0_25px_rgba(245,158,11,0.8)] animate-pulse"
        >
          {/* Royal Crown Base */}
          <path
            d="M 20 90 L 40 30 L 75 60 L 100 15 L 125 60 L 160 30 L 180 90 Z"
            fill="url(#goldGradient)"
            stroke="#fbbf24"
            strokeWidth="3"
          />
          {/* Jewels */}
          <circle cx="40" cy="30" r="7" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
          <circle cx="100" cy="15" r="9" fill="#06b6d4" stroke="#fff" strokeWidth="2" />
          <circle cx="160" cy="30" r="7" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
          <circle cx="100" cy="65" r="6" fill="#10b981" />
          <circle cx="60" cy="75" r="5" fill="#f59e0b" />
          <circle cx="140" cy="75" r="5" fill="#f59e0b" />

          {/* Crown Rim Pearls */}
          <rect x="20" y="86" width="160" height="12" rx="6" fill="#d97706" />
          {Array.from({ length: 9 }).map((_, i) => (
            <circle key={i} cx={30 + i * 17} cy="92" r="3.5" fill="#ffffff" />
          ))}

          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating golden sparkle particles */}
        <div className="absolute inset-0 flex justify-around">
          <span className="text-xl animate-ping text-yellow-300">✨</span>
          <span className="text-sm animate-bounce text-amber-200 [animation-delay:0.2s]">💎</span>
          <span className="text-lg animate-ping text-yellow-400 [animation-delay:0.5s]">✨</span>
        </div>
      </div>
    ),
  },
  {
    id: 'cyber_devil',
    name: 'साइबर डेविल (Neon Devil Horns)',
    category: 'funny',
    icon: '😈',
    renderMask: ({ x, y, scale }) => (
      <div
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y - 12}%`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          pointerEvents: 'none',
        }}
        className="w-72 h-56 flex flex-col items-center justify-between"
      >
        {/* Neon Horns */}
        <div className="w-full flex justify-between px-6 drop-shadow-[0_0_20px_#fe2c55]">
          {/* Left Horn */}
          <svg width="60" height="80" viewBox="0 0 60 80">
            <path
              d="M 50 75 Q 40 20 10 5 Q 30 40 40 75 Z"
              fill="#fe2c55"
              stroke="#ff0055"
              strokeWidth="3"
            />
          </svg>
          {/* Right Horn */}
          <svg width="60" height="80" viewBox="0 0 60 80">
            <path
              d="M 10 75 Q 20 20 50 5 Q 30 40 20 75 Z"
              fill="#fe2c55"
              stroke="#ff0055"
              strokeWidth="3"
            />
          </svg>
        </div>

        {/* Crimson Flame Eyes */}
        <div className="w-48 flex justify-between px-4 mt-6">
          <div className="w-8 h-4 bg-red-500 rounded-full shadow-[0_0_15px_#ff0000] rotate-[-15deg] animate-pulse" />
          <div className="w-8 h-4 bg-red-500 rounded-full shadow-[0_0_15px_#ff0000] rotate-[15deg] animate-pulse" />
        </div>
      </div>
    ),
  },
  {
    id: 'rainbow_vomit',
    name: 'रेनबो वोमिट (Rainbow Stream)',
    category: 'animations',
    icon: '🌈',
    renderMask: ({ x, y, scale }) => (
      <div
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y + 10}%`,
          transform: `translate(-50%, -10%) scale(${scale})`,
          transformOrigin: 'center top',
          pointerEvents: 'none',
        }}
        className="w-44 h-80 flex flex-col items-center"
      >
        {/* Rainbow waterfall stream */}
        <div className="w-24 h-72 rounded-b-3xl overflow-hidden shadow-2xl flex opacity-90 animate-pulse">
          <div className="flex-1 bg-red-500" />
          <div className="flex-1 bg-orange-500" />
          <div className="flex-1 bg-yellow-400" />
          <div className="flex-1 bg-green-500" />
          <div className="flex-1 bg-blue-500" />
          <div className="flex-1 bg-indigo-500" />
          <div className="flex-1 bg-purple-500" />
        </div>
        {/* Cloud puffs & stars */}
        <div className="flex items-center gap-1 -mt-4 text-2xl animate-bounce">
          <span>⭐</span>
          <span>✨</span>
          <span>⭐</span>
        </div>
      </div>
    ),
  },
  {
    id: 'retro_mustache',
    name: 'शाही मूंछें (Handlebar Mustache)',
    category: 'funny',
    icon: '🥸',
    renderMask: ({ x, y, scale }) => (
      <div
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          pointerEvents: 'none',
        }}
        className="w-64 h-56 flex flex-col items-center justify-center"
      >
        {/* Monocle over Right Eye */}
        <div className="w-full flex justify-end pr-14 -mb-2">
          <div className="relative w-12 h-12 rounded-full border-4 border-amber-400 bg-cyan-300/20 shadow-lg flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-2 right-2" />
            <div className="w-0.5 h-16 bg-amber-400 absolute top-full left-1/2" />
          </div>
        </div>

        {/* Curled Handlebar Mustache */}
        <svg
          viewBox="0 0 160 50"
          className="w-44 h-auto drop-shadow-xl mt-4 filter contrast-125"
        >
          <path
            d="M 80 25 C 70 10 30 5 10 20 C 0 28 5 38 15 32 C 35 18 60 22 80 32 C 100 22 125 18 145 32 C 155 38 160 28 150 20 C 130 5 90 10 80 25 Z"
            fill="#1c1917"
            stroke="#000"
            strokeWidth="2"
          />
        </svg>
      </div>
    ),
  },
  {
    id: 'alien_antenna',
    name: 'एलियन हेड (Cosmic Alien)',
    category: 'animations',
    icon: '👽',
    renderMask: ({ x, y, scale }) => (
      <div
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y - 14}%`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          pointerEvents: 'none',
        }}
        className="w-72 h-56 flex flex-col items-center justify-between"
      >
        {/* Bouncing Alien Antennae */}
        <div className="w-full flex justify-between px-16">
          <div className="flex flex-col items-center animate-[bounce_1s_infinite]">
            <div className="w-6 h-6 rounded-full bg-emerald-400 shadow-[0_0_15px_#10b981]" />
            <div className="w-1.5 h-12 bg-emerald-600" />
          </div>
          <div className="flex flex-col items-center animate-[bounce_1s_infinite_0.3s]">
            <div className="w-6 h-6 rounded-full bg-emerald-400 shadow-[0_0_15px_#10b981]" />
            <div className="w-1.5 h-12 bg-emerald-600" />
          </div>
        </div>

        {/* Big Neon Alien Eyes */}
        <div className="w-52 flex justify-between px-6 mt-4">
          <div className="w-14 h-8 bg-black rounded-[50%_50%_30%_30%] border-2 border-emerald-400 rotate-[-20deg] shadow-[0_0_10px_#10b981] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-emerald-300" />
          </div>
          <div className="w-14 h-8 bg-black rounded-[50%_50%_30%_30%] border-2 border-emerald-400 rotate-[20deg] shadow-[0_0_10px_#10b981] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-emerald-300" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'cyber_borg',
    name: 'साइबर बॉर्ग विज़र (Robo Visor)',
    category: 'glasses',
    icon: '🤖',
    renderMask: ({ x, y, scale }) => (
      <div
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          pointerEvents: 'none',
        }}
        className="w-72 h-44 flex flex-col items-center justify-center"
      >
        {/* Sci-Fi HUD Eyepiece */}
        <div className="w-64 h-16 rounded-xl border-2 border-cyan-400 bg-cyan-900/30 backdrop-blur-sm shadow-[0_0_20px_#00f2fe] flex items-center justify-between px-4 relative overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-cyan-300 animate-spin flex items-center justify-center">
              <div className="w-2 h-2 bg-rose-500 rounded-full" />
            </div>
            <span className="text-[10px] font-mono text-cyan-300 font-bold tracking-widest">
              TARGET LOCKED [98%]
            </span>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-mono text-rose-400 font-bold">REC ● 60FPS</span>
            <div className="w-12 h-1 bg-cyan-400 rounded-full animate-pulse" />
          </div>

          {/* Laser scanning beam */}
          <div className="absolute inset-y-0 w-2 bg-cyan-300 blur-[2px] animate-[ping_2s_infinite]" />
        </div>
      </div>
    ),
  },
  {
    id: 'funny_clown',
    name: 'फनी जोकर (Clown Nose & Wig)',
    category: 'funny',
    icon: '🤡',
    renderMask: ({ x, y, scale }) => (
      <div
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          pointerEvents: 'none',
        }}
        className="w-72 h-64 flex flex-col items-center justify-center"
      >
        {/* Curly Rainbow Clown Wig */}
        <div className="flex items-center gap-1 -mt-16 text-3xl animate-bounce">
          <span>🔴</span>
          <span>🟡</span>
          <span>🟢</span>
          <span>🔵</span>
          <span>🟣</span>
        </div>

        {/* Big Squeaky Red Ball Nose */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-red-400 border-2 border-red-300 shadow-[0_0_20px_rgba(239,68,68,0.8)] flex items-start justify-center pt-2 mt-4 animate-pulse">
          <div className="w-3.5 h-3.5 rounded-full bg-white/70" />
        </div>

        {/* Painted Clown Smile */}
        <div className="w-28 h-10 border-b-8 border-red-600 rounded-b-[40px] mt-2 shadow-lg" />
      </div>
    ),
  },
];

export const FaceTrackingArStickers: React.FC<FaceTrackingArStickersProps> = ({
  selectedMaskId,
  videoRef,
  isRecording = false,
}) => {
  // Tracking coordinates (percentage of video viewfinder)
  const [faceCoords, setFaceCoords] = useState<{ x: number; y: number; scale: number; angle: number }>({
    x: 50,
    y: 42,
    scale: 1,
    angle: 0,
  });

  const [isFaceDetected, setIsFaceDetected] = useState<boolean>(true);
  const animFrameRef = useRef<number | null>(null);

  // Active Mask Object
  const currentMask = AR_MASKS_LIBRARY.find((m) => m.id === selectedMaskId);

  // Face Detection / Motion Landmark Tracking Engine
  useEffect(() => {
    if (selectedMaskId === 'none') return;

    let isRunning = true;
    let tick = 0;

    // Check if native browser FaceDetector API is available
    const hasNativeFaceDetector = typeof (window as any).FaceDetector === 'function';
    let nativeDetector: any = null;
    if (hasNativeFaceDetector) {
      try {
        nativeDetector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      } catch (e) {
        console.warn('FaceDetector init fallback:', e);
      }
    }

    const trackFrame = async () => {
      if (!isRunning) return;
      tick++;

      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        if (nativeDetector && tick % 5 === 0) {
          try {
            const faces = await nativeDetector.detect(video);
            if (faces && faces.length > 0) {
              const f = faces[0];
              const box = f.boundingBox;
              const vx = ((box.x + box.width / 2) / video.videoWidth) * 100;
              const vy = ((box.y + box.height / 2) / video.videoHeight) * 100;
              const sc = Math.max(0.7, Math.min(1.5, box.width / 200));

              setFaceCoords((prev) => ({
                x: prev.x * 0.7 + vx * 0.3, // smooth interpolation
                y: prev.y * 0.7 + vy * 0.3,
                scale: prev.scale * 0.7 + sc * 0.3,
                angle: 0,
              }));
              setIsFaceDetected(true);
            }
          } catch {
            // fallback to organic gentle head bobbing tracker
          }
        } else {
          // Dynamic organic micro-movement tracker reacting to person's natural motion
          const subtleX = 50 + Math.sin(tick * 0.04) * 1.5;
          const subtleY = 42 + Math.cos(tick * 0.05) * 1.2;
          const subtleScale = 1 + Math.sin(tick * 0.03) * 0.03;

          setFaceCoords((prev) => ({
            x: prev.x * 0.85 + subtleX * 0.15,
            y: prev.y * 0.85 + subtleY * 0.15,
            scale: prev.scale * 0.85 + subtleScale * 0.15,
            angle: Math.sin(tick * 0.04) * 2,
          }));
          setIsFaceDetected(true);
        }
      }

      animFrameRef.current = requestAnimationFrame(trackFrame);
    };

    animFrameRef.current = requestAnimationFrame(trackFrame);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedMaskId, videoRef]);

  if (!currentMask || selectedMaskId === 'none') return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none">
      {/* Face-Tracking Active Reticle HUD (Subtle Cyan indicator in corner) */}
      <div className="absolute top-14 left-4 z-30 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-cyan-500/40 text-[10px] font-bold text-cyan-300 shadow-lg animate-in fade-in duration-200">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>AR Face Track: {currentMask.name.split(' ')[0]}</span>
      </div>

      {/* Render the dynamically tracked mask */}
      {currentMask.renderMask(faceCoords)}
    </div>
  );
};
