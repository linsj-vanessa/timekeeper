import React, { useEffect, useRef } from 'react';
import DailyOverviewTimeIcon from './icons/DailyOverviewTimeIcon';
import FocusIcon from './icons/FocusIcon';
import type { Project } from '../types';
import Controls from './Controls'; 
import { TimerMode } from '../types'; 
import { useLanguage } from '../contexts/LanguageContext';

interface ManualTimerData {
  elapsedSeconds: number;
  description: string;
  projectId?: string;
  isRunning: boolean;
  startedAt: number; 
}

interface TimerActiveViewProps {
  projects: Project[];
  timerData: ManualTimerData;
  onDescriptionChange: (description: string) => void;
  onProjectIdChange: (projectId?: string) => void;
  onTogglePauseResume: () => void;
  onStopTracking: () => void;
  onEnterFocusMode: () => void;
}

const TimerActiveView: React.FC<TimerActiveViewProps> = ({
  projects,
  timerData,
  onDescriptionChange,
  onProjectIdChange,
  onTogglePauseResume,
  onStopTracking,
  onEnterFocusMode,
}) => {
  const { t, formatTime: localizedFormatTime } = useLanguage();
  const taskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (timerData.isRunning && timerData.elapsedSeconds < 2 && !timerData.description && taskInputRef.current) {
      taskInputRef.current.focus();
    }
  }, [timerData.isRunning, timerData.elapsedSeconds, timerData.description]);


  const commonInputStyle = "w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700";
  
  const canStopTimer = timerData.elapsedSeconds > 0 || timerData.description.trim() !== '' || timerData.projectId !== undefined;

  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-4">
      <DailyOverviewTimeIcon className="w-16 h-16 text-blue-600 dark:text-blue-400 mb-3" />
      
      <p className="text-6xl font-bold text-slate-800 dark:text-slate-100 font-mono mb-1 tabular-nums" aria-live="polite">
        {localizedFormatTime(timerData.elapsedSeconds)}
      </p>
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-8">{t('timerActiveManualSubtitle')}</p>

      <div className="w-full max-w-md space-y-4 mb-8">
        <div>
          <label htmlFor="taskDescriptionInput" className="sr-only">{t('whatAreYouWorkingOn')}</label>
          <input
            id="taskDescriptionInput"
            ref={taskInputRef}
            type="text"
            placeholder={t('whatAreYouWorkingOn')}
            value={timerData.description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className={commonInputStyle}
            aria-label={t('whatAreYouWorkingOn')}
          />
        </div>
        
        <div>
          <label htmlFor="projectSelect" className="sr-only">{t('assignToProject')}</label>
          <select
            id="projectSelect"
            value={timerData.projectId || ''}
            onChange={(e) => onProjectIdChange(e.target.value || undefined)}
            className={`${commonInputStyle} cursor-pointer`}
            aria-label={t('assignToProject')}
          >
            <option value="">{t('noProjectOptional')}</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Controls
        timerMode={TimerMode.MANUAL}
        isManualTimerRunning={timerData.isRunning}
        onPauseManual={onTogglePauseResume} 
        onResumeManual={onTogglePauseResume} 
        onStopManual={onStopTracking}
        isTaskDescriptionEmpty={timerData.description.trim() === ''} 
        canStopManualTimer={canStopTimer}
      />
       <div className="w-full max-w-md flex items-center justify-end pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onEnterFocusMode}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
            aria-label={t('enterFocusMode')}
            title={t('enterFocusMode')}
          >
            <FocusIcon className="w-5 h-5" />
          </button>
        </div>
    </div>
  );
};

export default TimerActiveView;