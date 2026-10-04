import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  RotateCw,
  Zap,
  Sparkles,
  Clock,
  Music,
  Smile,
  Upload,
  Check,
  RotateCcw,
  Sliders,
  ChevronDown,
  Layers,
  Scissors,
  Film,
  Mic,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VideoItem, SoundTrack, Creator } from '../types';
import { TRENDING_SOUNDS, INITIAL_VIDEOS } from '../data/mockData';
import { Language, t } from '../utils/translations';
import { audioEngine } from '../utils/audioEngine';
import { AR_EFFECTS_LIST, ArEffectsOverlay } from './ArEffectsOverlay';
import { RealtimeFilterBar, VideoFilterType, VIDEO_FILTERS } from './RealtimeFilterBar';
import { AudioTranscriber } from './AudioTranscriber';
import { VideoTrimmer } from './VideoTrimmer';
import { VeoStudioModal } from './VeoStudioModal';
import { MusicSelectionModal } from './MusicSelectionModal';
import { FaceTrackingArStickers, AR_MASKS_LIBRARY } from './FaceTrackingArStickers';
import { LiveVoiceModal } from './LiveVoiceModal';

export type RecordingTimerLength = '3s' | '10s' | '60s';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostVideo: (newVideo: VideoItem) => void;
  currentUser: Creator;
  lang: Language;
  initialDuetVideo?: VideoItem | null;
}

