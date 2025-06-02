
export interface Project {
  id: string;
  name: string;
  color: string; // e.g., Tailwind color class like 'bg-red-500' or hex string
}

export interface Task {
  id: string;
  description: string;
  projectId?: string; // Optional: ID of the project this task belongs to
  startTimeEpoch: number;
  endTimeEpoch?: number;
  durationSeconds: number; // Duration of this specific entry
  isPomodoro: boolean; // True if this task entry was from a Pomodoro focus session
  pomodoroCycleCount: number; // If isPomodoro, indicates which focus cycle number this was in the current session/set
  date: string; // YYYY-MM-DD
}

export interface Event {
  id: string; // e.g., 'event-summer-code-fest'
  nameKey: string; // Translation key for event name
  descriptionKey: string; // Translation key for event description
  date: string; // YYYY-MM-DD (can be a general period or a specific date)
  themeIdToUnlock?: string; // ID of the theme this event can unlock
  icon?: React.FC<{ className?: string }>; // Optional: Icon for the event
}

export interface PomodoroSettings {
  focusDurationMinutes: number;
  shortBreakDurationMinutes: number;
  longBreakDurationMinutes: number;
  cyclesPerLongBreak: number;
}

export enum PomodoroPhase {
  IDLE = 'IDLE',
  FOCUS = 'FOCUS',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
}

export enum TimerMode {
  MANUAL = 'MANUAL',
  POMODORO = 'POMODORO',
}

export interface Theme {
  id: string; // e.g., 'default-light', 'oceanic'
  nameKey: string; // Translation key for theme name e.g., 'themeNameDefaultLight'
  className: string; // CSS class to apply to the root element e.g., 'theme-default-light'
  isDefault?: boolean; // Indicates if this is a default, always unlocked theme
}

export type UnlockedThemeId = string; // Store just the ID of the unlocked theme

export interface AppBackupData {
  version: string; // e.g., "1.3.0" app version or backup data schema version
  timestamp: number; // Epoch milliseconds when the backup was created
  tasks: Task[];
  projects: Project[];
  // events are now predefined, so not part of backup
  pomodoroSettings: PomodoroSettings;
  dailyGoalHours: number;
  language?: LanguageCode;
  isCalendarSyncEnabled?: boolean;
  timekeeperCalendarId?: string | null;
  selectedThemeId?: string | null;
  unlockedThemeIds?: UnlockedThemeId[];
}

export type LanguageCode = 'en' | 'pt';

export interface ActiveTimerInfo { // Renamed from ActiveTimerHeaderInfo for broader use
  mode: TimerMode;
  elapsedSeconds: number;
  phase?: PomodoroPhase;
  description?: string;
}

export type View = 'dashboard' | 'tracking' | 'reports' | 'settings' | 'projects' | 'tasks' | 'events';