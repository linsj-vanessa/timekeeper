import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface TaskInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholderKey?: string; // Use key for translation
  leadingIcon?: React.ReactElement<{ className?: string }>;
  id?: string;
}

const TaskInput: React.FC<TaskInputProps> = ({ id, value, onChange, disabled = false, placeholderKey = "whatAreYouWorkingOn", leadingIcon }) => {
  const { t } = useLanguage();
  const placeholderText = t(placeholderKey);
  return (
    <div className="relative w-full">
      {leadingIcon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {React.cloneElement(leadingIcon, { className: "w-5 h-5 text-slate-400 dark:text-slate-500"})}
        </div>
      )}
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholderText}
        disabled={disabled}
        className={`w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-md text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${leadingIcon ? 'pl-10' : ''}`}
        aria-label={placeholderText}
      />
    </div>
  );
};

export default TaskInput;