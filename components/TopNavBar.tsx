
import React, { useState, useEffect, useRef } from 'react';
import type { ActiveTimerInfo, View } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import HeaderTimekeeperIcon from './icons/HeaderTimekeeperIcon';
import MenuIcon from './icons/MenuIcon';
import CloseIcon from './icons/CloseIcon';
import ActiveTimerDisplay from './ActiveTimerDisplay';
import { NAV_ITEMS, APP_NAME_KEY } from '../constants';

interface TopNavBarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  activeTimerInfo: ActiveTimerInfo | null;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ currentView, onNavigate, activeTimerInfo }) => {
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleNavAndCloseMenu = (view: View) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };
  
  const NavLink: React.FC<{
    view: View;
    label: string;
    Icon: React.FC<{ className?: string }>;
    isActive: boolean;
    onClick: () => void;
  }> = ({ view, label, Icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors group
        ${isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-slate-200 hover:bg-slate-700 hover:text-white'
        }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`} />
      <span>{label}</span>
    </button>
  );

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-800 text-white shadow-md z-50 flex items-center justify-between px-4">
        <button onClick={() => handleNavAndCloseMenu('dashboard')} className="flex items-center" aria-label={t(APP_NAME_KEY)}>
          <HeaderTimekeeperIcon className="w-7 h-7 text-blue-400 mr-2" />
          <span className="text-lg font-semibold">{t(APP_NAME_KEY)}</span>
        </button>
        <button
          ref={buttonRef}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          aria-controls="mobile-menu"
          aria-expanded={isMobileMenuOpen}
          aria-label={t(isMobileMenuOpen ? 'closeMenu' : 'openMenu')}
        >
          {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Panel */}
      <div
        ref={menuRef}
        id="mobile-menu"
        className={`md:hidden fixed inset-0 top-16 bg-slate-800 text-white p-4 z-40 transform transition-transform duration-300 ease-in-out flex flex-col
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <nav className="flex-grow space-y-2">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.view}
              view={item.view}
              label={t(item.labelKey)}
              Icon={item.icon}
              isActive={currentView === item.view}
              onClick={() => handleNavAndCloseMenu(item.view)}
            />
          ))}
        </nav>
        <div className="mt-auto"> {/* Position timer at the bottom */}
          <ActiveTimerDisplay
            activeTimerInfo={activeTimerInfo}
            onNavigateToTracking={() => handleNavAndCloseMenu('tracking')}
            isMobile={true}
          />
        </div>
      </div>
    </>
  );
};

export default TopNavBar;