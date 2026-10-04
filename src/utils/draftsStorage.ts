import { VideoDraft } from '../types';
import { TRENDING_SOUNDS } from '../data/mockData';

const DRAFTS_STORAGE_KEY = 'tokitoki_video_drafts_v1';

export const INITIAL_DRAFTS: VideoDraft[] = [
  {
    id: 'draft_starter_1',
    title: 'स्ट्रीट डांस प्रैक्टिस (Street Dance Session)',
    caption: 'नई कोरियोग्राफी का पहला ड्राफ़्ट! साउंड और टाइमिंग परफेक्ट करनी बाकी है #DancePractice #TokiToki',
    category: 'dance',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-dancing-freestyle-in-a-park-41982-large.mp4',
    rawVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-dancing-freestyle-in-a-park-41982-large.mp4',
    sound: TRENDING_SOUNDS[0], // Desi Dhol Dhamaka
    filter: 'normal',
    speed: 1,
    trimStart: 0,
    trimEnd: 8.5,
    createdAt: Date.now() - 1000 * 60 * 120, // 2 hours ago
    updatedAt: Date.now() - 1000 * 60 * 35,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
    isAIGenerated: false,
  },
  {
    id: 'draft_starter_2',
    title: 'शाम की चाय व मखमली संगीत (Chai & Sunset)',
    caption: 'शांत शाम, गरमा-गरम चाय और लो-फाइ धुनें ☕✨ #ChaiLover #EveningVibes',
    category: 'vlog',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-warm-cup-of-coffee-41712-large.mp4',
    rawVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-warm-cup-of-coffee-41712-large.mp4',
    sound: TRENDING_SOUNDS[1], // Chai & Lofi Memories
    filter: 'sepia',
    speed: 0.5,
    trimStart: 1.0,
    trimEnd: 6.0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 12,
    thumbnailUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&auto=format&fit=crop&q=80',
    isAIGenerated: false,
  },
];

export const getStoredDrafts = (): VideoDraft[] => {
  try {
    const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(INITIAL_DRAFTS));
      return INITIAL_DRAFTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_DRAFTS;
  } catch (e) {
    console.warn('Failed to load drafts from storage:', e);
    return INITIAL_DRAFTS;
  }
};

export const saveDraftToStorage = (draft: VideoDraft): VideoDraft[] => {
  try {
    const current = getStoredDrafts();
    const existingIndex = current.findIndex((d) => d.id === draft.id);
    let updated: VideoDraft[];

    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...draft, updatedAt: Date.now() };
    } else {
      updated = [{ ...draft, updatedAt: Date.now() }, ...current];
    }

    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save draft to storage:', e);
    return [draft];
  }
};

export const deleteDraftFromStorage = (draftId: string): VideoDraft[] => {
  try {
    const current = getStoredDrafts();
    const updated = current.filter((d) => d.id !== draftId);
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to delete draft from storage:', e);
    return [];
  }
};
