import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Film,
  Image as ImageIcon,
  Upload,
  X,
  Check,
  AlertCircle,
  Clock,
  Zap,
  Play,
  Scissors,
} from 'lucide-react';

interface VeoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoGenerated: (videoUrl: string, promptText: string, aspectRatio: '9:16' | '16:9') => void;
  lang?: 'hi' | 'en';
}

const PROMPT_SUGGESTIONS = [
  'Cyberpunk Mumbai street at night with neon lights and flying auto-rickshaws',
  'Energetic Bollywood street dance in colorful traditional attire with confetti',
  'Cute fluffy cat wearing futuristic sunglasses DJing at a rooftop party',
  'Cinematic drone shot flying through Himalayan snow-covered mountain peaks at sunset',
  'Slow motion splash of vibrant Holi powder colors floating in the air',
  'Futuristic electric sports car drifting on a coastal highway at twilight',
];

export const VeoStudioModal: React.FC<VeoStudioModalProps> = ({
  isOpen,
  onClose,
  onVideoGenerated,
  lang = 'hi',
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');

  // Generation status state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  if (!isOpen) return null;

  // Handle image upload for Image-to-Video
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    const preview = URL.createObjectURL(file);
    setImagePreviewUrl(preview);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setUploadedImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  // Start Generation
  const handleStartGeneration = async () => {
    if (activeTab === 'text' && !prompt.trim()) {
      setErrorMessage('कृपया वीडियो के लिए कोई प्रॉम्प्ट लिखें (Please enter a prompt)');
      return;
    }
    if (activeTab === 'image' && !uploadedImageBase64) {
      setErrorMessage('कृपया पहले कोई फोटो अपलोड करें (Please upload a photo first)');
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    setElapsedSeconds(0);
    setGenerationStage('Veo 3 AI (veo-3.1-fast-generate-preview) को अनुरोध भेजा जा रहा है...');

    // Start timer counter
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    try {
      // Step 1: Initiate video generation operation on backend
      const genPayload: any = {
        aspectRatio,
        prompt: prompt.trim() || (activeTab === 'image' ? 'Animate this photo with cinematic natural motion' : ''),
      };

      if (activeTab === 'image' && uploadedImageBase64) {
        genPayload.imageBase64 = uploadedImageBase64;
        genPayload.mimeType = imageMimeType;
      }

      const initRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genPayload),
      });

      if (!initRes.ok) {
        const errorData = await initRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'वीडियो जनरेशन शुरू करने में विफल रहा');
      }

      const { operationName } = await initRes.json();
      if (!operationName) {
        throw new Error('ऑपरेशन नाम प्राप्त नहीं हुआ');
      }

      setGenerationStage('Veo 3 AI वीडियो फ्रेम्स तैयार कर रहा है (Rendering frames)...');

      // Step 2: Poll operation status
      let isDone = false;
      let pollAttempts = 0;
      const maxPollAttempts = 40; // ~2-3 minutes max

      while (!isDone && pollAttempts < maxPollAttempts) {
        pollAttempts++;
        await new Promise((r) => setTimeout(r, 4000));

        if (pollAttempts === 2) {
          setGenerationStage('प्रकाश व भौतिकी मोशन का समन्वय (Lighting & physics)...');
        } else if (pollAttempts === 5) {
          setGenerationStage('अंतिम वीडियो स्ट्रीम संकलन (Assembling video stream)...');
        }

        const pollRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });

        if (!pollRes.ok) {
          const pollErr = await pollRes.json().catch(() => ({}));
          throw new Error(pollErr.error || 'स्टेटस जांचने में समस्या');
        }

        const pollData = await pollRes.json();
        if (pollData.error) {
          throw new Error(pollData.error);
        }

        if (pollData.done) {
          isDone = true;
          break;
        }
      }

      if (!isDone) {
        throw new Error('वीडियो बनाने में अधिक समय लग रहा है। कृपया पुनः प्रयास करें।');
      }

      // Step 3: Download finished video binary
      setGenerationStage('वीडियो डाउनलोड व लोड हो रहा है...');
      const downloadRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });

      if (!downloadRes.ok) {
        const dlErr = await downloadRes.json().catch(() => ({}));
        throw new Error(dlErr.error || 'तैयार वीडियो डाउनलोड करने में विफल');
      }

      const videoBlob = await downloadRes.blob();
      const generatedUrl = URL.createObjectURL(videoBlob);

      if (timerRef.current) clearInterval(timerRef.current);
      setIsGenerating(false);

      // Return generated video to CreateModal
      onVideoGenerated(
        generatedUrl,
        prompt || (activeTab === 'image' ? 'Veo 3 Animated Photo Reel' : 'Veo 3 AI Video'),
        aspectRatio
      );
      onClose();
    } catch (err: any) {
      console.error('Veo generation error:', err);
      if (timerRef.current) clearInterval(timerRef.current);
      setIsGenerating(false);
      setErrorMessage(err.message || 'वीडियो बनाने में त्रुटि हुई। कृपया दोबारा प्रयास करें।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#fe2c55] via-purple-600 to-[#00f2fe] p-0.5 flex items-center justify-center shadow-lg">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-rose-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-white">Veo 3 AI वीडियो स्टूडियो</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  veo-3.1-fast-generate-preview
                </span>
              </div>
              <p className="text-xs text-slate-400">
                टेक्स्ट लिखकर या फोटो अपलोड कर आश्चर्यजनक AI वीडियो बनाएं
              </p>
            </div>
          </div>

          {!isGenerating && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Selection: Text to Video vs Animate Image into Video */}
        {!isGenerating && (
          <div className="flex items-center gap-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-gradient-to-r from-[#fe2c55] to-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>टेक्स्ट से वीडियो (Text to Video)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('image')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'image'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>फोटो को वीडियो में बदलें (Animate Image)</span>
            </button>
          </div>
        )}

        {/* GENERATION IN PROGRESS SCREEN */}
        {isGenerating ? (
          <div className="py-8 px-4 text-center space-y-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 border-t-[#fe2c55] border-r-cyan-400 animate-spin" />
              <Sparkles className="w-8 h-8 text-rose-400 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white">Veo 3 AI वीडियो निर्माण जारी है...</h4>
              <p className="text-xs text-cyan-300 font-medium animate-pulse">{generationStage}</p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>समय बीता: {elapsedSeconds} सेकंड</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl text-left border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <p className="font-semibold text-rose-400">💡 सुझाव:</p>
              <p>
                वीडियो तैयार होने के बाद आप इसे <strong>वीडियो ट्रिम टूल (Trim Tool)</strong> से क्लिप कर सकते हैं और म्यूजिक जोड़ सकते हैं!
              </p>
            </div>
          </div>
        ) : (
          /* FORM CONTROLS */
          <div className="space-y-4">
            {/* TAB 1: TEXT TO VIDEO */}
            {activeTab === 'text' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-rose-400" />
                  <span>वीडियो प्रॉम्प्ट (वर्णन करें कि वीडियो में क्या होना चाहिए):</span>
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="उदा. 'Mumbai street at sunset with energetic dance in neon lights' या 'हवा में उड़ता हुआ रंगीन पतंग उत्सव'..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500 resize-none placeholder-slate-500"
                />

                {/* Prompt suggestions chips */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-400">ट्रेंडिंग सुझाव (क्लिक करें):</span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                    {PROMPT_SUGGESTIONS.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPrompt(sug)}
                        className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2 py-1 rounded-lg border border-slate-800/80 text-left transition-colors cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ANIMATE IMAGE INTO VIDEO */}
            {activeTab === 'image' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>फोटो अपलोड करें जिसे वीडियो बनाना है:</span>
                </label>

                {imagePreviewUrl ? (
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center group">
                    <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreviewUrl(null);
                        setUploadedImageBase64(null);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-36 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-400 bg-slate-900/60 hover:bg-slate-900 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-300">
                      फोटो चुनने के लिए क्लिक करें (JPG, PNG, WebP)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Veo 3 AI इस फोटो में प्राकृतिक गति व मोशन जोड़ेगा
                    </span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div>
                  <label className="text-xs font-bold text-slate-300">
                    मोशन/एनिमेशन प्रॉम्प्ट (वैकल्पिक):
                  </label>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="उदा. 'कैमरा धीरे-धीरे ज़ूम इन करे और बाल हवा में लहराएं'..."
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                  />
                </div>
              </div>
            )}

            {/* ASPECT RATIO SELECTION: 9:16 (Portrait) vs 16:9 (Landscape) */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>पहलू अनुपात (Aspect Ratio):</span>
                <span className="text-[11px] font-mono text-cyan-400">
                  {aspectRatio === '9:16' ? '9:16 (रील / शॉर्ट्स)' : '16:9 (लैंडस्केप / चौड़ा)'}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    aspectRatio === '9:16'
                      ? 'bg-rose-500/20 border-rose-500 text-white shadow-sm shadow-rose-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="w-3.5 h-6 border-2 border-current rounded-sm" />
                  <span>9:16 (Portrait / Reels)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    aspectRatio === '16:9'
                      ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="w-6 h-3.5 border-2 border-current rounded-sm" />
                  <span>16:9 (Landscape)</span>
                </button>
              </div>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                रद्द करें
              </button>

              <button
                type="button"
                onClick={handleStartGeneration}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#fe2c55] via-purple-600 to-[#00f2fe] text-white text-xs font-bold shadow-lg shadow-rose-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {activeTab === 'text' ? 'Veo 3 AI वीडियो बनाएं' : 'फोटो से वीडियो एनिमेट करें'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
