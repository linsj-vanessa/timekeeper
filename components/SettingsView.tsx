
import React, { useState, useEffect } from 'react';
import type { LanguageCode, PomodoroSettings, Theme, UnlockedThemeId } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { APP_VERSION, AVAILABLE_THEMES } from '../constants';
import SettingsIcon from './icons/SettingsIcon';
import PomodoroSettingsModal from './PomodoroSettingsModal';
import CalendarIcon from './icons/CalendarIcon'; // For Integrations title
import PaletteIcon from './icons/PaletteIcon'; // For Themes title


interface SettingsViewProps {
  // Language
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;

  // Daily Goal
  dailyGoalHours: number;
  onUpdateDailyGoal: (newGoal: number) => void;

  // Pomodoro Settings
  pomodoroSettings: PomodoroSettings;
  onSavePomodoroSettings: (settings: PomodoroSettings) => void;

  // Google API General
  gapiInitAttempted: boolean;
  isGapiReady: boolean;
  isGoogleAuthenticated: boolean;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;

  // Google Drive Props
  isDriveBackupEnabled: boolean;
  driveSyncStatusMessageKey: string;
  driveSyncStatusMessageParams?: Record<string, string | number>;
  onToggleDriveBackup: (enable: boolean) => void;
  onBackupToDrive: () => void;
  onRestoreFromDrive: () => void;

  // Google Calendar Props
  isCalendarSyncEnabled: boolean;
  calendarSyncStatusMessageKey: string;
  calendarSyncStatusMessageParams?: Record<string, string | number>;
  onToggleCalendarSync: (enable: boolean) => void;
  onManuallyCreateTimekeeperCalendar: () => void;

