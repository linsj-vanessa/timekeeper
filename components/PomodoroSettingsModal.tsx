import React, { useState, useEffect } from 'react';
import { PomodoroSettings } from '../types';
import CloseIcon from './icons/CloseIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface PomodoroSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: PomodoroSettings;
  onSave: (newSettings: PomodoroSettings) => void;
}

const PomodoroSettingsModal: React.FC<PomodoroSettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<PomodoroSettings>(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    if (numValue > 0 && numValue < 1000) {
        setSettings(prev => ({ ...prev, [name]: numValue }));
    } else if (value === '') {
        setSettings(prev => ({ ...prev, [name]: 0 }));
    }
  };

  const handleSave = () => {
    const validatedSettings = {
        focusDurationMinutes: Math.max(1, settings.focusDurationMinutes),
        shortBreakDurationMinutes: Math.max(1, settings.shortBreakDurationMinutes),
        longBreakDurationMinutes: Math.max(1, settings.longBreakDurationMinutes),
        cyclesPerLongBreak: Math.max(1, settings.cyclesPerLongBreak),
    };
    onSave(validatedSettings);
    onClose();
  };

  const inputClass = "w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-800 dark:bg-slate-900 p-4 flex justify-between items-center">
          <h2 id="settings-modal-title" className="text-lg font-semibold text-white">{t('pomodoroSettingsTitle')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label={t('close')}>
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <div>
            <label htmlFor="focusDurationMinutes" className={labelClass}>{t('focusDurationMinutes')}</label>
            <input type="number" id="focusDurationMinutes" name="focusDurationMinutes" value={settings.focusDurationMinutes} onChange={handleChange} min="1" className={inputClass} />
          </div>
          <div>
            <label htmlFor="shortBreakDurationMinutes" className={labelClass}>{t('shortBreakMinutes')}</label>
            <input type="number" id="shortBreakDurationMinutes" name="shortBreakDurationMinutes" value={settings.shortBreakDurationMinutes} onChange={handleChange} min="1" className={inputClass} />
          </div>
          <div>
            <label htmlFor="longBreakDurationMinutes" className={labelClass}>{t('longBreakMinutes')}</label>
            <input type="number" id="longBreakDurationMinutes" name="longBreakDurationMinutes" value={settings.longBreakDurationMinutes} onChange={handleChange} min="1" className={inputClass} />
          </div>
          <div>
            <label htmlFor="cyclesPerLongBreak" className={labelClass}>{t('cyclesPerLongBreak')}</label>
            <input type="number" id="cyclesPerLongBreak" name="cyclesPerLongBreak" value={settings.cyclesPerLongBreak} onChange={handleChange} min="1" className={inputClass} />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-sm font-medium">
            {t('cancel')}
          </button>
          <button onClick={handleSave} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            {t('saveSettings')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroSettingsModal;