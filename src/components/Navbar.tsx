import React, { useState } from 'react';
import { Bell, Menu, X } from 'lucide-react';
import { AppSettings, PageId, UserProfile } from '../types';
import { AvatarDisplay } from './AvatarDisplay';
import { AppLogo } from './AppLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentPage: PageId;
  user: UserProfile;
  appSettings: AppSettings;
  unreadNotificationsCount: number;
  unreadDiscussionsCount: number;
  onNavigate: (page: PageId) => void;
  onOpenNotifications: () => void;
}

const NAV_ITEMS: { id: PageId; label: string }[] = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'alumni', label: 'Anciens' },
  { id: 'info', label: 'Informations' },
  { id: 'cotisations', label: 'Cotisations' },
  { id: 'discussions', label: 'Discussions' },
  { id: 'settings', label: 'Paramètres' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  user,
  appSettings,
  unreadNotificationsCount,
  unreadDiscussionsCount,
  onNavigate,
  onOpenNotifications,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectPage = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0f1117]/95 backdrop-blur-md border-b border-accent/16 z-40">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Zone 1: Brand + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              className="lg:hidden w-10 h-10 rounded-xl bg-[#1a1d2e] border border-accent/16 flex items-center justify-center text-[#e8e0d0] hover:text-accent transition-colors cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button
              type="button"
              onClick={() => handleSelectPage('dashboard')}
              className="flex items-center gap-2 font-extrabold text-lg tracking-tight cursor-pointer whitespace-nowrap min-w-0"
            >
              <AppLogo
                logo={appSettings.logo}
                appName={appSettings.appName}
                sizeClass="w-8 h-8"
                emojiClass="text-xl"
              />
              <span className="bg-gradient-to-r from-accent to-accent-highlight bg-clip-text text-transparent truncate max-w-[160px] sm:max-w-[220px]">
                {appSettings.appName}
              </span>
            </button>
          </div>

          {/* Zone 2: Primary Nav Links */}
          <nav className="hidden lg:flex items-center gap-5" aria-label="Navigation principale">
            {NAV_ITEMS.map(item => {
              const isActive = currentPage === item.id;
              const showBadge = item.id === 'discussions' && unreadDiscussionsCount > 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPage(item.id)}
                  className={`relative py-2 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-accent'
                      : 'text-[#a09888] hover:text-[#e8e0d0]'
                  }`}
                >
                  <span>{item.label}</span>
                  {showBadge && (
                    <span className="px-1.5 py-0.2 bg-red-500 rounded-full text-[10px] font-bold text-white tabular-nums">
                      {unreadDiscussionsCount > 9 ? '9+' : unreadDiscussionsCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: User Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden sm:block">
              <PWAInstallButton />
            </div>
            <button
              type="button"
              onClick={onOpenNotifications}
              aria-label={
                unreadNotificationsCount > 0
                  ? `Notifications (${unreadNotificationsCount} non lue${unreadNotificationsCount > 1 ? 's' : ''})`
                  : 'Notifications'
              }
              className="w-10 h-10 rounded-full bg-[#1a1d2e] border border-accent/20 flex items-center justify-center text-[#e8e0d0] relative hover:border-accent transition-colors cursor-pointer"
            >
              <Bell size={18} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white tabular-nums">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSelectPage('profile')}
              aria-label="Mon profil"
              className={`w-10 h-10 rounded-full bg-gradient-to-br from-accent to-[#9b59b6] flex items-center justify-center text-lg cursor-pointer border-2 transition-transform hover:scale-105 overflow-hidden ${
                currentPage === 'profile' ? 'border-accent-highlight' : 'border-accent/40'
              }`}
            >
              <AvatarDisplay avatar={user.avatar} alt={user.name} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-16 left-0 right-0 bg-[#1a1d2e]/98 backdrop-blur-md border-b border-accent/22 p-3 z-30 shadow-2xl animate-fadeIn">
          <div className="flex flex-col gap-1 max-w-7xl mx-auto">
            {NAV_ITEMS.map(item => {
              const isActive = currentPage === item.id;
              const showBadge = item.id === 'discussions' && unreadDiscussionsCount > 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPage(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-accent text-accent-contrast'
                      : 'text-[#a09888] hover:text-white hover:bg-[#252840]'
                  }`}
                >
                  <span>{item.label}</span>
                  {showBadge && (
                    <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs font-bold text-white tabular-nums">
                      {unreadDiscussionsCount} non lu{unreadDiscussionsCount > 1 ? 's' : ''}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