  // Theme Props
  availableThemes: Theme[];
  unlockedThemeIds: UnlockedThemeId[];
  selectedThemeId: string | null;
  onSelectTheme: (themeId: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  currentLanguage,
  onLanguageChange,
  dailyGoalHours,
  onUpdateDailyGoal,
  pomodoroSettings,
  onSavePomodoroSettings,
  gapiInitAttempted,
  isGapiReady,
  isGoogleAuthenticated,
  onSignInGoogle,
  onSignOutGoogle,
  isDriveBackupEnabled,
  driveSyncStatusMessageKey,
  driveSyncStatusMessageParams,
  onToggleDriveBackup,
  onBackupToDrive,
  onRestoreFromDrive,
  isCalendarSyncEnabled,
  calendarSyncStatusMessageKey,
  calendarSyncStatusMessageParams,
  onToggleCalendarSync,
  onManuallyCreateTimekeeperCalendar,
  availableThemes, // Direct pass-through of all themes
  unlockedThemeIds,
  selectedThemeId,
  onSelectTheme
}) => {
  const { t } = useLanguage();
  const [currentDailyGoalInput, setCurrentDailyGoalInput] = useState<string>(dailyGoalHours.toString());
  const [isPomodoroModalOpen, setIsPomodoroModalOpen] = useState(false);

  useEffect(() => {
    setCurrentDailyGoalInput(dailyGoalHours.toString());
  }, [dailyGoalHours]);

  const handleDailyGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal = parseFloat(currentDailyGoalInput);
    if (!isNaN(newGoal) && newGoal > 0 && newGoal <= 24) {
      onUpdateDailyGoal(newGoal);
    } else {
      setCurrentDailyGoalInput(dailyGoalHours.toString());
    }
  };

  const driveStatusMessage = t(driveSyncStatusMessageKey, driveSyncStatusMessageParams);
  const calendarStatusMessage = t(calendarSyncStatusMessageKey, calendarSyncStatusMessageParams);

  const sectionCardClass = "p-6 bg-[var(--color-bg-secondary)] rounded-xl shadow-lg";
  const sectionTitleClass = "text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center";
  const inputBaseClass = "w-full px-3 py-2.5 border border-[var(--color-border-primary)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:border-[var(--color-accent-primary)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] bg-[var(--color-bg-secondary)]";
  const labelBaseClass = "block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5";
  const buttonClass = "px-5 py-2.5 text-sm font-semibold rounded-lg shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-secondary)]";
  const primaryButtonClass = (color: string = 'blue') => {
    // Tailwind color mapping for themes
    if (color === 'blue') return `${buttonClass} bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary-hover)] text-[var(--color-accent-text-primary)] focus:ring-[var(--color-accent-primary)]`;
    if (color === 'teal') return `${buttonClass} bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500`; // Example for specific colors not from theme vars
    if (color === 'green') return `${buttonClass} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500`;
    return `${buttonClass} bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary-hover)] text-[var(--color-accent-text-primary)] focus:ring-[var(--color-accent-primary)]`;
  };
  const secondaryButtonClass = `${buttonClass} bg-slate-200 hover:bg-slate-300 text-slate-700 focus:ring-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200`; // Keep specific for now, or adapt to theme vars

  const ToggleSwitch: React.FC<{id: string, checked: boolean, onChange: (checked: boolean) => void, labelKey: string}> = ({id, checked, onChange, labelKey}) => (
     <div className="flex items-center justify-between">
        <label htmlFor={id} className={labelBaseClass}>{t(labelKey)}</label>
        <button
        id={id}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
            checked ? 'bg-[var(--color-accent-primary)]' : 'bg-[var(--color-border-secondary)]'
        }`}
        role="switch"
        aria-checked={checked}
        >
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
        </button>
    </div>
  );

  const displayableUnlockedThemes = availableThemes.filter(theme => unlockedThemeIds.includes(theme.id));


  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{t('navSettings')}</h1>

      {/* General Settings */}
      <section className={sectionCardClass}>
        <h2 className={sectionTitleClass}>
          <SettingsIcon className="w-5 h-5 mr-2 text-[var(--color-text-muted)]" />
          {t('generalSettings')}
        </h2>
        <div className="space-y-5">
          <div>
            <label htmlFor="languageSelect" className={labelBaseClass}>{t('language')}</label>
            <select
              id="languageSelect"
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className={`${inputBaseClass} cursor-pointer`}
            >
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
          <form onSubmit={handleDailyGoalSubmit}>
            <div>
              <label htmlFor="dailyGoalInput" className={labelBaseClass}>{t('setDailyGoalHours')}</label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  id="dailyGoalInput"
                  value={currentDailyGoalInput}
                  onChange={(e) => setCurrentDailyGoalInput(e.target.value)}
                  className={inputBaseClass}
                  step="0.1" min="0.1" max="24" required
                />
                <button type="submit" className={primaryButtonClass('blue')}>
                  {t('setGoal')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Theme Settings */}
      <section className={sectionCardClass}>
        <h2 className={sectionTitleClass}>
          <PaletteIcon className="w-5 h-5 mr-2 text-[var(--color-text-muted)]" />
          {t('themeSettingsTitle')}
        </h2>
        {displayableUnlockedThemes.length > 0 ? (
            <div className="space-y-3">
                <p className={labelBaseClass}>{t('selectActiveTheme')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {displayableUnlockedThemes.map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => onSelectTheme(theme.id)}
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all
                                ${selectedThemeId === theme.id
                                    ? 'border-[var(--color-accent-primary)] ring-2 ring-[var(--color-accent-primary)] bg-[var(--color-bg-primary)] text-[var(--color-accent-primary)]'
                                    : 'border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]'
                                }
                            `}
                            aria-pressed={selectedThemeId === theme.id}
                        >
                            {t(theme.nameKey)}
                        </button>
                    ))}
                </div>
            </div>
        ) : (
            <p className="text-sm text-[var(--color-text-muted)]">{t('noThemesUnlocked')}</p>
        )}
      </section>


      {/* Pomodoro Settings */}
      <section className={sectionCardClass}>
        <h2 className={sectionTitleClass}>
            <SettingsIcon className="w-5 h-5 mr-2 text-[var(--color-text-muted)]" />
            {t('pomodoroSettings')}
        </h2>
        <button
            onClick={() => setIsPomodoroModalOpen(true)}
            className={`${primaryButtonClass('teal')} w-full sm:w-auto`}
        >
            {t('pomodoroSettingsTitle')}
        </button>
      </section>

      {/* Google Integrations Section */}
      <section className={sectionCardClass}>
        <h2 className={sectionTitleClass}>
          <CalendarIcon className="w-5 h-5 mr-2 text-[var(--color-text-muted)]" />
          {t('integrations')}
        </h2>
        {(() => {
          if (isGapiReady) {
            if (isGoogleAuthenticated) {
              return (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-semibold text-[var(--color-text-secondary)] mb-3">{t('googleDriveBackup')}</h3>
                    <ToggleSwitch id="enableDriveBackupToggle" checked={isDriveBackupEnabled} onChange={onToggleDriveBackup} labelKey="enableCloudBackup" />
                    {isDriveBackupEnabled && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-3">
                        <button onClick={onBackupToDrive} className={`${primaryButtonClass('blue')} flex-1`}>
                          {t('backupNow')}
                        </button>
                        <button onClick={onRestoreFromDrive} className={`${primaryButtonClass('sky')} flex-1`}> {/* Assuming sky maps to a valid color */}
                          {t('restoreFromDrive')}
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-[var(--color-text-muted)] pt-2">{driveStatusMessage}</p>
                  </div>

                  <div>
                    <h3 className="text-md font-semibold text-[var(--color-text-secondary)] mb-3">{t('googleCalendarSync')}</h3>
                    <ToggleSwitch id="enableCalendarSyncToggle" checked={isCalendarSyncEnabled} onChange={onToggleCalendarSync} labelKey="enableCalendarSync"/>
                    {isCalendarSyncEnabled && (
                      <button onClick={onManuallyCreateTimekeeperCalendar} className={`${secondaryButtonClass} w-full mt-3 text-xs`}>
                          {t('calendarRecheckOrCreate')}
                        </button>
                    )}
                    <p className="text-xs text-[var(--color-text-muted)] pt-2">{calendarStatusMessage}</p>
                     <p className="text-xs text-[var(--color-text-muted)] mt-1">{t('calendarSyncReminder')}</p>
                  </div>

                  <button onClick={onSignOutGoogle} className={`${secondaryButtonClass} w-full mt-4`}>
                    {t('disconnectGoogle')}
                  </button>
                </div>
              );
            } else {
              return (
                <button onClick={onSignInGoogle} className={`${primaryButtonClass('green')} w-full`}>
                  {t('connectToGoogle')}
                </button>
              );
            }
          } else {
            if (gapiInitAttempted) {
              const isErrorState = driveSyncStatusMessageKey === "driveStatusNotConfigured" || driveSyncStatusMessageKey === "driveStatusFailedInit" ||
                                 calendarSyncStatusMessageKey === "calendarStatusNotConfigured" || calendarSyncStatusMessageKey === "calendarStatusFailedInit";
              let messageToDisplay = driveStatusMessage;
              if (driveSyncStatusMessageKey !== "driveStatusNotConfigured" && driveSyncStatusMessageKey !== "driveStatusFailedInit") {
                messageToDisplay = calendarStatusMessage;
              }
              if (!isErrorState && (driveSyncStatusMessageKey === "driveStatusConnectToEnable" && calendarSyncStatusMessageKey === "calendarStatusConnectToEnable")) {
                 messageToDisplay = t('driveStatusFailedInit');
              }

              return <p className={`text-sm ${isErrorState || messageToDisplay === t('driveStatusFailedInit') ? 'text-red-600 dark:text-red-400' : 'text-[var(--color-text-muted)]'}`}>{messageToDisplay}</p>;
            } else {
              return <p className="text-sm text-[var(--color-text-muted)]">{t('loadingGoogleAPI')}</p>;
            }
          }
        })()}
      </section>

      <div className="text-center text-xs text-[var(--color-text-muted)] pt-4">
        {t('appName')} v{APP_VERSION}
      </div>

      {isPomodoroModalOpen && (
        <PomodoroSettingsModal
          isOpen={isPomodoroModalOpen}
          currentSettings={pomodoroSettings}
          onSave={(newSettings) => {
            onSavePomodoroSettings(newSettings);
            setIsPomodoroModalOpen(false);
          }}
          onClose={() => setIsPomodoroModalOpen(false)}
        />
      )}
    </div>
  );
};

export default SettingsView;
