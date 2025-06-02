
import { PomodoroSettings, PomodoroPhase, LanguageCode, View, Theme, Event } from './types';
import DashboardIcon from './components/icons/DashboardIcon';
import ClockIcon from './components/icons/ClockIcon';
import FolderIcon from './components/icons/FolderIcon';
import ClipboardDocumentListIcon from './components/icons/ClipboardDocumentListIcon';
import BarChartIcon from './components/icons/BarChartIcon';
import SettingsIcon from './components/icons/SettingsIcon';
import CalendarIcon from './components/icons/CalendarIcon';
import GiftIcon from './components/icons/GiftIcon'; // Assuming a GiftIcon for events

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusDurationMinutes: 25,
  shortBreakDurationMinutes: 5,
  longBreakDurationMinutes: 15,
  cyclesPerLongBreak: 4,
};

export const LOCAL_STORAGE_TASKS_KEY = 'pomoTrackTasks';
export const LOCAL_STORAGE_SETTINGS_KEY = 'pomoTrackSettings'; // Will store PomodoroSettings
export const LOCAL_STORAGE_PROJECTS_KEY = 'pomoTrackProjects';
// export const LOCAL_STORAGE_EVENTS_KEY = 'timekeeperEvents'; // Removed, events are predefined
export const LOCAL_STORAGE_DAILY_GOAL_KEY = 'timekeeperDailyGoalHours';
export const LOCAL_STORAGE_TIMER_MODE_KEY = 'timekeeperLastTimerMode';
export const LOCAL_STORAGE_DRIVE_BACKUP_ENABLED_KEY = 'timekeeperDriveBackupEnabled';
export const LOCAL_STORAGE_LANGUAGE_KEY = 'timekeeperLanguage';
export const LOCAL_STORAGE_CALENDAR_SYNC_ENABLED_KEY = 'timekeeperCalendarSyncEnabled';
export const LOCAL_STORAGE_TIMEKEEPER_CALENDAR_ID_KEY = 'timekeeperCalendarId';
export const LOCAL_STORAGE_SELECTED_THEME_ID_KEY = 'timekeeperSelectedThemeId';
export const LOCAL_STORAGE_UNLOCKED_THEME_IDS_KEY = 'timekeeperUnlockedThemeIds';


export const APP_NAME_KEY = "appName"; // Key for translation
export const APP_VERSION = "1.6.0"; // Incremented for new theme structure

// IMPORTANT: Replace with your actual Google Cloud Project API Key and OAuth Client ID
export const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY'; // Renamed for clarity, use same value as GOOGLE_DRIVE_API_KEY
export const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // Renamed for clarity, use same value as GOOGLE_DRIVE_CLIENT_ID

export const GOOGLE_API_DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
];
export const GOOGLE_API_SCOPES = [
    'https://www.googleapis.com/auth/drive.appfolder',
    'https://www.googleapis.com/auth/calendar' // Full calendar access for creating calendar and events
].join(' ');

export const GOOGLE_DRIVE_BACKUP_FILENAME = 'timekeeper_app_data.json';
export const TIMEKEEPER_CALENDAR_NAME = 'timekeeper';


export const PHASE_DESCRIPTIONS_KEYS: Record<PomodoroPhase, string> = {
  [PomodoroPhase.IDLE]: "pomodoroPhaseIdle",
  [PomodoroPhase.FOCUS]: "pomodoroPhaseFocus",
  [PomodoroPhase.SHORT_BREAK]: "pomodoroPhaseShortBreak",
  [PomodoroPhase.LONG_BREAK]: "pomodoroPhaseLongBreak",
};

export const PHASE_BG_COLORS: Record<PomodoroPhase, string> = {
  [PomodoroPhase.IDLE]: "bg-slate-500",
  [PomodoroPhase.FOCUS]: "bg-red-600",
  [PomodoroPhase.SHORT_BREAK]: "bg-sky-500",
  [PomodoroPhase.LONG_BREAK]: "bg-indigo-600",
};

export const PHASE_HEX_COLORS: Record<PomodoroPhase, string> = {
    [PomodoroPhase.IDLE]: "#64748B", // slate-500
    [PomodoroPhase.FOCUS]: "#DC2626", // red-600
    [PomodoroPhase.SHORT_BREAK]: "#0EA5E9", // sky-500
    [PomodoroPhase.LONG_BREAK]: "#4F46E5", // indigo-600
};


