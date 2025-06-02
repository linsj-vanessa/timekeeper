import React from 'react';
import { PomodoroPhase } from '../types';
import { PHASE_DESCRIPTIONS_KEYS, PHASE_BG_COLORS, PHASE_HEX_COLORS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface PomodoroInfoProps {
  phase: PomodoroPhase;
  cyclesInSet: number; 
  totalCyclesPerLongBreak: number; 
  totalSessionPomodoros: number; 
}

const PomodoroInfo: React.FC<PomodoroInfoProps> = ({ phase, cyclesInSet, totalCyclesPerLongBreak, totalSessionPomodoros }) => {
  const { t } = useLanguage();

  if (phase === PomodoroPhase.IDLE) {
    return null;
  }

  const phaseDescriptionKey = PHASE_DESCRIPTIONS_KEYS[phase] || "pomodoroPhaseFocus"; // Default to focus if somehow unknown
  const phaseDescription = t(phaseDescriptionKey);
  const phaseColorClass = PHASE_BG_COLORS[phase] || "bg-slate-200";
  const phaseTextColor = (phase === PomodoroPhase.FOCUS || phase === PomodoroPhase.SHORT_BREAK || phase === PomodoroPhase.LONG_BREAK) ? "text-white" : "text-slate-700 dark:text-slate-200";
  const activeDotColor = PHASE_HEX_COLORS[phase] || PHASE_HEX_COLORS.FOCUS;


  return (
    <div className="my-4 p-3 bg-slate-50 dark:bg-slate-700/60 rounded-xl shadow text-sm w-full max-w-sm mx-auto">
      <div className={`px-3 py-1.5 rounded-md text-center font-semibold ${phaseColorClass} ${phaseTextColor} mb-2`}>
        {phaseDescription}
      </div>
      <div className="text-slate-600 dark:text-slate-300 space-y-1 text-center">
        {(phase === PomodoroPhase.FOCUS || phase === PomodoroPhase.SHORT_BREAK || phase === PomodoroPhase.LONG_BREAK) && (
          <p>
            {cyclesInSet > 0 
              ? t('pomodoroInfoCurrentSet', { cyclesInSet, totalCyclesPerLongBreak })
              : t('pomodoroInfoStartingSet')}
          </p>
        )}
        <p>{t('pomodoroInfoSessionTotal', { totalSessionPomodoros })}</p>
      </div>
       <div className="flex justify-center mt-3 space-x-1.5" aria-label={t('pomodoroInfoCurrentSet', { cyclesInSet, totalCyclesPerLongBreak })}>
        {Array.from({ length: totalCyclesPerLongBreak }).map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`w-3 h-3 rounded-full transition-colors ${
              i < cyclesInSet ? '' : 'bg-slate-300 dark:bg-slate-600'
            }`}
            style={{ backgroundColor: i < cyclesInSet ? activeDotColor : undefined }}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default PomodoroInfo;