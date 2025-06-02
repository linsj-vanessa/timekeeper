
import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { TimerMode } from '../types'; // Ensure TimerMode is imported

interface FocusModeDisplayProps {
  mode: TimerMode;
  elapsedSeconds: number;
  totalSecondsInPhase?: number; // For Pomodoro mode, total seconds in the current phase
  onExitFocusMode: () => void;
}

const FocusModeDisplay: React.FC<FocusModeDisplayProps> = ({
  mode,
  elapsedSeconds,
  totalSecondsInPhase,
  onExitFocusMode
}) => {
  const { t, formatTime: localizedFormatTime } = useLanguage();
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        onExitFocusMode();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onExitFocusMode]);

  let timeToDisplay = elapsedSeconds;
  let timeContextKey = 'elapsed'; // Default to 'elapsed'

  if (mode === TimerMode.POMODORO && totalSecondsInPhase && totalSecondsInPhase > 0) {
    timeToDisplay = Math.max(0, totalSecondsInPhase - elapsedSeconds);
    timeContextKey = 'remainingInPhase'; // Use for Pomodoro remaining time
  }

  const ariaLabel = `${t('enterFocusMode')}. ${t(timeContextKey)}: ${localizedFormatTime(timeToDisplay)}. ${t('exitFocusMode')}`;

  return (
    <div
      className="flex-grow flex flex-col items-center justify-center w-full h-full bg-black text-white cursor-pointer"
      onClick={onExitFocusMode}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
    >
      <p 
        className="text-7xl sm:text-8xl md:text-9xl font-bold font-mono tabular-nums"
        aria-live="polite"
      >
        {localizedFormatTime(timeToDisplay)}
      </p>
      <p className="mt-2 text-sm text-slate-400 uppercase tracking-wider">
        {t(timeContextKey)}
      </p>
      <p className="mt-4 text-lg text-slate-300">{t('exitFocusMode')}</p>
    </div>
  );
};

export default FocusModeDisplay;
