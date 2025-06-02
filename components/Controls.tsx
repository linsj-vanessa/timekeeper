import React from 'react';
import { TimerMode, PomodoroPhase } from '../types';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import StopIcon from './icons/StopIcon';
import SkipIcon from './icons/SkipIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface ControlsProps {
  timerMode: TimerMode;
  isManualTimerRunning?: boolean;
  onStartManual?: () => void;
  onPauseManual?: () => void;
  onResumeManual?: () => void;
  onStopManual?: () => void;
  
  pomodoroPhase?: PomodoroPhase;
  isPomodoroTimerRunning?: boolean;
  onStartPomodoroFocus?: () => void;
  onPausePomodoro?: () => void;
  onResumePomodoro?: () => void;
  onStopPomodoroSession?: () => void;
  onSkipPomodoroBreak?: () => void;
  
  isTaskDescriptionEmpty: boolean; 
  canStopManualTimer?: boolean; 
}

const Controls: React.FC<ControlsProps> = ({
  timerMode,
  isManualTimerRunning,
  onStartManual,
  onPauseManual,
  onResumeManual,
  onStopManual,
  pomodoroPhase = PomodoroPhase.IDLE,
  isPomodoroTimerRunning,
  onStartPomodoroFocus,
  onPausePomodoro,
  onResumePomodoro,
  onStopPomodoroSession,
  onSkipPomodoroBreak,
  isTaskDescriptionEmpty,
  canStopManualTimer,
}) => {
  const { t } = useLanguage();
  const baseButtonClass = "w-full sm:w-auto flex-grow sm:flex-none px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl font-semibold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800";
  const primaryButtonClass = (color: string = 'blue') => `${baseButtonClass} bg-${color}-600 hover:bg-${color}-700 text-white focus:ring-${color}-500`;
  const secondaryButtonClass = `${baseButtonClass} bg-slate-200 hover:bg-slate-300 text-slate-700 dark:text-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 focus:ring-slate-400`;
  const tertiaryButtonClass = `${baseButtonClass} bg-transparent border-2 border-slate-300 dark:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 focus:ring-slate-400`;

  if (timerMode === TimerMode.MANUAL) {
    return (
      <div className="flex flex-col sm:flex-row justify-center items-stretch space-y-3 sm:space-y-0 sm:space-x-4 mt-8 w-full max-w-lg mx-auto">
        {!isManualTimerRunning && onStartManual && onResumeManual && (
          <button 
            onClick={onStartManual}
            className={primaryButtonClass('blue')}
            disabled={isTaskDescriptionEmpty} 
            aria-label={t('startManualTimer')}
          >
            <PlayIcon className="w-5 h-5" /> <span>{t('startManualTimer')}</span>
          </button>
        )}
         {isManualTimerRunning && onPauseManual && onStopManual && (
          <>
            <button onClick={onPauseManual} className={secondaryButtonClass} aria-label={t('pauseManualTimer')}>
              <PauseIcon className="w-5 h-5" /> <span>{t('pauseManualTimer')}</span>
            </button>
            <button 
              onClick={onStopManual} 
              className={primaryButtonClass('red')} 
              aria-label={t('stopManualTimer')}
              disabled={!canStopManualTimer}
            >
              <StopIcon className="w-5 h-5" /> <span>{t('stopManualTimer')}</span>
            </button>
          </>
        )}
        {!isManualTimerRunning && onResumeManual && onStopManual && typeof isManualTimerRunning === 'boolean' && ( 
           <>
            <button onClick={onResumeManual} className={primaryButtonClass('blue')} aria-label={t('resumeManualTimer')}>
                <PlayIcon className="w-5 h-5" /> <span>{t('resumeManualTimer')}</span>
            </button>
            <button 
                onClick={onStopManual} 
                className={primaryButtonClass('red')} 
                aria-label={t('stopManualTimer')}
                disabled={!canStopManualTimer}
            >
                <StopIcon className="w-5 h-5" /> <span>{t('stopManualTimer')}</span>
            </button>
           </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 mt-8 w-full max-w-lg mx-auto">
      {pomodoroPhase === PomodoroPhase.IDLE && !isPomodoroTimerRunning && onStartPomodoroFocus && (
        <button 
            onClick={onStartPomodoroFocus} 
            className={primaryButtonClass('red')}
            disabled={isTaskDescriptionEmpty} 
            aria-label={t('startPomodoroFocus')}
        >
          <PlayIcon className="w-5 h-5" /> <span>{t('startPomodoroFocus')}</span>
        </button>
      )}

      {isPomodoroTimerRunning && (pomodoroPhase === PomodoroPhase.FOCUS || pomodoroPhase === PomodoroPhase.SHORT_BREAK || pomodoroPhase === PomodoroPhase.LONG_BREAK) && onPausePomodoro && (
         <button onClick={onPausePomodoro} className={secondaryButtonClass} aria-label={t('pausePomodoro')}>
          <PauseIcon className="w-5 h-5" /> <span>{t('pausePomodoro')}</span>
        </button>
      )}
      
      {!isPomodoroTimerRunning && pomodoroPhase !== PomodoroPhase.IDLE && onResumePomodoro && (
         <button onClick={onResumePomodoro} className={primaryButtonClass(pomodoroPhase === PomodoroPhase.FOCUS ? 'red' : 'sky')} aria-label={t('resumePomodoro')}>
          <PlayIcon className="w-5 h-5"/> <span>{t('resumePomodoro')}</span>
        </button>
      )}

      {(pomodoroPhase === PomodoroPhase.SHORT_BREAK || pomodoroPhase === PomodoroPhase.LONG_BREAK) && isPomodoroTimerRunning && onSkipPomodoroBreak && (
         <button onClick={onSkipPomodoroBreak} className={tertiaryButtonClass} aria-label={t('skipCurrentBreak')}>
            <SkipIcon className="w-5 h-5" /> <span>{t('skipCurrentBreak')}</span>
        </button>
      )}

      {pomodoroPhase !== PomodoroPhase.IDLE && onStopPomodoroSession && (
        <button 
          onClick={onStopPomodoroSession} 
          className={ (pomodoroPhase === PomodoroPhase.FOCUS && isPomodoroTimerRunning) ? primaryButtonClass('red') : secondaryButtonClass} 
          aria-label={t('stopPomodoroSession')}
        >
          <StopIcon className="w-5 h-5"/> <span>{t('stopPomodoroSession')}</span>
        </button>
      )}
    </div>
  );
};

export default Controls;