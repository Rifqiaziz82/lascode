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
import { Play } from 'lucide-react';
import Particles from '../components/Particles';

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
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
        <Particles
          particleCount={100}
          particleSpread={15}
          speed={0.15}
          particleColors={['#3b82f6', '#8b5cf6']}
          moveParticlesOnHover={true}
          particleHoverFactor={2}
          alphaParticles={true}
          particleBaseSize={100}
          sizeRandomness={1}
          cameraDistance={25}
          disableRotation={false}
        />
      </div>

      <DashboardHeader />

      {/* Music Control - Floating */}
      <div className="fixed bottom-26 sm:bottom-6 left-4 z-50">
        <button
          onClick={togglePlay}
          className="group flex items-center gap-0 sm:gap-3 p-0 sm:pr-5 sm:pl-3 sm:py-3 transition-all duration-300"
          title={isAudioPlaying ? 'Jeda musik' : 'Putar musik'}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-slate-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            {isAudioPlaying ? (
              <div className="flex gap-1 items-end h-4">
                <span className="w-1 bg-white h-2 animate-music-bar-1"></span>
                <span className="w-1 bg-white h-4 animate-music-bar-2"></span>
                <span className="w-1 bg-white h-3 animate-music-bar-3"></span>
              </div>
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
            )}
          </div>
        </button>
      </div>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] pt-28 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <ForumSidebar activeView={activeView} setActiveView={setActiveView} />

          {/* Main Content */}
          <div className="flex-1 min-w-0 order-2 lg:order-2">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              {renderContent()}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6 order-3 lg:order-3">
            <ForumRightSidebar
              onSearch={handlePopularSearchClick}
              onSearchClick={() => setTriggerSearchOpen(true)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
