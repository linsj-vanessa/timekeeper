import React from 'react';
import type { Project, PomodoroSettings, PomodoroPhase as PPhaseType } from '../types';
import { TimerMode, PomodoroPhase } from '../types'; 
import CircularTimerDisplay from './TimerDisplay';
import TaskInput from './TaskInput';
import PomodoroInfo from './PomodoroInfo';
import Controls from './Controls';
import SettingsIcon from './icons/SettingsIcon';
import FocusIcon from './icons/FocusIcon';
import { PHASE_DESCRIPTIONS_KEYS, PHASE_HEX_COLORS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface PomodoroHostViewProps {
  projects: Project[];
  pomodoroSettings: PomodoroSettings;
  currentPhase: PPhaseType;
  elapsedSecondsInPhase: number;
  isTimerRunning: boolean;
  cyclesInCurrentSet: number;
  totalSessionPomodoros: number;
  taskDescription: string;
  onTaskDescriptionChange: (description: string) => void;
  projectId?: string;
  onProjectIdChange: (projectId?: string) => void;
  
  onStartFocus: (description: string, projectId?: string) => void; 
  onPause: () => void;
  onResume: () => void;
  onStopSession: () => void;
  onSkipBreak: () => void;
  onOpenSettings: () => void; // This will now likely open the main settings modal or navigate
  onEnterFocusMode: () => void;
}

const PomodoroHostView: React.FC<PomodoroHostViewProps> = ({
  projects,
  pomodoroSettings,
  currentPhase,
  elapsedSecondsInPhase,
  isTimerRunning,
  cyclesInCurrentSet,
  totalSessionPomodoros,
  taskDescription,
  onTaskDescriptionChange,
  projectId,
  onProjectIdChange,
  onStartFocus,
  onPause,
  onResume,
  onStopSession,
  onSkipBreak,
  onOpenSettings,
  onEnterFocusMode,
}) => {
  const { t } = useLanguage();

  const totalSecondsCurrentPhase = 
    currentPhase === PomodoroPhase.FOCUS ? pomodoroSettings.focusDurationMinutes * 60 :
    currentPhase === PomodoroPhase.SHORT_BREAK ? pomodoroSettings.shortBreakDurationMinutes * 60 :
    currentPhase === PomodoroPhase.LONG_BREAK ? pomodoroSettings.longBreakDurationMinutes * 60 : 0;

  // Use translated phase description for display, or current task description if focus
  const displayTaskDescOrPhase = currentPhase === PomodoroPhase.FOCUS ? taskDescription : t(PHASE_DESCRIPTIONS_KEYS[currentPhase]);
  const isInputDisabled = currentPhase !== PomodoroPhase.FOCUS; // Simpler: only allow edit in focus, regardless of running state. Can be refined.

  const commonInputStyle = "w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed";

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center relative"> {/* Added relative for positioning icons */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
            onClick={onEnterFocusMode}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
            aria-label={t('enterFocusMode')}
            title={t('enterFocusMode')}
          >
          <FocusIcon className="w-5 h-5" />
        </button>
        <button 
          onClick={onOpenSettings} 
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
          aria-label={t('pomodoroSettingsTitle')}
          title={t('pomodoroSettingsTitle')}
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      <CircularTimerDisplay
        elapsedSeconds={elapsedSecondsInPhase}
        totalSecondsInPhase={totalSecondsCurrentPhase}
        currentTaskDescription={displayTaskDescOrPhase}
        phaseForContextText={currentPhase} // Pass phase to get correct context text
        progressColor={PHASE_HEX_COLORS[currentPhase]}
      />

      {currentPhase === PomodoroPhase.FOCUS && (
        <div className="w-full max-w-md space-y-3 my-6">
          <TaskInput
            id="pomodoroTaskDescription"
            value={taskDescription}
            onChange={onTaskDescriptionChange}
            placeholderKey="pomodoroHostTaskDescription"
            disabled={isInputDisabled} 
          />
          <select
            id="pomodoroProjectSelect"
            value={projectId || ''}
            onChange={(e) => onProjectIdChange(e.target.value || undefined)}
            className={`${commonInputStyle} cursor-pointer`}
            aria-label={t('assignToProject')}
            disabled={isInputDisabled}
          >
            <option value="">{t('noProjectOptional')}</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <PomodoroInfo 
        phase={currentPhase}
        cyclesInSet={cyclesInCurrentSet}
        totalCyclesPerLongBreak={pomodoroSettings.cyclesPerLongBreak}
        totalSessionPomodoros={totalSessionPomodoros}
      />

      <Controls
        timerMode={TimerMode.POMODORO}
        pomodoroPhase={currentPhase}
        isPomodoroTimerRunning={isTimerRunning}
        onStartPomodoroFocus={() => onStartFocus(taskDescription, projectId)} 
        onPausePomodoro={onPause}
        onResumePomodoro={onResume}
        onStopPomodoroSession={onStopSession}
        onSkipPomodoroBreak={onSkipBreak}
        isTaskDescriptionEmpty={currentPhase === PomodoroPhase.FOCUS && taskDescription.trim() === ''}
      />
    </div>
  );
};

export default PomodoroHostView;