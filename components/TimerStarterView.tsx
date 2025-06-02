import React, { useState } from 'react';
import type { Project, TimerMode } from '../types';
import { TimerMode as TMode } from '../types';
import TaskInput from './TaskInput';
import PlayIcon from './icons/PlayIcon';
import ClockIcon from './icons/ClockIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface TimerStarterViewProps {
  projects: Project[];
  onStartManual: (description: string, projectId?: string) => void;
  onStartPomodoro: (description: string, projectId?: string) => void;
}

const TimerStarterView: React.FC<TimerStarterViewProps> = ({
  projects,
  onStartManual,
  onStartPomodoro,
}) => {
  const { t } = useLanguage();
  const [selectedMode, setSelectedMode] = useState<TimerMode>(TMode.MANUAL);
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);

  const handleStart = () => {
    if (selectedMode === TMode.MANUAL) {
      onStartManual(taskDescription, selectedProjectId);
    } else {
      onStartPomodoro(taskDescription, selectedProjectId);
    }
  };

  const commonInputStyle = "w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700";
  const buttonBaseClass = "w-full flex items-center justify-center font-semibold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all text-base space-x-2 disabled:opacity-60 disabled:cursor-not-allowed";
  
  const isStartDisabled = taskDescription.trim() === '';
  const taskInputPlaceholderKey = selectedMode === TMode.POMODORO ? "pomodoroGoalPlaceholder" : "whatAreYouWorkingOn";
  const startButtonTextKey = selectedMode === TMode.MANUAL ? "startManualTimer" : "startPomodoro";

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">{t('startNewTimer')}</h2>

      <div className="mb-6 flex space-x-2 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
        <button
          onClick={() => setSelectedMode(TMode.MANUAL)}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors w-1/2
            ${selectedMode === TMode.MANUAL ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600/70'}`}
          aria-pressed={selectedMode === TMode.MANUAL}
        >
          {t('timerStarterManual')}
        </button>
        <button
          onClick={() => setSelectedMode(TMode.POMODORO)}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors w-1/2
            ${selectedMode === TMode.POMODORO ? 'bg-white dark:bg-slate-600 text-red-600 dark:text-red-400 shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600/70'}`}
          aria-pressed={selectedMode === TMode.POMODORO}
        >
          {t('timerStarterPomodoro')}
        </button>
      </div>

      <div className="w-full max-w-md space-y-4 mb-8">
        <TaskInput
          id="starterTaskDescription"
          value={taskDescription}
          onChange={setTaskDescription}
          placeholderKey={taskInputPlaceholderKey}
          leadingIcon={<ClockIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
        />
        <select
          id="starterProjectSelect"
          value={selectedProjectId || ''}
          onChange={(e) => setSelectedProjectId(e.target.value || undefined)}
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

      <button
        onClick={handleStart}
        disabled={isStartDisabled}
        className={`${buttonBaseClass} ${selectedMode === TMode.MANUAL ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white focus:ring-2 focus:ring-offset-2 ${selectedMode === TMode.MANUAL ? 'focus:ring-blue-500' : 'focus:ring-red-500'}`}
        aria-label={t(startButtonTextKey)}
      >
        <PlayIcon className="w-5 h-5" />
        <span>{t(startButtonTextKey)}</span>
      </button>
    </div>
  );
};

export default TimerStarterView;