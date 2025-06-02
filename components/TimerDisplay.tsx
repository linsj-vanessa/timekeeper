import React from 'react';
import { TIMER_TICK_COUNT, PHASE_DESCRIPTIONS_KEYS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import type { PomodoroPhase } from '../types';


interface CircularTimerDisplayProps {
  elapsedSeconds: number;
  totalSecondsInPhase: number; 
  currentTaskDescription?: string; 
  phaseForContextText?: PomodoroPhase; // Use phase to get translatable context text
  progressColor?: string; 
}

const CircularTimerDisplay: React.FC<CircularTimerDisplayProps> = ({
  elapsedSeconds,
  totalSecondsInPhase,
  currentTaskDescription, // This might be a direct string or a key if it's dynamic for phases
  phaseForContextText,
  progressColor = "#EF4444", 
}) => {
  const { t, formatTime } = useLanguage();
  const remainingSeconds = totalSecondsInPhase > 0 ? Math.max(0, totalSecondsInPhase - elapsedSeconds) : 0;
  const progressPercentage = totalSecondsInPhase > 0 ? (elapsedSeconds / totalSecondsInPhase) : 0;
  const activeTicks = Math.floor(progressPercentage * TIMER_TICK_COUNT);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progressPercentage, 1));

  const actualCurrentTaskDescription = currentTaskDescription || t('currentTask');
  const contextText = phaseForContextText ? t(PHASE_DESCRIPTIONS_KEYS[phaseForContextText]) : undefined;

  return (
    <div className="flex flex-col items-center my-6 text-center">
      <div className="mb-3 min-h-[3rem]">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {actualCurrentTaskDescription}
        </p>
        {contextText && <p className="text-xs text-slate-500 dark:text-slate-400">{contextText}</p>}
      </div>

      <div className="relative w-52 h-52 sm:w-60 sm:h-60">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          {Array.from({ length: TIMER_TICK_COUNT }).map((_, i) => {
            const angle = (i / TIMER_TICK_COUNT) * 360;
            const isActive = i < activeTicks;
            return (
              <line
                key={i}
                x1="100"
                y1="20"
                x2="100"
                y2="30"
                stroke={isActive ? progressColor : '#e4e4e7'} 
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${angle}, 100, 100)`}
              />
            );
          })}
          
           <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#f4f4f5" 
            className="dark:stroke-slate-700"
            strokeWidth="8"
          />
          {totalSecondsInPhase > 0 && (
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={progressColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
            />
          )}

          <text
            x="100"
            y="95"
            textAnchor="middle"
            className="fill-slate-500 dark:fill-slate-400 text-xs font-medium uppercase tracking-wider"
          >
            {t('elapsed')}
          </text>
          <text
            x="100"
            y="125"
            textAnchor="middle"
            className="fill-slate-800 dark:fill-slate-200 text-4xl font-bold font-mono"
            aria-live="polite"
          >
            {formatTime(elapsedSeconds)}
          </text>
        </svg>
      </div>
      
      <div className="mt-4">
        <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('remainingInPhase')}</p>
        <p className="text-2xl font-semibold text-slate-700 dark:text-slate-300 font-mono">
          {formatTime(remainingSeconds)}
        </p>
      </div>
    </div>
  );
};

export default CircularTimerDisplay;
// formatTimeUtility is removed as formatTime is now part of LanguageContext
