import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DesktopSidebar } from './components/DesktopSidebar';
import { DesktopRightPanel } from './components/DesktopRightPanel';
import { FeedView } from './components/FeedView';
import { ExploreView } from './components/ExploreView';
import { ProfileView } from './components/ProfileView';
import { ActivityView } from './components/ActivityView';
import { CommentsDrawer } from './components/CommentsDrawer';
import { ShareModal } from './components/ShareModal';
import { CreateModal } from './components/CreateModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';

import {
  CURRENT_USER,
  INITIAL_VIDEOS,
  INITIAL_COMMENTS,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import { VideoItem, Creator, CommentItem, NotificationItem } from './types';
import { Language, t } from './utils/translations';
import { audioEngine } from './utils/audioEngine';

export default function App() {
  // Navigation & Language
  const [lang, setLang] = useState<Language>('hi');
  const [currentTab, setCurrentTab] = useState<'home' | 'explore' | 'inbox' | 'profile'>('home');
  const [feedMode, setFeedMode] = useState<'foryou' | 'following'>('foryou');

  // Core Data State
  const [videos, setVideos] = useState<VideoItem[]>(INITIAL_VIDEOS);
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>(INITIAL_COMMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [currentUser, setCurrentUser] = useState<Creator>(CURRENT_USER);
  const [viewingCreator, setViewingCreator] = useState<Creator | null>(null);

  // Playback & Index
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Modals & Drawers
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [duetTargetVideo, setDuetTargetVideo] = useState<VideoItem | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);
  const [commentVideoId, setCommentVideoId] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [shareVideo, setShareVideo] = useState<VideoItem | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const handleAuthSuccess = (creator: Creator) => {
    setCurrentUser(creator);
    showToast(
      lang === 'hi' ? `आईडी सक्रिय हुई: ${creator.handle}` : `Active ID: ${creator.handle}`
    );
  };

  // Toggle Language
  const toggleLanguage = () => {
    setLang((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  // Filter videos for Following tab
  const displayedVideos =
    feedMode === 'following'
      ? videos.filter((v) => v.author.isFollowing || v.author.id === currentUser.id)
      : videos;

  // Like / Unlike Video
  const handleLikeVideo = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const nextLiked = !v.isLiked;
          if (nextLiked) audioEngine.playLikeSound();
          return {
            ...v,
            isLiked: nextLiked,
            likesCount: nextLiked ? v.likesCount + 1 : v.likesCount - 1,
          };
        }
        return v;
      })
    );
  };

  // Bookmark / Save Video
  const handleToggleBookmark = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const nextBookmarked = !v.isBookmarked;
          showToast(
            nextBookmarked
              ? lang === 'hi'
                ? 'वीडियो संग्रह में सहेजा गया'
                : 'Video saved to collection'
              : lang === 'hi'
              ? 'संग्रह से हटाया गया'
              : 'Removed from collection'
          );
          return {
            ...v,
            isBookmarked: nextBookmarked,
            bookmarksCount: nextBookmarked ? v.bookmarksCount + 1 : v.bookmarksCount - 1,
          };
        }
        return v;
      })
    );
  };

  // Follow / Unfollow Creator
  const handleFollowAuthor = (authorId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.author.id === authorId) {
          const nextFollowing = !v.author.isFollowing;
          showToast(
            nextFollowing
              ? lang === 'hi'
                ? `${v.author.name} को फॉलो किया गया!`
                : `Following ${v.author.name}!`
              : lang === 'hi'
              ? 'अनफॉलो किया गया'
              : 'Unfollowed'
          );
          return {
            ...v,
            author: {
              ...v.author,
              isFollowing: nextFollowing,
              followers: nextFollowing ? v.author.followers + 1 : v.author.followers - 1,
            },
          };
        }
        return v;
      })
    );

    if (viewingCreator && viewingCreator.id === authorId) {
      setViewingCreator((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: !prev.isFollowing,
              followers: !prev.isFollowing ? prev.followers + 1 : prev.followers - 1,
            }
          : null
      );
    }
  };

  // Open Duet Mode with video
  const handleOpenDuet = (video: VideoItem) => {
    setDuetTargetVideo(video);
    setIsCreateOpen(true);
    showToast(`${video.author.handle} के साथ ड्युएट मोड शुरू हुआ!`);
  };

  // Open Comments
  const handleOpenComments = (videoId: string) => {
    setCommentVideoId(videoId);
    setIsCommentsOpen(true);
  };

  // Add Comment
  const handleAddComment = (videoId: string, text: string) => {
    const newComment: CommentItem = {
      id: `comment_${Date.now()}`,
      videoId,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
        verified: currentUser.verified,
      },
      text,
      timestamp: 'अभी-अभी',
      likes: 0,
      isLiked: false,
    };

    setCommentsMap((prev) => ({
      ...prev,
      [videoId]: [newComment, ...(prev[videoId] || [])],
    }));

    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, commentsCount: v.commentsCount + 1 } : v))
    );
  };

  // Like a comment
  const handleLikeComment = (commentId: string) => {
    if (!commentVideoId) return;
    setCommentsMap((prev) => {
      const list = prev[commentVideoId] || [];
      const updated = list.map((c) =>
        c.id === commentId
          ? {
              ...c,
              isLiked: !c.isLiked,
              likes: !c.isLiked ? c.likes + 1 : c.likes - 1,
            }
          : c
      );
      return { ...prev, [commentVideoId]: updated };
    });
  };

  // Open Share Modal
  const handleOpenShare = (video: VideoItem) => {
    setShareVideo(video);
    setIsShareOpen(true);
  };

  // Post New Video (From Studio)
  const handlePostVideo = (newVideo: VideoItem) => {
    setVideos((prev) => [newVideo, ...prev]);
    setCurrentTab('home');
    setFeedMode('foryou');
    setCurrentIndex(0);
    setDuetTargetVideo(null);
    showToast(t[lang].videoPostedSuccess);
  };

  // View Creator Profile
  const handleViewProfile = (author: Creator) => {
    if (author.id === currentUser.id) {
      setViewingCreator(null);
    } else {
      setViewingCreator(author);
    }
    setCurrentTab('profile');
  };

  // Select video from Explore or Profile to watch in Feed
  const handleSelectVideo = (videoId: string) => {
    const idx = videos.findIndex((v) => v.id === videoId);
    if (idx !== -1) {
      setCurrentIndex(idx);
      setCurrentTab('home');
      setFeedMode('foryou');
    }
  };

  // Select Tag
  const handleSelectTag = (tag: string) => {
    setCurrentTab('explore');
  };

  // Update Profile Bio
  const handleUpdateBio = (name: string, bio: string) => {
    setCurrentUser((prev) => ({ ...prev, name, bio }));
    showToast(lang === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हुई!' : 'Profile updated successfully!');
  };

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast(lang === 'hi' ? 'सभी सूचनाएं पढ़ी गईं' : 'All notifications marked as read');
  };

  // Extract unique suggested creators
  const suggestedCreators: Creator[] = Array.from(
    new Map(videos.map((v) => [v.author.id, v.author])).values()
  ).filter((c) => c.id !== currentUser.id);

  const currentActiveVideo = displayedVideos[currentIndex] || displayedVideos[0] || videos[0];
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-[#fe2c55] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        feedMode={feedMode}
        onChangeTab={(tab) => {
          if (tab === 'profile') setViewingCreator(null);
          setCurrentTab(tab);
        }}
        onChangeFeedMode={(mode) => {
          setFeedMode(mode);
          setCurrentIndex(0);
        }}
        onOpenCreate={() => {
          setDuetTargetVideo(null);
          setIsCreateOpen(true);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        lang={lang}
        onToggleLang={toggleLanguage}
        currentUser={currentUser}
        unreadCount={unreadNotifs}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto overflow-hidden">
        {/* Left Desktop Sidebar */}
        <DesktopSidebar
          currentTab={currentTab}
          feedMode={feedMode}
          onChangeTab={(tab) => {
            if (tab === 'profile') setViewingCreator(null);
            setCurrentTab(tab);
          }}
          onChangeFeedMode={(mode) => {
            setFeedMode(mode);
            setCurrentIndex(0);
          }}
          onOpenCreate={() => {
            setDuetTargetVideo(null);
            setIsCreateOpen(true);
          }}
          suggestedCreators={suggestedCreators}
          onFollowCreator={handleFollowAuthor}
          lang={lang}
        />

        {/* Center Dynamic View */}
        <main className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative">
          {currentTab === 'home' && (
            <FeedView
              videos={displayedVideos}
              currentIndex={currentIndex}
              onChangeIndex={setCurrentIndex}
              feedMode={feedMode}
              onChangeFeedMode={(m) => {
                setFeedMode(m);
                setCurrentIndex(0);
              }}
              onOpenSearch={() => setCurrentTab('explore')}
              onOpenDuet={handleOpenDuet}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted((m) => !m)}
              onLikeVideo={handleLikeVideo}
              onToggleBookmark={handleToggleBookmark}
              onOpenComments={handleOpenComments}
              onOpenShare={handleOpenShare}
              onFollowAuthor={handleFollowAuthor}
              onSelectTag={handleSelectTag}
              onViewProfile={handleViewProfile}
              lang={lang}
            />
          )}

          {currentTab === 'explore' && (
            <ExploreView
              videos={videos}
              onSelectVideo={handleSelectVideo}
              lang={lang}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              creator={viewingCreator || currentUser}
              isCurrentUser={!viewingCreator}
              videos={videos.filter(
                (v) => v.author.id === (viewingCreator ? viewingCreator.id : currentUser.id)
              )}
              likedVideos={videos.filter((v) => v.isLiked)}
              savedVideos={videos.filter((v) => v.isBookmarked)}
              onSelectVideo={handleSelectVideo}
              onFollowCreator={handleFollowAuthor}
              onUpdateBio={handleUpdateBio}
              onOpenAuth={() => setIsAuthOpen(true)}
              lang={lang}
            />
          )}

          {currentTab === 'inbox' && (
            <ActivityView
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onViewProfile={handleViewProfile}
              lang={lang}
            />
          )}
        </main>

        {/* Right Desktop Info Panel */}
        {currentTab === 'home' && currentActiveVideo && (
          <DesktopRightPanel
            currentVideo={currentActiveVideo}
            onOpenCreateWithSound={() => {
              setDuetTargetVideo(null);
              setIsCreateOpen(true);
            }}
            lang={lang}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (Screenshot 1: Home, Discover, Center [+], Inbox, Me) */}
      <MobileBottomNav
        currentTab={currentTab}
        onChangeTab={(tab) => {
          if (tab === 'profile') setViewingCreator(null);
          setCurrentTab(tab);
        }}
        onOpenCreate={() => {
          setDuetTargetVideo(null);
          setIsCreateOpen(true);
        }}
        lang={lang}
        unreadCount={unreadNotifs}
      />

      {/* Comments Drawer / Bottom Sheet */}
      {commentVideoId && (
        <CommentsDrawer
          isOpen={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
          videoId={commentVideoId}
          comments={commentsMap[commentVideoId] || []}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
          lang={lang}
        />
      )}

      {/* Share Modal */}
      {shareVideo && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          video={shareVideo}
          onCopySuccess={() => showToast(t[lang].linkCopied)}
          lang={lang}
        />
      )}

      {/* Video Creation Camera Studio Modal */}
      <CreateModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setDuetTargetVideo(null);
        }}
        onPostVideo={handlePostVideo}
        currentUser={currentUser}
        lang={lang}
        initialDuetVideo={duetTargetVideo}
      />

      {/* User Sign Up & Login ID Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        lang={lang}
      />

      {/* Floating Feedback Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
