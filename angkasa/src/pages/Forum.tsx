import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import DashboardHeader from '../components/DashboardHeader';
import ForumSidebar from '../components/forum/ForumSidebar';
import ForumRightSidebar from '../components/forum/ForumRightSidebar';
import ForumFeed from '../components/forum/ForumFeed';
import CommunityView from '../components/forum/CommunityView';
import GroupView from '../components/forum/GroupView';
import ChatView from '../components/forum/ChatView';
import EventView from '../components/forum/EventView';
import { Play, Pause } from 'lucide-react';


export default function ForumPage() {
  const { user, isAudioPlaying, togglePlay } = useAuth();
  const [activeView, setActiveView] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerSearchOpen, setTriggerSearchOpen] = useState(false);

  if (!user) return null;

  const handlePopularSearchClick = (query: string) => {
    setSearchQuery(query);
    setActiveView('feed');
    setTriggerSearchOpen(true);
    // Reset trigger after a short delay
    setTimeout(() => setTriggerSearchOpen(false), 100);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'feed':
        return <ForumFeed searchQuery={searchQuery} setSearchQuery={setSearchQuery} openSearchDropdown={triggerSearchOpen} />;
      case 'community':
        return <CommunityView />;
      case 'group':
        return <GroupView />;
      case 'chat':
        return <ChatView />;
      case 'event':
        return <EventView />;
      default:
        return <ForumFeed searchQuery={searchQuery} setSearchQuery={setSearchQuery} openSearchDropdown={triggerSearchOpen} />;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20">
      <DashboardHeader />

      {/* 🔊 Tombol Kontrol Musik — Pojok Kiri Bawah */}
      <div className="fixed bottom-25 lg:bottom-6 left-4 lg:left-6 z-20">
        <button
          onClick={togglePlay}
          className="group flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 bg-slate-800/70 hover:bg-slate-700/80 backdrop-blur-md border border-slate-600/40 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-slate-300 hover:text-white"
          title={isAudioPlaying ? 'Jeda musik latar' : 'Putar musik latar'}
          aria-label="Kontrol musik latar"
        >
          {isAudioPlaying ? (
            <Pause className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:scale-110" />
          ) : (
            <Play className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:scale-110 ml-0.5" />
          )}
        
        </button>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Sidebar */}
          <ForumSidebar activeView={activeView} setActiveView={setActiveView} />

          {/* Right Sidebar - appears second on mobile, third on desktop */}
          <div className="order-2 lg:order-3">
            <ForumRightSidebar
              onSearch={handlePopularSearchClick}
              onSearchClick={() => setTriggerSearchOpen(true)}
            />
          </div>

          {/* Main Content - appears third on mobile, second on desktop */}
          <div className="flex-1 min-w-0 order-3 lg:order-2">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}