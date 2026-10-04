export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  followers: number;
  bio?: string;
  isFollowing?: boolean;
}

export interface SoundTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number; // in seconds
  bpm: number;
  type: 'dhol' | 'lofi' | 'edm' | 'hiphop' | 'acoustic' | 'pop';
  cover?: string;
  useCount?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: Creator;
  videoUrl?: string; // Optional direct video URL or simulated vertical stream
  gradient: string; // Dynamic backdrop gradient if video buffering
  sound: SoundTrack;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  sharesCount: number;
  bookmarksCount: number;
  isBookmarked: boolean;
  category: 'dance' | 'comedy' | 'music' | 'food' | 'tech' | 'vlog' | 'fitness';
  filter?: string;
  timestamp: string;
  views: number;
  aspectRatio?: string;
  trimStart?: number;
  trimEnd?: number;
  isAIGenerated?: boolean;
  aiModel?: string;
}

export interface CommentItem {
  id: string;
  videoId: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  user: Creator;
  text: string;
  timestamp: string;
  videoSnippet?: string;
  read: boolean;
}

export interface VideoDraft {
  id: string;
  title: string;
  caption: string;
  category: 'dance' | 'comedy' | 'music' | 'food' | 'tech' | 'vlog' | 'fitness';
  videoUrl: string;
  rawVideoUrl?: string;
  sound: SoundTrack;
  filter?: string;
  speed: number;
  trimStart?: number;
  trimEnd?: number;
  createdAt: number;
  updatedAt: number;
  thumbnailUrl?: string;
  isAIGenerated?: boolean;
}
