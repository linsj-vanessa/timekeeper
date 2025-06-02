
import React from 'react';
import type { ActiveTimerInfo } from '../types';
import { PomodoroPhase, TimerMode } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import PlayIcon from './icons/PlayIcon';

interface ActiveTimerDisplayProps {
  activeTimerInfo: ActiveTimerInfo | null;
  onNavigateToTracking: () => void;
  isMobile?: boolean; // Optional prop to adjust styling for mobile if needed
}

const ActiveTimerDisplay: React.FC<ActiveTimerDisplayProps> = ({ activeTimerInfo, onNavigateToTracking, isMobile = false }) => {
  const { t, formatTime } = useLanguage();

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
    <div className={`p-3 ${isMobile ? 'w-full' : 'border-t border-slate-700'}`}>
      <p className={`text-xs font-semibold uppercase ${isMobile ? 'text-slate-400' : 'text-slate-400'} mb-1`}>
        {t('sidebarActiveTimer')}
      </p>
      <button
        onClick={onNavigateToTracking}
        className={`w-full flex items-center justify-center px-3 py-2.5 rounded-md text-white text-sm font-medium ${phaseColor} hover:opacity-90 transition-opacity`}
        aria-label={t('timerActive')}
      >
        <PlayIcon className="w-4 h-4 mr-2" />
        <span className="tabular-nums">{timerText}</span>
      </button>
    </div>
  );
};

export default ActiveTimerDisplay;