export interface ProjectColor {
  name: string; // This might become a translation key if needed
  tailwindClass: string;
  hexColor: string;
}

export const PROJECT_COLORS: ProjectColor[] = [
  { name: 'Red', tailwindClass: 'bg-red-500', hexColor: '#EF4444' },
  { name: 'Blue', tailwindClass: 'bg-blue-500', hexColor: '#3B82F6' },
  { name: 'Green', tailwindClass: 'bg-green-500', hexColor: '#22C55E' },
  { name: 'Yellow', tailwindClass: 'bg-yellow-500', hexColor: '#EAB308' },
  { name: 'Purple', tailwindClass: 'bg-purple-500', hexColor: '#A855F7' },
  { name: 'Pink', tailwindClass: 'bg-pink-500', hexColor: '#EC4899' },
  { name: 'Teal', tailwindClass: 'bg-teal-500', hexColor: '#14B8A6' },
  { name: 'Orange', tailwindClass: 'bg-orange-500', hexColor: '#F97316' },
];

export const TASK_COLORS_PALETTE: string[] = [
  '#64748B', // slate-500
  '#71717A', // zinc-500
  '#A1A1AA', // stone-500
  '#78716C', // neutral-500
  '#F87171', // red-400
  '#FBBF24', // amber-400
  '#34D399', // emerald-400
  '#60A5FA', // blue-400
  '#A78BFA', // violet-400
  '#F472B6', // pink-400
];

export const DEFAULT_TASK_COLOR: string = '#9CA3AF'; // gray-400
export const DEFAULT_EVENT_COLOR: string = '#A78BFA'; // violet-400 (Example color)
export const DEFAULT_DAILY_GOAL_HOURS = 8;
export const TIMER_TICK_COUNT = 24;
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export interface NavItemConfig {
  view: View;
  labelKey: string;
  icon: React.FC<{ className?: string }>;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { view: 'dashboard', labelKey: 'navDashboard', icon: DashboardIcon },
  { view: 'tracking', labelKey: 'navTracking', icon: ClockIcon },
  { view: 'projects', labelKey: 'navProjects', icon: FolderIcon },
  { view: 'tasks', labelKey: 'navTasks', icon: ClipboardDocumentListIcon },
  { view: 'events', labelKey: 'navEvents', icon: GiftIcon }, // Changed icon for Events
  { view: 'reports', labelKey: 'navReports', icon: BarChartIcon },
  { view: 'settings', labelKey: 'navSettings', icon: SettingsIcon },
];

// THEME CONSTANTS
export const DEFAULT_THEME_ID = 'default-dark';

export const AVAILABLE_THEMES: Theme[] = [
  { id: 'default-light', nameKey: 'themeNameDefaultLight', className: 'theme-default-light', isDefault: true },
  { id: 'default-dark', nameKey: 'themeNameDefaultDark', className: 'theme-default-dark', isDefault: true },
  { id: 'batman-knight', nameKey: 'themeNameBatmanKnight', className: 'theme-batman-knight' },
  { id: 'ironman-armor', nameKey: 'themeNameIronmanArmor', className: 'theme-ironman-armor' },
  { id: 'agent-secret', nameKey: 'themeNameAgentSecret', className: 'theme-agent-secret' },
];

// PREDEFINED EVENTS
export const PREDEFINED_EVENTS: Event[] = [
  {
    id: 'event-batman-unlock',
    nameKey: 'eventNameBatmanUnlock',
    descriptionKey: 'eventDescBatmanUnlock',
    date: 'Vigilante Challenge', // Can be a generic string
    themeIdToUnlock: 'batman-knight',
    icon: CalendarIcon,
  },
  {
    id: 'event-ironman-unlock',
    nameKey: 'eventNameIronmanUnlock',
    descriptionKey: 'eventDescIronmanUnlock',
    date: 'Genius Inventor Assembly', // Can be a generic string
    themeIdToUnlock: 'ironman-armor',
    icon: CalendarIcon,
  },
  {
    id: 'event-agent-secret-unlock',
    nameKey: 'eventNameAgentSecretUnlock',
    descriptionKey: 'eventDescAgentSecretUnlock',
    date: 'Top Secret Mission', // Can be a generic string
    themeIdToUnlock: 'agent-secret',
    icon: CalendarIcon,
  },
];