export const CreateModal: React.FC<CreateModalProps> = ({
  isOpen,
  onClose,
  onPostVideo,
  currentUser,
  lang,
  initialDuetVideo = null,
}) => {
  const tr = t[lang];
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const duetVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Studio Tools State
  const [selectedSound, setSelectedSound] = useState<SoundTrack>(
    initialDuetVideo ? initialDuetVideo.sound : TRENDING_SOUNDS[0]
  );
  const [isSoundModalOpen, setIsSoundModalOpen] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [speed, setSpeed] = useState<number>(1);
  const [showSpeedBar, setShowSpeedBar] = useState<boolean>(false);
  const [beautyActive, setBeautyActive] = useState<boolean>(true);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [timerCountdown, setTimerCountdown] = useState<number>(0);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const [selectedEffectId, setSelectedEffectId] = useState<string>('none');
  const [isEffectsDrawerOpen, setIsEffectsDrawerOpen] = useState<boolean>(false);
  const [effectsTab, setEffectsTab] = useState<'all' | 'face' | 'beauty' | 'fun'>('all');

  // Recording Timer Feature: 3s, 10s, 60s Maximum Length
  const [recordTimerLength, setRecordTimerLength] = useState<RecordingTimerLength>('10s');
  const [showTimerPopover, setShowTimerPopover] = useState<boolean>(false);

  // Real-time video filter state (black-and-white, sepia, vibrant, normal)
  const [videoFilter, setVideoFilter] = useState<VideoFilterType>('normal');
  const [showFilterBar, setShowFilterBar] = useState<boolean>(true);

  // Duet mode state
  const [duetVideo, setDuetVideo] = useState<VideoItem | null>(initialDuetVideo);

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordProgress, setRecordProgress] = useState<number>(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Video Trimming Tool State
  const [isTrimmerOpen, setIsTrimmerOpen] = useState<boolean>(false);
  const [rawRecordedVideoUrl, setRawRecordedVideoUrl] = useState<string | null>(null);
  const [trimInfo, setTrimInfo] = useState<{ start: number; end: number } | null>(null);

  // Veo 3 AI Video Generator State (veo-3.1-fast-generate-preview)
  const [isVeoStudioOpen, setIsVeoStudioOpen] = useState<boolean>(false);
  const [isAIGenerated, setIsAIGenerated] = useState<boolean>(false);
  const [aiToastMessage, setAiToastMessage] = useState<string | null>(null);

  // Face Tracking AR Stickers & Masks State
  const [selectedArMaskId, setSelectedArMaskId] = useState<string>('funny_doggo');
  const [arDrawerTab, setArDrawerTab] = useState<'masks' | 'filters'>('masks');
  const [maskCategory, setMaskCategory] = useState<'all' | 'funny' | 'hats' | 'glasses' | 'animations'>('all');

  // Gemini Live Voice Session State (gemini-3.8-live)
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState<boolean>(false);

  // Post Info Fields
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState(
    initialDuetVideo ? `#Duet with ${initialDuetVideo.author.handle} 🔥` : ''
  );
  const [category, setCategory] = useState<
    'dance' | 'comedy' | 'music' | 'food' | 'tech' | 'vlog' | 'fitness'
  >('dance');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute maximum duration in seconds from chosen recording timer (3s, 10s, 60s)
  const maxDuration = recordTimerLength === '3s' ? 3 : recordTimerLength === '10s' ? 10 : 60;

  // Initialize camera stream
  useEffect(() => {
    if (!isOpen || recordedVideoUrl) return;

    let isMounted = true;
    navigator.mediaDevices
      ?.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: true,
      })
      .then((stream) => {
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.play().catch(() => {});
        }
        setCameraError(null);
      })
      .catch((err) => {
        console.warn('Camera stream error:', err);
        setCameraError('कैमरा शुरू नहीं हो पाया। आप नीचे गैलरी से वीडियो अपलोड कर सकते हैं।');
      });

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, facingMode, recordedVideoUrl]);

  // Flip camera
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Recording timer
  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordProgress((prev) => {
          const next = prev + 1;
          if (next >= maxDuration) {
            handleStopRecording();
            return maxDuration;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, maxDuration]);

  // Keyboard shortcut listener for live filter switching (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === '1') setVideoFilter('normal');
      if (e.key === '2') setVideoFilter('black-and-white');
      if (e.key === '3') setVideoFilter('sepia');
      if (e.key === '4') setVideoFilter('vibrant');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Start recording
  const handleStartRecording = () => {
    if (timerCountdown > 0) {
      setIsCountingDown(true);
      setCountdownValue(timerCountdown);
      const timerInt = window.setInterval(() => {
        setCountdownValue((val) => {
          if (val <= 1) {
            clearInterval(timerInt);
            setIsCountingDown(false);
            beginRecording();
            return 0;
          }
          return val - 1;
        });
      }, 1000);
    } else {
      beginRecording();
    }
  };

  const beginRecording = () => {
    setRecordProgress(0);
    recordedChunksRef.current = [];

    // Play duet video if active
    if (duetVideoRef.current) {
      duetVideoRef.current.currentTime = 0;
      duetVideoRef.current.play().catch(() => {});
    }

    if (streamRef.current) {
      try {
        const recorder = new MediaRecorder(streamRef.current, {
          mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : 'video/webm',
        });
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
          setRawRecordedVideoUrl(url);
          setTrimInfo(null);
          setIsAIGenerated(false);
          setIsRecording(false);
          audioEngine.stopSound();
        };
        recorder.start(100);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        audioEngine.playSound(selectedSound.type, selectedSound.bpm);
      } catch (e) {
        console.warn('Recorder fallback:', e);
        setIsRecording(true);
        audioEngine.playSound(selectedSound.type, selectedSound.bpm);
      }
    } else {
      setIsRecording(true);
      audioEngine.playSound(selectedSound.type, selectedSound.bpm);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      setIsRecording(false);
      audioEngine.stopSound();
      const fallbackUrl = duetVideo
        ? duetVideo.videoUrl ||
            'https://assets.mixkit.co/videos/preview/mixkit-young-man-dancing-freestyle-in-a-park-41982-large.mp4'
        : 'https://assets.mixkit.co/videos/preview/mixkit-young-man-dancing-freestyle-in-a-park-41982-large.mp4';
      setRecordedVideoUrl(fallbackUrl);
      setRawRecordedVideoUrl(fallbackUrl);
      setTrimInfo(null);
      setIsAIGenerated(false);
    }
    if (duetVideoRef.current) {
      duetVideoRef.current.pause();
    }
  };

  // Gallery File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setRecordedVideoUrl(url);
    setRawRecordedVideoUrl(url);
    setTrimInfo(null);
    setIsAIGenerated(false);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  // Reset recording
  const handleReset = () => {
    setRecordedVideoUrl(null);
    setRawRecordedVideoUrl(null);
    setTrimInfo(null);
    setIsAIGenerated(false);
    setRecordProgress(0);
    setIsRecording(false);
  };

  // Video Trimming Handlers
  const handleApplyTrim = (trimmedUrl: string, start: number, end: number) => {
    setRecordedVideoUrl(trimmedUrl);
    setTrimInfo({ start, end });
    setIsTrimmerOpen(false);
    setAiToastMessage(`वीडियो सफलतापूर्वक ट्रिम किया गया (${(end - start).toFixed(1)}s)!`);
    setTimeout(() => setAiToastMessage(null), 3500);
  };

  const handleRevertTrim = () => {
    if (rawRecordedVideoUrl) {
      setRecordedVideoUrl(rawRecordedVideoUrl);
      setTrimInfo(null);
      setAiToastMessage('मूल वीडियो बहाल कर दिया गया');
      setTimeout(() => setAiToastMessage(null), 3000);
    }
  };

  // Veo 3 Video Generated Handler
  const handleVeoVideoGenerated = (generatedUrl: string, promptText: string, aspect: '9:16' | '16:9') => {
    setRecordedVideoUrl(generatedUrl);
    setRawRecordedVideoUrl(generatedUrl);
    setTrimInfo(null);
    setIsAIGenerated(true);
    setTitle(promptText.slice(0, 45));
    setCaption(`${promptText} #Veo3 #AIVideo #TokiToki`);
    setAiToastMessage('Veo 3 AI वीडियो तैयार! आप इसे ट्रिम टूल से क्लिप भी कर सकते हैं।');
    setTimeout(() => setAiToastMessage(null), 4000);
  };

  // Post Video
  const handlePost = () => {
    setIsSubmitting(true);
    const tags = caption.match(/#[a-zA-Z0-9_\u0900-\u097F]+/g)?.map((t) => t.substring(1)) || [
      'TokiToki',
      'Viral',
    ];

    const newVideo: VideoItem = {
      id: `toki_${Date.now()}`,
      title: title || (duetVideo ? `Duet with ${duetVideo.author.name} 🔥` : 'TokiToki New Reel 🌟'),
      description:
        caption || 'टोका-टोकी (TokiToki) पर मेरा नया वीडियो! लाइक और शेयर करें #TokiToki #Viral',
      tags,
      author: currentUser,
      videoUrl:
        recordedVideoUrl ||
        'https://assets.mixkit.co/videos/preview/mixkit-young-man-dancing-freestyle-in-a-park-41982-large.mp4',
      gradient: 'from-rose-600 via-pink-600 to-indigo-900',
      sound: selectedSound,
      likesCount: 1,
      isLiked: true,
      commentsCount: 0,
      sharesCount: 0,
      bookmarksCount: 0,
      isBookmarked: false,
      category,
      filter: videoFilter,
      timestamp: 'अभी-अभी',
      views: 1,
      trimStart: trimInfo?.start,
      trimEnd: trimInfo?.end,
      isAIGenerated,
      aiModel: isAIGenerated ? 'veo-3.1-fast-generate-preview' : undefined,
    };

    setTimeout(() => {
      onPostVideo(newVideo);
      setIsSubmitting(false);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00f2fe', '#fe2c55', '#ffffff', '#f59e0b'],
      });

      onClose();
    }, 600);
  };

  // Active effect and real-time filter CSS computation
  const currentEffect = AR_EFFECTS_LIST.find((e) => e.id === selectedEffectId);
  const activeFilterObj = VIDEO_FILTERS.find((f) => f.id === videoFilter);

  const activeCssFilter = [
    activeFilterObj?.css !== 'none' ? activeFilterObj?.css : '',
    beautyActive ? 'contrast(105%) brightness(108%)' : '',
    currentEffect?.cssFilter !== 'none' ? currentEffect?.cssFilter : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black select-none overflow-hidden">
      {/* Fullscreen Video Viewfinder Container */}
      <div className="relative w-full h-full max-w-[500px] max-h-screen bg-slate-950 flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Flash overlay if active */}
        {flashActive && (
          <div className="absolute inset-0 z-30 bg-amber-100/30 pointer-events-none mix-blend-screen" />
        )}

        {/* TOP BAR: [X] Close (Left) | ♫ Sounds selector (Center) */}
        <div className="relative z-30 pt-4 px-4 flex items-center justify-between pointer-events-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ♫ Sounds Pill Button */}
          <button
            onClick={() => setIsSoundModalOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg transition-transform active:scale-95 cursor-pointer max-w-[210px]"
          >
            <Music className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
            <span className="truncate">{selectedSound.title}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {/* Duet indicator / Reset */}
          {duetVideo && (
            <button
              onClick={() => setDuetVideo(null)}
              className="px-2.5 py-1 rounded-full bg-rose-500/80 text-white text-[10px] font-bold"
            >
              ड्युएट हटाएं
            </button>
          )}
          {!duetVideo && <div className="w-10" />}
        </div>

        {/* SPEED BAR (When open) */}
        {showSpeedBar && !recordedVideoUrl && (
          <div className="relative z-30 mx-auto mt-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-3">
            {[0.3, 0.5, 1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`text-xs font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  speed === s ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        )}

        {/* REAL-TIME FILTER SELECTION BAR (Black-and-White, Sepia, Vibrant, Normal) */}
        {/* Visible ALWAYS, including live WHILE RECORDING! */}
        {!recordedVideoUrl && showFilterBar && (
          <div className="relative z-30 mx-auto mt-2 pointer-events-auto animate-in fade-in duration-200">
            <RealtimeFilterBar
              currentFilter={videoFilter}
              onSelectFilter={setVideoFilter}
              isRecording={isRecording}
            />
          </div>
        )}

        {/* RIGHT VERTICAL TOOLBAR: Flip, Speed, Beauty, Filters, Timer, Flash, Duet */}
        {!recordedVideoUrl && (
          <div className="absolute right-3.5 top-20 z-30 flex flex-col items-center gap-4 text-white pointer-events-auto">
            {/* Flip Camera */}
            <button
              onClick={handleFlipCamera}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-black/60 active:scale-90 transition-transform">
                <RotateCw className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-medium drop-shadow">फ्लिप</span>
            </button>

            {/* Speed Toggle */}
            <button
              onClick={() => setShowSpeedBar((prev) => !prev)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform ${
                  speed !== 1 ? 'bg-rose-500 text-white' : 'bg-black/40 text-white group-hover:bg-black/60'
                }`}
              >
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium drop-shadow">{speed}x स्पीड</span>
            </button>

            {/* Beauty Mode */}
            <button
              onClick={() => setBeautyActive((b) => !b)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform ${
                  beautyActive ? 'bg-rose-500 text-white' : 'bg-black/40 text-white group-hover:bg-black/60'
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium drop-shadow">ब्यूटी</span>
            </button>

            {/* Filters Toggle Button */}
            <button
              onClick={() => setShowFilterBar((prev) => !prev)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform ${
                  videoFilter !== 'normal'
                    ? 'bg-rose-500 text-white'
                    : 'bg-black/40 text-white group-hover:bg-black/60'
                }`}
              >
                <Sliders className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium drop-shadow">फ़िल्टर</span>
            </button>

            {/* Timer (3s, 10s, 60s selector) */}
            <button
              onClick={() => {
                setRecordTimerLength((prev) => (prev === '3s' ? '10s' : prev === '10s' ? '60s' : '3s'));
              }}
              className="flex flex-col items-center gap-1 group cursor-pointer"
              title="अधिकतम समय सीमा बदलें (3s, 10s, 60s)"
            >
              <div className="w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform bg-[#fe2c55] text-white shadow-md shadow-rose-500/30 ring-1 ring-white/30">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-white drop-shadow">
                {recordTimerLength}
              </span>
            </button>

            {/* Flash */}
            <button
              onClick={() => setFlashActive((f) => !f)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform ${
                  flashActive ? 'bg-yellow-400 text-black' : 'bg-black/40 text-white group-hover:bg-black/60'
                }`}
              >
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium drop-shadow">फ्लैश</span>
            </button>

            {/* Duet Mode Button */}
            {!duetVideo && (
              <button
                onClick={() => setDuetVideo(INITIAL_VIDEOS[0])}
                className="flex flex-col items-center gap-1 group cursor-pointer"
                title="ड्युएट बनाएं"
              >
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-black/60 active:scale-90 transition-transform">
                  <Layers className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-[10px] font-medium drop-shadow">ड्युएट</span>
              </button>
            )}

            {/* Music Selection Button */}
            <button
              onClick={() => setIsSoundModalOpen(true)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
              title="संगीत या साउंड चुनें (Select Music Track)"
            >
              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-black/60 active:scale-90 transition-transform">
                <Music className="w-5 h-5 text-rose-400" />
              </div>
              <span className="text-[10px] font-medium drop-shadow">म्यूजिक</span>
            </button>

            {/* Veo 3 AI Video Generator Button */}
            <button
              onClick={() => setIsVeoStudioOpen(true)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
              title="Veo 3 AI से वीडियो बनाएं (टेक्स्ट या फोटो)"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-rose-500 to-cyan-400 p-0.5 shadow-lg group-hover:scale-105 active:scale-90 transition-transform">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-cyan-400 drop-shadow">
                Veo 3 AI
              </span>
            </button>

            {/* Toki Live AI Voice Chat Button (gemini-3.8-live) */}
            <button
              onClick={() => setIsLiveVoiceOpen(true)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
              title="टोकी AI से लाइव बोलकर बात करें (Gemini 3.8 Live API)"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-purple-600 p-0.5 shadow-lg group-hover:scale-105 active:scale-90 transition-transform">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <Mic className="w-4 h-4 text-rose-400 animate-pulse" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-white drop-shadow">
                Toki Live
              </span>
            </button>
          </div>
        )}

        {/* CENTER VIEWFINDER: Single Camera or Split-Screen Duet */}
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black overflow-hidden">
          {recordedVideoUrl ? (
            /* Review Mode */
            <div className="relative w-full h-full flex flex-col justify-between">
              <video
                src={recordedVideoUrl}
                controls
                autoPlay
                loop
                playsInline
                style={{ filter: activeCssFilter }}
                className="w-full h-full object-cover"
              />

              {/* Review Top Overlay Controls: Reset, Music Selection, Trim Video, and Revert */}
              <div className="absolute top-4 inset-x-4 z-30 flex items-center justify-between pointer-events-auto">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/20 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>फिर से रिकॉर्ड करें</span>
                </button>

                <div className="flex items-center gap-2">
                  {/* Music Overlay Selection Button */}
                  <button
                    onClick={() => setIsSoundModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-bold backdrop-blur-md border border-white/20 cursor-pointer transition-colors"
                    title="बैकग्राउंड म्यूजिक बदलें या ओवरले करें"
                  >
                    <Music className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate max-w-[85px]">{selectedSound.title.split(' ')[0]}</span>
                  </button>

                  {/* VIDEO TRIMMING TOOL BUTTON */}
                  <button
                    onClick={() => setIsTrimmerOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#fe2c55] to-cyan-400 hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-rose-500/25 border border-white/30 cursor-pointer transition-transform active:scale-95"
                    title="वीडियो के शुरुआती और अंतिम हिस्से को काटें (Clip Start/End Points)"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>ट्रिम करें</span>
                  </button>

                  {/* Revert Trim if active */}
                  {trimInfo && (
                    <button
                      onClick={handleRevertTrim}
                      className="px-2.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold backdrop-blur-md border border-slate-700 cursor-pointer"
                      title="मूल वीडियो पर वापस जाएं"
                    >
                      रीसेट
                    </button>
                  )}
                </div>
              </div>

              {/* Review Info Badges (Music track, Trimmed duration, AI Generated tag) */}
              <div className="absolute top-16 left-4 z-30 flex flex-wrap gap-2 pointer-events-none">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 text-slate-200 text-[11px] font-semibold shadow backdrop-blur-md border border-white/10">
                  <Music className="w-3 h-3 text-rose-400" />
                  <span>{selectedSound.title}</span>
                </div>
                {trimInfo && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/90 text-slate-950 text-[11px] font-bold shadow-lg backdrop-blur-md">
                    <Scissors className="w-3 h-3" />
                    <span>
                      ट्रिम किया गया: {trimInfo.start.toFixed(1)}s - {trimInfo.end.toFixed(1)}s (
                      {(trimInfo.end - trimInfo.start).toFixed(1)}s)
                    </span>
                  </div>
                )}
                {isAIGenerated && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600 to-rose-600 text-white text-[11px] font-bold shadow-lg backdrop-blur-md">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Veo 3 AI जनरेटेड</span>
                  </div>
                )}
              </div>
            </div>
          ) : duetVideo ? (
            /* Side-by-Side 50/50 Duet Mode */
            <div className="w-full h-full flex">
              {/* Left: User Camera */}
              <div className="w-1/2 h-full relative border-r border-slate-700 bg-black flex items-center justify-center overflow-hidden">
                <video
                  ref={videoPreviewRef}
                  playsInline
                  muted
                  autoPlay
                  style={{ filter: activeCssFilter }}
                  className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
                />
                <ArEffectsOverlay effectId={selectedEffectId} />
                <FaceTrackingArStickers
                  selectedMaskId={selectedArMaskId}
                  videoRef={videoPreviewRef}
                  isRecording={isRecording}
                />
                <span className="absolute bottom-2 left-2 z-20 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md">
                  आप (You)
                </span>
              </div>

              {/* Right: Duet Target Video */}
              <div className="w-1/2 h-full relative bg-slate-900 flex items-center justify-center overflow-hidden">
                <video
                  ref={duetVideoRef}
                  src={duetVideo.videoUrl}
                  loop
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 z-20 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md">
                  {duetVideo.author.handle}
                </span>
              </div>
            </div>
          ) : (
            /* Standard Fullscreen Camera Viewfinder */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {cameraError ? (
                <div className="p-8 text-center text-slate-300 space-y-3 z-20">
                  <p className="text-sm">{cameraError}</p>
                </div>
              ) : (
                <video
                  ref={videoPreviewRef}
                  playsInline
                  muted
                  autoPlay
                  style={{ filter: activeCssFilter }}
                  className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
                />
              )}
              {/* AR Face Stickers & Visual Effects Overlays */}
              <ArEffectsOverlay effectId={selectedEffectId} />
              <FaceTrackingArStickers
                selectedMaskId={selectedArMaskId}
                videoRef={videoPreviewRef}
                isRecording={isRecording}
              />
            </div>
          )}

          {/* Countdown Ping Overlay */}
          {isCountingDown && (
            <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="text-8xl font-black text-white animate-ping drop-shadow-2xl">
                {countdownValue}
              </span>
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS: Effects | Red Shutter | Upload + Duration tabs */}
        {!recordedVideoUrl ? (
          <div className="relative z-30 pb-6 px-6 flex flex-col items-center gap-3 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-auto">
            {/* Live Filter Indicator while recording */}
            {isRecording && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold animate-pulse shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>REC {recordProgress}s / {maxDuration}s</span>
                <span className="opacity-80">· फ़िल्टर: {activeFilterObj?.label}</span>
              </div>
            )}

            {/* Main Action Shutter Row */}
            <div className="w-full flex items-center justify-between max-w-xs">
              {/* LEFT: 😊 Effects Button */}
              <button
                onClick={() => setIsEffectsDrawerOpen(true)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-cyan-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-xl">
                    😊
                  </div>
                </div>
                <span className="text-[11px] font-bold text-white drop-shadow">Effects</span>
              </button>

              {/* CENTER: Big Red Record Button with Animated Ring */}
              <div className="relative flex items-center justify-center">
                {/* SVG Progress Ring */}
                {isRecording && (
                  <svg className="absolute w-24 h-24 -rotate-90 pointer-events-none">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="rgba(255, 255, 255, 0.3)"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#fe2c55"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={251}
                      strokeDashoffset={251 - (251 * recordProgress) / maxDuration}
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-90 ${
                    isRecording
                      ? 'bg-white ring-4 ring-rose-500 scale-95'
                      : 'bg-[#fe2c55] hover:bg-rose-600 ring-4 ring-white/40'
                  }`}
                  aria-label={isRecording ? 'Stop' : 'Record'}
                >
                  {isRecording ? (
                    <div className="w-7 h-7 rounded-md bg-[#fe2c55]" />
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-white/40 bg-[#fe2c55]" />
                  )}
                </button>
              </div>

              {/* RIGHT: 🖼 Gallery Upload Button */}
              <label className="flex flex-col items-center gap-1 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <span className="text-[11px] font-bold text-white drop-shadow">Upload</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* RECORDING TIMER FEATURE: 3s | 10s | 60s Maximum Length Selector */}
            <div className="flex flex-col items-center gap-1.5 pt-1">
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-lg">
                <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-300 pr-1">
                  टाइमर:
                </span>
                {(['3s', '10s', '60s'] as const).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setRecordTimerLength(len)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
                      recordTimerLength === len
                        ? 'bg-gradient-to-r from-[#fe2c55] to-rose-600 text-white shadow-md shadow-rose-500/40 ring-1 ring-white/50 scale-105'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>

              <span className="text-[10px] text-slate-400 font-medium">
                अधिकतम रिकॉर्डिंग समय:{' '}
                <strong className="text-white">
                  {recordTimerLength === '3s'
                    ? '3 सेकंड'
                    : recordTimerLength === '10s'
                    ? '10 सेकंड'
                    : '60 सेकंड'}
                </strong>
              </span>
            </div>
          </div>
        ) : (
          /* POST FINALIZATION DRAWER */
          <div className="relative z-30 p-5 bg-slate-900 border-t border-slate-800 rounded-t-3xl space-y-3.5 pointer-events-auto">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>विवरण जोड़ें व पोस्ट करें (फ़िल्टर: {activeFilterObj?.label})</span>
            </h3>

            {/* Speech to Text Transcriber using gemini-3.5-transcribe */}
            <AudioTranscriber
              buttonLabel="माइक से कैप्शन बोलें (AI Transcribe)"
              onTranscribeComplete={(transcript) => {
                setCaption((prev) => (prev ? `${prev} ${transcript}` : transcript));
                if (!title) {
                  setTitle(transcript.slice(0, 35) + (transcript.length > 35 ? '...' : ''));
                }
              }}
            />

            {/* Quick Trim Action Trigger in Post Drawer */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {trimInfo
                      ? `क्लिप अवधि: ${(trimInfo.end - trimInfo.start).toFixed(1)}s`
                      : 'वीडियो ट्रिम करें (Trim Video Tool)'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {trimInfo
                      ? `${trimInfo.start.toFixed(1)}s से ${trimInfo.end.toFixed(1)}s तक काटा गया`
                      : 'शुरुआत व समाप्ति बिंदु को आसानी से काटें'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTrimmerOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>{trimInfo ? 'पुनः ट्रिम करें' : 'ट्रिम टूल खोलें'}</span>
              </button>
            </div>

            {/* Background Music Track Card */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-500 shrink-0">
                  <Music className="w-4 h-4 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate max-w-[190px]">
                    {selectedSound.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {selectedSound.artist} · {selectedSound.genre}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSoundModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-white text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
              >
                <Music className="w-3.5 h-3.5" />
                <span>साउंड बदलें</span>
              </button>
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="वीडियो का शीर्षक (e.g. Desi Dance Vibes)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
            />

            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="कैप्शन व हैशटैग... #TokiToki #Viral"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                onClick={handlePost}
                disabled={isSubmitting}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#fe2c55] via-pink-500 to-[#00f2fe] text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? tr.posting : 'TokiToki पर पोस्ट करें'}</span>
              </button>
            </div>
          </div>
        )}

        {/* AR FACE STICKERS & EFFECTS DRAWER */}
        {isEffectsDrawerOpen && (
          <div className="absolute inset-x-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 rounded-t-3xl p-4 space-y-3 animate-in slide-in-from-bottom duration-200">
            {/* Header with Close */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              {/* Primary Drawer Tabs: Face AR Masks vs Visual FX */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setArDrawerTab('masks')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    arDrawerTab === 'masks'
                      ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🎭 फेस AR मास्क
                </button>
                <button
                  type="button"
                  onClick={() => setArDrawerTab('filters')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    arDrawerTab === 'filters'
                      ? 'bg-rose-500 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ✨ विज़ुअल इफेक्ट्स
                </button>
              </div>

              <button
                onClick={() => setIsEffectsDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB 1: FACE-TRACKING AR MASKS & STICKERS */}
            {arDrawerTab === 'masks' && (
              <div className="space-y-2.5">
                {/* Mask Subcategories */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { id: 'all', label: 'सभी मास्क' },
                    { id: 'funny', label: '🐶 फनी' },
                    { id: 'hats', label: '👑 हैट्स व मुकुट' },
                    { id: 'glasses', label: '🕶️ ग्लासेज व विज़र' },
                    { id: 'animations', label: '✨ एनिमेशन' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setMaskCategory(cat.id as typeof maskCategory)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        maskCategory === cat.id
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Face AR Masks Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-h-48 overflow-y-auto no-scrollbar py-1">
                  {AR_MASKS_LIBRARY.filter(
                    (mask) => maskCategory === 'all' || mask.category === maskCategory
                  ).map((mask) => (
                    <button
                      key={mask.id}
                      onClick={() => {
                        setSelectedArMaskId(mask.id);
                        setAiToastMessage(
                          mask.id === 'none'
                            ? 'मास्क हटाया गया'
                            : `'${mask.name.split(' ')[0]}' फेस ट्रैकिंग मास्क सक्रिय!`
                        );
                        setTimeout(() => setAiToastMessage(null), 2500);
                      }}
                      className={`flex flex-col items-center gap-1 p-2 rounded-2xl border transition-all cursor-pointer ${
                        selectedArMaskId === mask.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-white scale-105 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-2xl animate-bounce duration-1000">{mask.icon}</span>
                      <span className="text-[10px] font-medium truncate w-full text-center">
                        {mask.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: VISUAL ATMOSPHERE FILTERS */}
            {arDrawerTab === 'filters' && (
              <div className="space-y-2.5">
                {/* Effects Category Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {[
                    { id: 'all', label: 'ट्रेंडिंग' },
                    { id: 'face', label: 'फेस इफेक्ट्स' },
                    { id: 'beauty', label: 'ब्यूटी' },
                    { id: 'fun', label: 'फन' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setEffectsTab(tab.id as typeof effectsTab)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        effectsTab === tab.id
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Effects Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 max-h-48 overflow-y-auto no-scrollbar py-1">
                  {AR_EFFECTS_LIST.filter(
                    (eff) => effectsTab === 'all' || eff.category === effectsTab
                  ).map((eff) => (
                    <button
                      key={eff.id}
                      onClick={() => setSelectedEffectId(eff.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-2xl border transition-all cursor-pointer ${
                        selectedEffectId === eff.id
                          ? 'bg-rose-500/20 border-rose-500 text-white scale-105'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-2xl">{eff.icon}</span>
                      <span className="text-[10px] font-medium truncate w-full text-center">
                        {eff.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ♫ MUSIC SELECTION MODAL COMPONENT (Trending tracks & overlay volume mixer) */}
        <MusicSelectionModal
          isOpen={isSoundModalOpen}
          onClose={() => setIsSoundModalOpen(false)}
          selectedSound={selectedSound}
          onSelectSound={(sound, volume) => {
            setSelectedSound(sound);
            if (volume !== undefined) {
              audioEngine.setVolume(volume);
            }
            setAiToastMessage(`'${sound.title}' बैकग्राउंड म्यूजिक सेट किया गया!`);
            setTimeout(() => setAiToastMessage(null), 3000);
          }}
          lang={lang}
        />

        {/* VIDEO TRIMMER MODAL OVERLAY */}
        {isTrimmerOpen && recordedVideoUrl && (
          <VideoTrimmer
            videoUrl={recordedVideoUrl}
            originalVideoUrl={rawRecordedVideoUrl || undefined}
            onApplyTrim={handleApplyTrim}
            onCancel={() => setIsTrimmerOpen(false)}
            lang={lang}
          />
        )}

        {/* VEO 3 AI VIDEO GENERATOR MODAL */}
        <VeoStudioModal
          isOpen={isVeoStudioOpen}
          onClose={() => setIsVeoStudioOpen(false)}
          onVideoGenerated={handleVeoVideoGenerated}
          lang={lang}
        />

        {/* TOKI LIVE AI VOICE CONVERSATION MODAL (gemini-3.8-live) */}
        <LiveVoiceModal
          isOpen={isLiveVoiceOpen}
          onClose={() => setIsLiveVoiceOpen(false)}
          lang={lang}
        />

        {/* AI & TRIM NOTIFICATION TOAST */}
        {aiToastMessage && (
          <div className="absolute top-16 inset-x-4 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-slate-900/95 backdrop-blur-md text-white border border-rose-500/50 shadow-2xl px-4 py-2.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" />
              <span>{aiToastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
