
import React from 'react';
import type { ActiveTimerInfo, View } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import HeaderTimekeeperIcon from './icons/HeaderTimekeeperIcon';
import ActiveTimerDisplay from './ActiveTimerDisplay'; // Import reusable component
import { NAV_ITEMS } from '../constants'; // Import NAV_ITEMS from constants

interface SidebarNavProps {
  currentView: View;
  onNavigate: (view: View) => void;
  activeTimerInfo: ActiveTimerInfo | null;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ currentView, onNavigate, activeTimerInfo }) => {
  const { t } = useLanguage();

  const NavLink: React.FC<{
    view: View;
    label: string;
    Icon: React.FC<{ className?: string }>;
    isActive: boolean;
  }> = ({ view, label, Icon, isActive }) => (
    <button
      onClick={() => onNavigate(view)}
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
    <aside className="hidden md:flex w-64 bg-slate-800 text-white flex-col h-full fixed top-0 left-0 z-40 shadow-lg">
      <div className="flex items-center justify-center h-16 border-b border-slate-700 px-4"> {/* Adjusted height to h-16 */}
        <HeaderTimekeeperIcon className="w-8 h-8 text-blue-400 mr-2" />
        <span className="text-xl font-semibold">{t('sidebarNavAppName')}</span>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.view}
            view={item.view}
            label={t(item.labelKey)}
            Icon={item.icon}
            isActive={currentView === item.view}
          />
        ))}
      </nav>
      <div className="mt-auto"> {/* Wrapper div for ActiveTimerDisplay */}
        <ActiveTimerDisplay 
            activeTimerInfo={activeTimerInfo}
            onNavigateToTracking={() => onNavigate('tracking')}
        />
      </div>
    </aside>
  );
};

export default SidebarNav;
