
import React from 'react';
import type { ActiveTimerInfo, View } from '../types';
import { PomodoroPhase, TimerMode } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import HeaderTimekeeperIcon from './icons/HeaderTimekeeperIcon';
import DashboardIcon from './icons/DashboardIcon';
import ListChecksIcon from './icons/ListChecksIcon';
import BarChartIcon from './icons/BarChartIcon';
import SettingsIcon from './icons/SettingsIcon';
import PlayIcon from './icons/PlayIcon';

interface SidebarNavProps {
  currentView: View;
  onNavigate: (view: View) => void;
  activeTimerInfo: ActiveTimerInfo | null;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ currentView, onNavigate, activeTimerInfo }) => {
  const { t, formatTime } = useLanguage();

  const navItems: { view: View; labelKey: string; icon: React.FC<{ className?: string }> }[] = [
    { view: 'dashboard', labelKey: 'navDashboard', icon: DashboardIcon },
    { view: 'tracking', labelKey: 'navTracking', icon: ListChecksIcon },
    { view: 'reports', labelKey: 'navReports', icon: BarChartIcon },
    { view: 'settings', labelKey: 'navSettings', icon: SettingsIcon },
  ];

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
  
  const renderActiveTimerInfo = () => {
    if (!activeTimerInfo) return null;

    let timerText = `${t('sidebarManual')}: ${formatTime(activeTimerInfo.elapsedSeconds)}`;
    let phaseColor = "bg-orange-500";
    let phaseKey = "sidebarManual";

    if (activeTimerInfo.mode === TimerMode.POMODORO && activeTimerInfo.phase) {
        switch (activeTimerInfo.phase) {
            case PomodoroPhase.FOCUS:
                phaseKey = "sidebarFocus";
                phaseColor = "bg-red-500";
                break;
            case PomodoroPhase.SHORT_BREAK:
                phaseKey = "sidebarShortBreak";
                phaseColor = "bg-sky-500";
                break;
            case PomodoroPhase.LONG_BREAK:
                phaseKey = "sidebarLongBreak";
                phaseColor = "bg-indigo-500";
                break;
        }
        timerText = `${t(phaseKey)}: ${formatTime(activeTimerInfo.elapsedSeconds)}`;
    }

    return (
        <div className="mt-auto p-3 border-t border-slate-700">
            <p className="text-xs font-semibold uppercase text-slate-400 mb-1">{t('sidebarActiveTimer')}</p>
            <button
                onClick={() => onNavigate('tracking')}
                className={`w-full flex items-center justify-center px-3 py-2.5 rounded-md text-white text-sm font-medium ${phaseColor} hover:opacity-90 transition-opacity`}
            >
                <PlayIcon className="w-4 h-4 mr-2" />
                <span className="tabular-nums">{timerText}</span>
            </button>
        </div>
    );
  };


  return (
    <aside className="hidden md:flex w-64 bg-slate-800 text-white flex-col h-full fixed top-0 left-0 z-40 shadow-lg">
      <div className="flex items-center justify-center h-20 border-b border-slate-700 px-4">
        <HeaderTimekeeperIcon className="w-8 h-8 text-blue-400 mr-2" />
        <span className="text-xl font-semibold">{t('sidebarNavAppName')}</span>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.view}
            view={item.view}
            label={t(item.labelKey)}
            Icon={item.icon}
            isActive={currentView === item.view}
          />
        ))}
      </nav>
      {renderActiveTimerInfo()}
    </aside>
  );
};

export default SidebarNav;
