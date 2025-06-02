
import React, { useState, useEffect, useCallback, useRef } from 'react';
import SidebarNav from './components/SidebarNav';
import TopNavBar from './components/TopNavBar';
import DailyOverviewTimeIcon from './components/icons/DailyOverviewTimeIcon';
import TimerActiveView from './components/TimerActiveView';
import PomodoroHostView from './components/PomodoroHostView';
import TimerStarterView from './components/TimerStarterView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import ProjectsView from './components/ProjectsView';
import TasksView from './components/TasksView';
import EventsView from './components/EventsView';
import EditTaskModal from './components/EditTaskModal';
import FocusModeDisplay from './components/FocusModeDisplay';
import PomodoroSettingsModal from './components/PomodoroSettingsModal';
import ConfirmationModal from './components/ConfirmationModal';
import { useLanguage } from './contexts/LanguageContext';
import PlayIcon from './components/icons/PlayIcon';

import {
  APP_VERSION,
  LOCAL_STORAGE_TASKS_KEY,
  LOCAL_STORAGE_PROJECTS_KEY,
  // LOCAL_STORAGE_EVENTS_KEY, // Removed
  LOCAL_STORAGE_SETTINGS_KEY,
  LOCAL_STORAGE_DAILY_GOAL_KEY,
  LOCAL_STORAGE_DRIVE_BACKUP_ENABLED_KEY,
  LOCAL_STORAGE_CALENDAR_SYNC_ENABLED_KEY,
  LOCAL_STORAGE_TIMEKEEPER_CALENDAR_ID_KEY,
  LOCAL_STORAGE_SELECTED_THEME_ID_KEY,
  LOCAL_STORAGE_UNLOCKED_THEME_IDS_KEY,
  DEFAULT_DAILY_GOAL_HOURS,
  DEFAULT_POMODORO_SETTINGS,
  TASK_COLORS_PALETTE,
  DEFAULT_TASK_COLOR,
  GOOGLE_CLIENT_ID,
  GOOGLE_API_KEY,
  TIMEKEEPER_CALENDAR_NAME,
  PHASE_DESCRIPTIONS_KEYS,
  AVAILABLE_THEMES,
  DEFAULT_THEME_ID,
  PREDEFINED_EVENTS
} from './constants';
import { formatDurationToHumanReadable } from './utils/formatTime';
import type { Task, Project, Event, PomodoroSettings, PomodoroPhase, TimerMode, AppBackupData, ActiveTimerInfo, View, LanguageCode, UnlockedThemeId, Theme } from './types';
import { PomodoroPhase as PPhase, TimerMode as TMode } from './types';
import {
  initGoogleApiClient,
  signInToGoogle,
  signOutFromGoogle,
  uploadToDrive,
  downloadFromDrive,
  listCalendars,
  createCalendar,
  createCalendarEvent,
  isGoogleUserSignedIn
} from './utils/googleDrive';


const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

interface DailyOverviewChartProps {
  todaysTasks: Task[];
  projects: Project[];
  totalSecondsToday: number;
  dailyGoalHours: number;
}

const DailyOverviewChart: React.FC<DailyOverviewChartProps> = ({
  todaysTasks,
  projects,
  totalSecondsToday,
  dailyGoalHours
}) => {
  const radius = 60;
  const strokeWidth = 12;
  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;

  const dailyGoalSeconds = dailyGoalHours > 0 ? dailyGoalHours * 3600 : 1;
  let accumulatedDuration = 0;

  return (
    <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={innerRadius} fill="none" stroke="var(--color-border-secondary)" strokeWidth={strokeWidth} />
        {todaysTasks.map((task, index) => {
          if (task.durationSeconds <= 0 || dailyGoalSeconds <=0) return null;
          const project = projects.find(p => p.id === task.projectId);
          const taskColor = project?.color || TASK_COLORS_PALETTE[index % TASK_COLORS_PALETTE.length] || DEFAULT_TASK_COLOR;
          const startFraction = accumulatedDuration / dailyGoalSeconds;
          const taskFraction = task.durationSeconds / dailyGoalSeconds;
          const endFraction = Math.min(startFraction + taskFraction, 1);
          const visibleSegmentFraction = Math.max(0, endFraction - startFraction);
          accumulatedDuration += task.durationSeconds;
          if (visibleSegmentFraction <= 0) return null;
          return (
            <circle
              key={task.id} cx="75" cy="75" r={innerRadius} fill="none" stroke={taskColor} strokeWidth={strokeWidth}
              strokeDasharray={`${visibleSegmentFraction * circumference} ${circumference}`}
              strokeDashoffset={-(startFraction * circumference)} strokeLinecap="round" transform="rotate(-90 75 75)"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <DailyOverviewTimeIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--color-accent-primary)]" />
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>(PREDEFINED_EVENTS); // Initialize with predefined events
  const [dailyGoalHours, setDailyGoalHours] = useState<number>(DEFAULT_DAILY_GOAL_HOURS);

  // Theme state
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [unlockedThemeIds, setUnlockedThemeIds] = useState<UnlockedThemeId[]>(
    AVAILABLE_THEMES.filter(theme => theme.isDefault).map(theme => theme.id)
  );

  const manualTimerIntervalRef = useRef<number | null>(null);
  const [manualTimerData, setManualTimerData] = useState<{
    elapsedSeconds: number; description: string; projectId?: string; isRunning: boolean; startedAt: number;
  } | null>(null);

  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO_SETTINGS);
  const [currentPomodoroPhase, setCurrentPomodoroPhase] = useState<PomodoroPhase>(PPhase.IDLE);
  const [pomodoroTimerElapsedSeconds, setPomodoroTimerElapsedSeconds] = useState<number>(0);
  const [isPomodoroTimerRunning, setIsPomodoroTimerRunning] = useState<boolean>(false);
  const [pomodoroCyclesInCurrentSet, setPomodoroCyclesInCurrentSet] = useState<number>(0);
  const [totalPomodorosCompletedThisSession, setTotalPomodorosCompletedThisSession] = useState<number>(0);
  const [currentPomodoroTaskDescription, setCurrentPomodoroTaskDescription] = useState<string>("");
  const [currentPomodoroTaskProjectId, setCurrentPomodoroTaskProjectId] = useState<string | undefined>(undefined);
  const [currentPomodoroFocusStartTimeEpoch, setCurrentPomodoroFocusStartTimeEpoch] = useState<number | null>(null);
  const pomodoroTimerIntervalRef = useRef<number | null>(null);

  const [isMainPomodoroSettingsModalOpen, setIsMainPomodoroSettingsModalOpen] = useState<boolean>(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);
  const [isFocusModeActive, setIsFocusModeActive] = useState<boolean>(false);

  // Google API State
  const [gapiInitAttempted, setGapiInitAttempted] = useState<boolean>(false);
  const [isGapiReady, setIsGapiReady] = useState<boolean>(false);
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState<boolean>(false);
  const [isDriveBackupEnabled, setIsDriveBackupEnabled] = useState<boolean>(false);
  const [driveSyncStatusMessageKey, setDriveSyncStatusMessageKey] = useState<string>("driveStatusConnectToEnable");
  const [driveSyncStatusMessageParams, setDriveSyncStatusMessageParams] = useState<Record<string, string | number> | undefined>(undefined);
  const [isCalendarSyncEnabled, setIsCalendarSyncEnabled] = useState<boolean>(false);
  const [timekeeperCalendarId, setTimekeeperCalendarId] = useState<string | null>(null);
  const [calendarSyncStatusMessageKey, setCalendarSyncStatusMessageKey] = useState<string>("calendarStatusConnectToEnable");
  const [calendarSyncStatusMessageParams, setCalendarSyncStatusMessageParams] = useState<Record<string, string | number> | undefined>(undefined);

  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean; titleKey: string; messageKey: string; messageParams?: Record<string, string|number>; onConfirm: () => void; confirmTextKey?: string;
  } | null>(null);

  const applyTheme = useCallback((themeId: string | null) => {
    const themeToApply = AVAILABLE_THEMES.find(theme => theme.id === themeId) || AVAILABLE_THEMES.find(theme => theme.id === DEFAULT_THEME_ID);
    if (themeToApply) {
      document.documentElement.className = themeToApply.className;
    } else {
      document.documentElement.className = ''; // Fallback or default un-themed
    }
  }, []);

  useEffect(() => {
    const storedTasks = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
    if (storedTasks) try { setAllTasks(JSON.parse(storedTasks)); } catch (e) { console.error("Error parsing tasks from localStorage:", e); }

    const storedProjects = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
    if (storedProjects) try { setProjects(JSON.parse(storedProjects)); } catch (e) { console.error("Error parsing projects from localStorage:", e); }

    // Events are now predefined, no need to load from localStorage
    // const storedEvents = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
    // if (storedEvents) try { setAllEvents(JSON.parse(storedEvents)); } catch (e) { console.error("Error parsing events from localStorage:", e); }

    const storedDailyGoal = localStorage.getItem(LOCAL_STORAGE_DAILY_GOAL_KEY);
    if (storedDailyGoal) { const g = parseFloat(storedDailyGoal); if (!isNaN(g) && g > 0) setDailyGoalHours(g); }

    const storedPomodoroSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (storedPomodoroSettings) try { setPomodoroSettings(JSON.parse(storedPomodoroSettings)); } catch (e) { console.error("Error parsing Pomodoro settings from localStorage:", e); }

    setIsDriveBackupEnabled(localStorage.getItem(LOCAL_STORAGE_DRIVE_BACKUP_ENABLED_KEY) === 'true');
    setIsCalendarSyncEnabled(localStorage.getItem(LOCAL_STORAGE_CALENDAR_SYNC_ENABLED_KEY) === 'true');
    setTimekeeperCalendarId(localStorage.getItem(LOCAL_STORAGE_TIMEKEEPER_CALENDAR_ID_KEY));

    // Load theme settings
    const storedThemeId = localStorage.getItem(LOCAL_STORAGE_SELECTED_THEME_ID_KEY);
    setSelectedThemeId(storedThemeId || DEFAULT_THEME_ID);
    applyTheme(storedThemeId || DEFAULT_THEME_ID);


    const storedUnlockedIds = localStorage.getItem(LOCAL_STORAGE_UNLOCKED_THEME_IDS_KEY);
    if (storedUnlockedIds) {
      try { setUnlockedThemeIds(JSON.parse(storedUnlockedIds)); } catch (e) { console.error("Error parsing unlocked themes:", e); }
    } else { // Ensure default themes are always considered unlocked if nothing is stored
       setUnlockedThemeIds(AVAILABLE_THEMES.filter(theme => theme.isDefault).map(theme => theme.id));
    }

  }, [applyTheme]);

  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(allTasks)); }, [allTasks]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects)); }, [projects]);
  // useEffect(() => { localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(allEvents)); }, [allEvents]); // Removed
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_DAILY_GOAL_KEY, dailyGoalHours.toString()); }, [dailyGoalHours]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(pomodoroSettings));}, [pomodoroSettings]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_DRIVE_BACKUP_ENABLED_KEY, String(isDriveBackupEnabled)); }, [isDriveBackupEnabled]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_CALENDAR_SYNC_ENABLED_KEY, String(isCalendarSyncEnabled)); }, [isCalendarSyncEnabled]);
  useEffect(() => {
    if (timekeeperCalendarId) localStorage.setItem(LOCAL_STORAGE_TIMEKEEPER_CALENDAR_ID_KEY, timekeeperCalendarId);
    else localStorage.removeItem(LOCAL_STORAGE_TIMEKEEPER_CALENDAR_ID_KEY);
  }, [timekeeperCalendarId]);
  useEffect(() => {
    if (selectedThemeId) localStorage.setItem(LOCAL_STORAGE_SELECTED_THEME_ID_KEY, selectedThemeId);
    else localStorage.removeItem(LOCAL_STORAGE_SELECTED_THEME_ID_KEY);
    applyTheme(selectedThemeId);
  }, [selectedThemeId, applyTheme]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_UNLOCKED_THEME_IDS_KEY, JSON.stringify(unlockedThemeIds)); }, [unlockedThemeIds]);


  const ensureTimekeeperCalendarExists = useCallback(async () => {
    if (!isCalendarSyncEnabled || !isGoogleAuthenticated || !window.gapi?.client?.calendar) {
        if (isCalendarSyncEnabled && isGoogleAuthenticated) {
            setCalendarSyncStatusMessageKey("calendarStatusApiNotReady");
        }
        return;
    }

    setCalendarSyncStatusMessageKey("calendarStatusChecking");
    try {
        const calendars = await listCalendars();
        if (calendars) {
            const existingCalendar = calendars.find(cal => cal.summary === TIMEKEEPER_CALENDAR_NAME);
            if (existingCalendar && existingCalendar.id) {
                setTimekeeperCalendarId(existingCalendar.id);
                setCalendarSyncStatusMessageKey("calendarStatusReady");
                setCalendarSyncStatusMessageParams({ calendarName: TIMEKEEPER_CALENDAR_NAME });
            } else {
                setCalendarSyncStatusMessageKey("calendarStatusCreating");
                const newCalendar = await createCalendar(TIMEKEEPER_CALENDAR_NAME);
                if (newCalendar && newCalendar.id) {
                    setTimekeeperCalendarId(newCalendar.id);
                    setCalendarSyncStatusMessageKey("calendarStatusCreated");
                    setCalendarSyncStatusMessageParams({ calendarName: TIMEKEEPER_CALENDAR_NAME });
                } else {
                    setTimekeeperCalendarId(null);
                    setCalendarSyncStatusMessageKey("calendarStatusErrorCreating");
                }
            }
        } else {
            setTimekeeperCalendarId(null);
            setCalendarSyncStatusMessageKey("calendarStatusErrorListing");
        }
    } catch (error) {
        console.error("Error ensuring Timekeeper calendar:", error);
        setTimekeeperCalendarId(null);
        setCalendarSyncStatusMessageKey("calendarStatusError");
    }
  }, [isCalendarSyncEnabled, isGoogleAuthenticated]);

  useEffect(() => {
    const handleGapiLoaded = () => {
      setGapiInitAttempted(true);

      if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' || GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY') {
          console.warn("Google API Key/Client ID are placeholders in constants.ts. Full Google integration functionality requires proper configuration.");
      }

      initGoogleApiClient(async (isSignedIn) => {
        setIsGoogleAuthenticated(isSignedIn);
        if (isGapiReady) {
            if (isSignedIn) {
                setDriveSyncStatusMessageKey(isDriveBackupEnabled ? "driveStatusConnectedReady" : "driveStatusConnectedEnable");
                if (isCalendarSyncEnabled) {
                    ensureTimekeeperCalendarExists();
                } else {
                    setCalendarSyncStatusMessageKey("calendarStatusConnectedEnable");
                }
            } else {
                setDriveSyncStatusMessageKey("driveStatusConnectToEnable");
                setCalendarSyncStatusMessageKey("calendarStatusConnectToEnable");
                setTimekeeperCalendarId(null);
            }
        }
      }).then(success => {
        setIsGapiReady(success);
        if (!success) {
            if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' || GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY') {
                setDriveSyncStatusMessageKey("driveStatusNotConfigured");
                setCalendarSyncStatusMessageKey("calendarStatusNotConfigured");
            } else {
                setDriveSyncStatusMessageKey("driveStatusFailedInit");
                setCalendarSyncStatusMessageKey("calendarStatusFailedInit");
            }
        } else {
             const initialIsSignedIn = isGoogleUserSignedIn();
             setIsGoogleAuthenticated(initialIsSignedIn);
             if (initialIsSignedIn) {
                setDriveSyncStatusMessageKey(isDriveBackupEnabled ? "driveStatusConnectedReady" : "driveStatusConnectedEnable");
                if (isCalendarSyncEnabled) {
                    ensureTimekeeperCalendarExists();
                } else {
                    setCalendarSyncStatusMessageKey("calendarStatusConnectedEnable");
                }
             } else {
                setDriveSyncStatusMessageKey("driveStatusConnectToEnable");
                setCalendarSyncStatusMessageKey("calendarStatusConnectToEnable");
             }
        }
      });
    };
    window.addEventListener('gapiLoaded', handleGapiLoaded);
    if (window.gapi && window.gapi.client && !gapiInitAttempted) {
        setTimeout(handleGapiLoaded, 0);
    }
    return () => window.removeEventListener('gapiLoaded', handleGapiLoaded);
  }, [isDriveBackupEnabled, isCalendarSyncEnabled, ensureTimekeeperCalendarExists, isGapiReady, gapiInitAttempted]);

  useEffect(() => {
    if (isCalendarSyncEnabled && isGoogleAuthenticated && !timekeeperCalendarId && isGapiReady) {
      ensureTimekeeperCalendarExists();
    }
  }, [isCalendarSyncEnabled, isGoogleAuthenticated, timekeeperCalendarId, ensureTimekeeperCalendarExists, isGapiReady]);


  useEffect(() => {
    if (manualTimerData?.isRunning) {
      if (manualTimerIntervalRef.current) clearInterval(manualTimerIntervalRef.current);
      manualTimerIntervalRef.current = window.setInterval(() => {
        setManualTimerData(prev => prev ? { ...prev, elapsedSeconds: prev.elapsedSeconds + 1 } : null);
      }, 1000);
    } else {
      if (manualTimerIntervalRef.current) clearInterval(manualTimerIntervalRef.current);
    }
    return () => { if (manualTimerIntervalRef.current) clearInterval(manualTimerIntervalRef.current); };
  }, [manualTimerData?.isRunning]);

  const syncTaskToCalendar = useCallback(async (task: Task) => {
    if (!isCalendarSyncEnabled || !timekeeperCalendarId || !isGoogleAuthenticated || !task.endTimeEpoch || !isGapiReady) {
      return;
    }
    const project = projects.find(p => p.id === task.projectId);
    const eventSummary = task.description || (task.isPomodoro ? t(PHASE_DESCRIPTIONS_KEYS.FOCUS) : t("untitledTask"));
    const eventDescription = `Tracked with ${t('appName')}.${project ? `\nProject: ${project.name}` : ''}${task.isPomodoro ? `\nPomodoro cycle: ${task.pomodoroCycleCount}` : ''}`;

    const event = {
      summary: eventSummary,
      description: eventDescription,
      start: { dateTime: new Date(task.startTimeEpoch).toISOString() },
      end: { dateTime: new Date(task.endTimeEpoch).toISOString() },
    };

    try {
      await createCalendarEvent(timekeeperCalendarId, event);
      setCalendarSyncStatusMessageKey("calendarEventAdded");
      setCalendarSyncStatusMessageParams({taskName: eventSummary, time: new Date().toLocaleTimeString()});
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      setCalendarSyncStatusMessageKey("calendarEventError");
      setCalendarSyncStatusMessageParams({taskName: eventSummary});
    }
  }, [isCalendarSyncEnabled, timekeeperCalendarId, isGoogleAuthenticated, projects, t, isGapiReady]);


  const logPomodoroFocusTask = useCallback((durationSeconds: number) => {
    if (!currentPomodoroFocusStartTimeEpoch || durationSeconds <= 0) return;
    const endTime = Date.now();
    const newTask: Task = {
      id: `task-pom-${Date.now()}`,
      description: currentPomodoroTaskDescription.trim() || t(PHASE_DESCRIPTIONS_KEYS.FOCUS),
      projectId: currentPomodoroTaskProjectId,
      startTimeEpoch: currentPomodoroFocusStartTimeEpoch,
      endTimeEpoch: endTime,
      durationSeconds: durationSeconds,
      isPomodoro: true,
      pomodoroCycleCount: pomodoroCyclesInCurrentSet + 1,
      date: new Date(currentPomodoroFocusStartTimeEpoch).toISOString().split('T')[0],
    };
    setAllTasks(prev => [newTask, ...prev].sort((a, b) => b.startTimeEpoch - a.startTimeEpoch));
    syncTaskToCalendar(newTask);
  }, [currentPomodoroTaskDescription, currentPomodoroTaskProjectId, currentPomodoroFocusStartTimeEpoch, pomodoroCyclesInCurrentSet, t, syncTaskToCalendar]);

  const handlePomodoroPhaseCompletion = useCallback(() => {
    setIsPomodoroTimerRunning(false);
    let nextPhase: PomodoroPhase = PPhase.IDLE;
    let newCyclesInSet = pomodoroCyclesInCurrentSet;
    let newTotalPomodoros = totalPomodorosCompletedThisSession;

    if (currentPomodoroPhase === PPhase.FOCUS) {
      logPomodoroFocusTask(pomodoroTimerElapsedSeconds);
      newCyclesInSet++;
      newTotalPomodoros++;
      if (newCyclesInSet >= pomodoroSettings.cyclesPerLongBreak) {
        nextPhase = PPhase.LONG_BREAK;
        newCyclesInSet = 0;
      } else {
        nextPhase = PPhase.SHORT_BREAK;
      }
    } else if (currentPomodoroPhase === PPhase.SHORT_BREAK || currentPomodoroPhase === PPhase.LONG_BREAK) {
      nextPhase = PPhase.FOCUS;
    }

    setCurrentPomodoroPhase(nextPhase);
    setPomodoroTimerElapsedSeconds(0);
    setPomodoroCyclesInCurrentSet(newCyclesInSet);
    setTotalPomodorosCompletedThisSession(newTotalPomodoros);

    if (nextPhase === PPhase.FOCUS) {
      setCurrentPomodoroFocusStartTimeEpoch(Date.now());
      setIsPomodoroTimerRunning(true);
    } else if (nextPhase === PPhase.SHORT_BREAK || nextPhase === PPhase.LONG_BREAK) {
      setIsPomodoroTimerRunning(true);
    }
  }, [currentPomodoroPhase, pomodoroTimerElapsedSeconds, pomodoroCyclesInCurrentSet, totalPomodorosCompletedThisSession, pomodoroSettings, logPomodoroFocusTask]);

  useEffect(() => {
    if (isPomodoroTimerRunning) {
      if (pomodoroTimerIntervalRef.current) clearInterval(pomodoroTimerIntervalRef.current);
      pomodoroTimerIntervalRef.current = window.setInterval(() => {
        setPomodoroTimerElapsedSeconds(prevSeconds => {
          const currentPhaseDuration =
            currentPomodoroPhase === PPhase.FOCUS ? pomodoroSettings.focusDurationMinutes * 60 :
            currentPomodoroPhase === PPhase.SHORT_BREAK ? pomodoroSettings.shortBreakDurationMinutes * 60 :
            currentPomodoroPhase === PPhase.LONG_BREAK ? pomodoroSettings.longBreakDurationMinutes * 60 : 0;

          if (prevSeconds + 1 >= currentPhaseDuration && currentPhaseDuration > 0) {
            handlePomodoroPhaseCompletion();
            return currentPhaseDuration;
          }
          return prevSeconds + 1;
        });
      }, 1000);
    } else {
      if (pomodoroTimerIntervalRef.current) clearInterval(pomodoroTimerIntervalRef.current);
    }
    return () => { if (pomodoroTimerIntervalRef.current) clearInterval(pomodoroTimerIntervalRef.current); };
  }, [isPomodoroTimerRunning, currentPomodoroPhase, pomodoroSettings, handlePomodoroPhaseCompletion]);

  const exitFocusMode = useCallback(() => {
    setIsFocusModeActive(false);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(console.warn);
  }, []);

  const enterFocusMode = useCallback(() => {
    if (currentView === 'tracking' && (manualTimerData?.isRunning || isPomodoroTimerRunning)) {
      setIsFocusModeActive(true);
      (appContainerRef.current?.querySelector('main') || document.documentElement).requestFullscreen?.().catch(console.warn);
    }
  }, [currentView, manualTimerData, isPomodoroTimerRunning]);

  useEffect(() => {
    const handleChange = () => { if (!document.fullscreenElement && isFocusModeActive) setIsFocusModeActive(false); };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, [isFocusModeActive]);

  const startManualTimer = useCallback((description: string, projectId?: string) => {
    setManualTimerData({
      elapsedSeconds: 0, description: description.trim(), projectId, isRunning: true, startedAt: Date.now(),
    });
    setCurrentPomodoroPhase(PPhase.IDLE);
    setIsPomodoroTimerRunning(false);
    setCurrentView('tracking');
    exitFocusMode();
  }, [exitFocusMode]);

  const updateManualTimerDescription = useCallback((desc: string) => {
    setManualTimerData(prev => prev ? { ...prev, description: desc } : null);
  }, []);
  const updateManualTimerProjectId = useCallback((projId?: string) => {
    setManualTimerData(prev => prev ? { ...prev, projectId: projId } : null);
  }, []);
  const toggleManualTimerPauseResume = useCallback(() => {
    setManualTimerData(prev => prev ? { ...prev, isRunning: !prev.isRunning } : null);
  }, []);

  const stopManualTimer = useCallback(() => {
    if (!manualTimerData) return;
    const endTime = Date.now();
    const newTask: Task = {
      id: `task-man-${Date.now()}`,
      description: manualTimerData.description.trim() || t("untitledTask"),
      projectId: manualTimerData.projectId,
      startTimeEpoch: manualTimerData.startedAt,
      endTimeEpoch: endTime,
      durationSeconds: manualTimerData.elapsedSeconds,
      isPomodoro: false, pomodoroCycleCount: 0,
      date: new Date(manualTimerData.startedAt).toISOString().split('T')[0],
    };
    setAllTasks(prev => [newTask, ...prev].sort((a, b) => b.startTimeEpoch - a.startTimeEpoch));
    syncTaskToCalendar(newTask);
    setManualTimerData(null);
    setCurrentView('dashboard');
    exitFocusMode();
  }, [manualTimerData, exitFocusMode, t, syncTaskToCalendar]);

  const startInitialPomodoroFocus = useCallback((description: string, projectId?: string) => {
    setCurrentPomodoroTaskDescription(description.trim());
    setCurrentPomodoroTaskProjectId(projectId);
    setCurrentPomodoroPhase(PPhase.FOCUS);
    setPomodoroTimerElapsedSeconds(0);
    setPomodoroCyclesInCurrentSet(0);
    setTotalPomodorosCompletedThisSession(0);
    setCurrentPomodoroFocusStartTimeEpoch(Date.now());
    setIsPomodoroTimerRunning(true);
    setManualTimerData(null);
    setCurrentView('tracking');
    exitFocusMode();
  }, [exitFocusMode]);

  const pausePomodoro = useCallback(() => setIsPomodoroTimerRunning(false), []);
  const resumePomodoro = useCallback(() => setIsPomodoroTimerRunning(true), []);

  const stopPomodoroSession = useCallback(() => {
    if (currentPomodoroPhase === PPhase.FOCUS && currentPomodoroFocusStartTimeEpoch && pomodoroTimerElapsedSeconds > 0) {
      logPomodoroFocusTask(pomodoroTimerElapsedSeconds);
    }
    setCurrentPomodoroPhase(PPhase.IDLE);
    setIsPomodoroTimerRunning(false);
    setPomodoroTimerElapsedSeconds(0);
    setCurrentView('dashboard');
    exitFocusMode();
  }, [currentPomodoroPhase, currentPomodoroFocusStartTimeEpoch, pomodoroTimerElapsedSeconds, logPomodoroFocusTask, exitFocusMode]);

  const skipPomodoroBreak = useCallback(() => {
    setCurrentPomodoroPhase(PPhase.FOCUS);
    setPomodoroTimerElapsedSeconds(0);
    setCurrentPomodoroFocusStartTimeEpoch(Date.now());
    setIsPomodoroTimerRunning(true);
  }, []);

  const handleSavePomodoroSettings = useCallback((newSettings: PomodoroSettings) => {
    setPomodoroSettings(newSettings);
    setIsMainPomodoroSettingsModalOpen(false);
  }, []);

  const handleAddProject = useCallback((name: string, hexColor: string) => {
    if (!name.trim()) return;
    setProjects(prev => [{ id: `proj-${Date.now()}`, name: name.trim(), color: hexColor }, ...prev]);
  }, []);
  const handleOpenEditModal = (task: Task) => { setTaskToEdit(task); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setTaskToEdit(null); setIsEditModalOpen(false); };
  const handleUpdateDailyGoal = useCallback((newGoal: number) => { if (newGoal > 0) setDailyGoalHours(newGoal);}, []);
  const handleUpdateTask = (updatedData: { id: string; description: string; durationSeconds: number; projectId?: string;}) => {
    setAllTasks(prev => prev.map(task => {
        if (task.id === updatedData.id) {
          const newStart = task.startTimeEpoch;
          const newEnd = task.startTimeEpoch + updatedData.durationSeconds * 1000;
          const updatedTask = { ...task, ...updatedData, endTimeEpoch: newEnd, date: new Date(newStart).toISOString().split('T')[0] };
          syncTaskToCalendar(updatedTask);
          return updatedTask;
        }
        return task;
      }).sort((a,b) => b.startTimeEpoch - a.startTimeEpoch)
    );
    handleCloseEditModal();
  };

  // handleAddEvent is removed as events are predefined
  const handleParticipateInEvent = useCallback((eventId: string) => {
    const event = PREDEFINED_EVENTS.find(e => e.id === eventId);
    if (event && event.themeIdToUnlock) {
      setUnlockedThemeIds(prevUnlocked => {
        if (!prevUnlocked.includes(event.themeIdToUnlock!)) {
          const newUnlocked = [...prevUnlocked, event.themeIdToUnlock!];
           // Optionally, auto-select the newly unlocked theme
          setSelectedThemeId(event.themeIdToUnlock!);
          setConfirmationModal({
            isOpen: true,
            titleKey: "themeUnlockedTitle",
            messageKey: "themeUnlockedMessage",
            messageParams: { themeName: t(AVAILABLE_THEMES.find(th => th.id === event.themeIdToUnlock)?.nameKey || "newTheme") },
            onConfirm: () => setConfirmationModal(null),
            confirmTextKey: "ok"
          });
          return newUnlocked;
        }
        return prevUnlocked;
      });
    }
    // Placeholder for actual participation logic
    console.log(`User participated in event: ${eventId}`);
  }, [t]);


  const handleNavigation = (view: View) => {
    setCurrentView(view);
    if (view !== 'tracking' && isFocusModeActive) exitFocusMode();
  };

  const getActiveTimerInfo = (): ActiveTimerInfo | null => {
    if (manualTimerData) {
      return { mode: TMode.MANUAL, elapsedSeconds: manualTimerData.elapsedSeconds, description: manualTimerData.description };
    }
    if (currentPomodoroPhase !== PPhase.IDLE) {
      return { mode: TMode.POMODORO, elapsedSeconds: pomodoroTimerElapsedSeconds, phase: currentPomodoroPhase };
    }
    return null;
  };

  const handleSignInGoogle = useCallback(async () => {
    if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
        setDriveSyncStatusMessageKey("driveStatusNotConfigured");
        setCalendarSyncStatusMessageKey("calendarStatusNotConfigured");
        return;
    }
    if (!isGapiReady) {
        console.warn("GAPI not ready, cannot sign in.");
        setDriveSyncStatusMessageKey("driveStatusFailedInit");
        setCalendarSyncStatusMessageKey("calendarStatusFailedInit");
        return;
    }
    try {
      await signInToGoogle();
    } catch (error) {
      console.error("Google Sign-In error:", error);
      setDriveSyncStatusMessageKey("driveStatusSignInFailed");
      setCalendarSyncStatusMessageKey("calendarStatusSignInFailed");
    }
  }, [isGapiReady]);

  const handleSignOutGoogle = useCallback(() => {
    if (!isGapiReady) return;
    signOutFromGoogle();
  }, [isGapiReady]);

  const handleToggleDriveBackup = useCallback((enable: boolean) => {
    setIsDriveBackupEnabled(enable);
    if (enable && !isGoogleAuthenticated) {
        setDriveSyncStatusMessageKey("driveStatusConnectToEnable");
    } else if (enable && isGoogleAuthenticated) {
        setDriveSyncStatusMessageKey("driveStatusBackupEnabledManual");
        setConfirmationModal({
            isOpen: true, titleKey: "googleDriveBackup", messageKey: "driveStatusBackupEnabledFirstTime",
            onConfirm: () => setConfirmationModal(null), confirmTextKey: "ok",
        });
    } else {
        setDriveSyncStatusMessageKey("driveStatusBackupDisabled");
    }
  }, [isGoogleAuthenticated]);

  const performBackupToDrive = useCallback(async () => {
    if (!isGoogleAuthenticated || !isDriveBackupEnabled || !isGapiReady) {
      setDriveSyncStatusMessageKey(isGapiReady ? "driveStatusConnectToEnable" : "driveStatusFailedInit"); return;
    }
    setDriveSyncStatusMessageKey("driveStatusBackupInProgress");
    const backupData: AppBackupData = {
      version: APP_VERSION, timestamp: Date.now(), tasks: allTasks, projects: projects, // events removed
      pomodoroSettings: pomodoroSettings, dailyGoalHours: dailyGoalHours, language: language,
      isCalendarSyncEnabled: isCalendarSyncEnabled, timekeeperCalendarId: timekeeperCalendarId,
      selectedThemeId: selectedThemeId, unlockedThemeIds: unlockedThemeIds, // Added theme data
    };
    try {
      const result = await uploadToDrive(JSON.stringify(backupData));
      if (result.success) {
        setDriveSyncStatusMessageKey("driveStatusBackupSuccess");
        setDriveSyncStatusMessageParams({time: new Date().toLocaleTimeString()});
      } else {
        setDriveSyncStatusMessageKey("driveStatusBackupFailed");
        setDriveSyncStatusMessageParams({message: result.message || "Unknown error"});
      }
    } catch (error) {
      setDriveSyncStatusMessageKey("driveStatusBackupFailedConsole");
    }
  }, [allTasks, projects, pomodoroSettings, dailyGoalHours, language, isGoogleAuthenticated, isDriveBackupEnabled, isCalendarSyncEnabled, timekeeperCalendarId, selectedThemeId, unlockedThemeIds, isGapiReady]);

  const performRestoreFromDrive = useCallback(async () => {
    if (!isGoogleAuthenticated || !isGapiReady) {
      setDriveSyncStatusMessageKey(isGapiReady ? "driveStatusConnectToEnable" : "driveStatusFailedInit"); return;
    }
    setDriveSyncStatusMessageKey("driveStatusRestoreInProgress");
    try {
      const backupJson = await downloadFromDrive();
      if (backupJson) {
        const backupData = JSON.parse(backupJson) as AppBackupData;
        setConfirmationModal({
          isOpen: true, titleKey: "driveStatusRestoreConfirmTitle", messageKey: "driveStatusRestoreConfirmMessage",
          messageParams: { timestamp: new Date(backupData.timestamp).toLocaleString() },
          confirmTextKey: "driveStatusRestoreConfirmAction",
          onConfirm: () => {
            setAllTasks(backupData.tasks || []);
            setProjects(backupData.projects || []);
            // setAllEvents(backupData.events || []); // Removed
            setPomodoroSettings(backupData.pomodoroSettings || DEFAULT_POMODORO_SETTINGS);
            setDailyGoalHours(backupData.dailyGoalHours || DEFAULT_DAILY_GOAL_HOURS);
            if (backupData.language) setLanguage(backupData.language);
            setIsCalendarSyncEnabled(backupData.isCalendarSyncEnabled || false);
            setTimekeeperCalendarId(backupData.timekeeperCalendarId || null);
            setSelectedThemeId(backupData.selectedThemeId || DEFAULT_THEME_ID);
            setUnlockedThemeIds(backupData.unlockedThemeIds || AVAILABLE_THEMES.filter(t => t.isDefault).map(t => t.id));
            setDriveSyncStatusMessageKey("driveStatusRestoreSuccess");
            setDriveSyncStatusMessageParams({date: new Date(backupData.timestamp).toLocaleDateString()});
            setConfirmationModal(null);
            if (backupData.isCalendarSyncEnabled && isGoogleUserSignedIn()) {
                ensureTimekeeperCalendarExists();
            }
            // Apply restored theme
            applyTheme(backupData.selectedThemeId || DEFAULT_THEME_ID);
          },
        });
      } else {
        setDriveSyncStatusMessageKey("driveStatusRestoreNotFound");
      }
    } catch (error) {
      setDriveSyncStatusMessageKey("driveStatusRestoreFailed");
    }
  }, [isGoogleAuthenticated, setLanguage, ensureTimekeeperCalendarExists, applyTheme, isGapiReady]);

  const handleToggleCalendarSync = useCallback((enable: boolean) => {
    setIsCalendarSyncEnabled(enable);
    if (enable && !isGoogleAuthenticated) {
        setCalendarSyncStatusMessageKey("calendarStatusConnectToEnable");
    } else if (enable && isGoogleAuthenticated && isGapiReady) {
        ensureTimekeeperCalendarExists();
    } else if (!enable) {
        setCalendarSyncStatusMessageKey("calendarStatusSyncDisabled");
    } else if (enable && isGoogleAuthenticated && !isGapiReady) {
        setCalendarSyncStatusMessageKey("calendarStatusFailedInit");
    }
  }, [isGoogleAuthenticated, ensureTimekeeperCalendarExists, isGapiReady]);

  const handleSelectTheme = useCallback((themeId: string) => {
    if (unlockedThemeIds.includes(themeId)) {
      setSelectedThemeId(themeId);
    }
  }, [unlockedThemeIds]);


  const renderDashboard = () => {
    const today = getTodayDateString();
    const todaysTrackedTasks = allTasks.filter(t => t.date === today).sort((a,b) => a.startTimeEpoch - b.startTimeEpoch);
    const totalSecondsToday = todaysTrackedTasks.reduce((sum, t) => sum + t.durationSeconds, 0);
    const getTaskDotHexColor = (task: Task, index: number): string => {
      if (task.projectId) { const p = projects.find(pr => pr.id === task.projectId); return p?.color || DEFAULT_TASK_COLOR; }
      return TASK_COLORS_PALETTE[index % TASK_COLORS_PALETTE.length] || DEFAULT_TASK_COLOR;
    };
    const goalStatusKey = dailyGoalHours * 3600 > totalSecondsToday ? "goalToGo" : "goalAchieved";
    const remainingTimeForGoal = Math.max(0, dailyGoalHours * 3600 - totalSecondsToday);

    return (
      <>
        <section className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)]"
             dangerouslySetInnerHTML={{ __html: t('dailyOverviewTitle') }} />
          <p className="text-[var(--color-text-secondary)] mt-2 text-base md:text-lg">{t('dailyOverviewSubtitle')}</p>
        </section>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <section className="p-6 bg-[var(--color-bg-secondary)] rounded-xl shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4 text-left">{t('dailyOverviewCardTitle')}</h3>
              <div className="flex items-center space-x-5">
                <DailyOverviewChart todaysTasks={todaysTrackedTasks} projects={projects} totalSecondsToday={totalSecondsToday} dailyGoalHours={dailyGoalHours} />
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)]">{formatDurationToHumanReadable(totalSecondsToday)}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">{t('tracked')}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-4 text-left">
                {t('dailyGoal', {goalHours: dailyGoalHours, remainingTime: formatDurationToHumanReadable(remainingTimeForGoal), status: t(goalStatusKey)})}
            </p>
          </section>
          <section className="p-6 bg-[var(--color-bg-secondary)] rounded-xl shadow-lg flex flex-col">
            <h3 className="text-sm text-[var(--color-text-secondary)] uppercase font-semibold mb-4">{t('todaysTasks')}</h3>
            {todaysTrackedTasks.length > 0 ? (
              <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 flex-grow">{todaysTrackedTasks.map((task, idx) => (
                  <li key={task.id} className="flex items-center justify-between py-2.5 border-b border-[var(--color-border-primary)] last:border-b-0">
                    <div className="flex items-center min-w-0"><span className="w-3 h-3 rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: getTaskDotHexColor(task, idx) }}></span><span className="text-sm text-[var(--color-text-primary)] font-medium truncate" title={task.description}>{task.description}</span></div>
                    <span className="text-sm text-[var(--color-text-muted)] font-medium ml-2 whitespace-nowrap">{formatDurationToHumanReadable(task.durationSeconds)}</span>
                  </li>))}</ul>
            ) : (<p className="text-sm text-[var(--color-text-muted)] text-center py-4 flex-grow flex items-center justify-center">{t('noTasksToday')}</p>)}
          </section>
        </div>

        <section className="mt-12 text-center">
          <button
            onClick={() => handleNavigation('tracking')}
            className="inline-flex items-center justify-center px-8 py-4 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary-hover)] text-[var(--color-accent-text-primary)] text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all space-x-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-primary)]"
            aria-label={t('startNewTimer')}
          >
            <PlayIcon className="w-6 h-6" />
            <span>{t('startNewTimer')}</span>
          </button>
        </section>
      </>
    );
  }

  const pomodoroTotalSecondsForFocus =
    currentPomodoroPhase === PPhase.FOCUS ? pomodoroSettings.focusDurationMinutes * 60 :
    currentPomodoroPhase === PPhase.SHORT_BREAK ? pomodoroSettings.shortBreakDurationMinutes * 60 :
    currentPomodoroPhase === PPhase.LONG_BREAK ? pomodoroSettings.longBreakDurationMinutes * 60 : 0;

  const activeTimerInfoForFocus = manualTimerData
    ? { mode: TMode.MANUAL, elapsedSeconds: manualTimerData.elapsedSeconds, totalSecondsInPhase: 0 }
    : currentPomodoroPhase !== PPhase.IDLE
      ? {
          mode: TMode.POMODORO,
          elapsedSeconds: pomodoroTimerElapsedSeconds,
          totalSecondsInPhase: pomodoroTotalSecondsForFocus,
          phase: currentPomodoroPhase
        }
      : null;

  return (
    <div ref={appContainerRef} className={`min-h-dvh font-['Inter',_sans-serif] flex flex-col md:flex-row bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]`}>
      {!isFocusModeActive && (
        <>
          <SidebarNav
            currentView={currentView}
            onNavigate={handleNavigation}
            activeTimerInfo={getActiveTimerInfo()}
          />
          <TopNavBar
            currentView={currentView}
            onNavigate={handleNavigation}
            activeTimerInfo={getActiveTimerInfo()}
          />
        </>
      )}

      {isFocusModeActive && activeTimerInfoForFocus ? (
        <FocusModeDisplay
          mode={activeTimerInfoForFocus.mode}
          elapsedSeconds={activeTimerInfoForFocus.elapsedSeconds}
          totalSecondsInPhase={activeTimerInfoForFocus.totalSecondsInPhase}
          onExitFocusMode={exitFocusMode}
        />
      ) : (
        <main className="flex-1 pt-16 md:pt-0 md:pl-64 flex flex-col overflow-y-auto">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
             <div className="bg-[var(--color-bg-secondary)] shadow-xl rounded-lg p-6 md:p-8 h-full">
                {currentView === 'dashboard' && renderDashboard()}
                {currentView === 'tracking' && (
                  <>
                    {!manualTimerData && currentPomodoroPhase === PPhase.IDLE && (
                      <TimerStarterView
                        projects={projects}
                        onStartManual={startManualTimer}
                        onStartPomodoro={startInitialPomodoroFocus}
                      />
                    )}
                    {manualTimerData && (
                      <TimerActiveView
                        projects={projects}
                        timerData={manualTimerData}
                        onDescriptionChange={updateManualTimerDescription}
                        onProjectIdChange={updateManualTimerProjectId}
                        onTogglePauseResume={toggleManualTimerPauseResume}
                        onStopTracking={stopManualTimer}
                        onEnterFocusMode={enterFocusMode}
                      />
                    )}
                    {currentPomodoroPhase !== PPhase.IDLE && (
                      <PomodoroHostView
                        projects={projects}
                        pomodoroSettings={pomodoroSettings}
                        currentPhase={currentPomodoroPhase}
                        elapsedSecondsInPhase={pomodoroTimerElapsedSeconds}
                        isTimerRunning={isPomodoroTimerRunning}
                        cyclesInCurrentSet={pomodoroCyclesInCurrentSet}
                        totalSessionPomodoros={totalPomodorosCompletedThisSession}
                        taskDescription={currentPomodoroTaskDescription}
                        onTaskDescriptionChange={setCurrentPomodoroTaskDescription}
                        projectId={currentPomodoroTaskProjectId}
                        onProjectIdChange={setCurrentPomodoroTaskProjectId}
                        onStartFocus={startInitialPomodoroFocus}
                        onPause={pausePomodoro}
                        onResume={resumePomodoro}
                        onStopSession={stopPomodoroSession}
                        onSkipBreak={skipPomodoroBreak}
                        onOpenSettings={() => { setIsMainPomodoroSettingsModalOpen(true); }}
                        onEnterFocusMode={enterFocusMode}
                      />
                    )}
                  </>
                )}
                {currentView === 'projects' && (
                  <ProjectsView
                    projects={projects}
                    onAddProject={handleAddProject}
                  />
                )}
                {currentView === 'tasks' && (
                  <TasksView
                    allTasks={allTasks}
                    projects={projects}
                    onOpenEditModal={handleOpenEditModal}
                  />
                )}
                {currentView === 'events' && (
                  <EventsView
                    allEvents={allEvents} // Predefined events
                    onParticipateInEvent={handleParticipateInEvent}
                  />
                )}
                {currentView === 'reports' && (
                  <ReportsView
                    allTasks={allTasks}
                    projects={projects}
                  />
                )}
                {currentView === 'settings' && (
                  <SettingsView
                    currentLanguage={language}
                    onLanguageChange={setLanguage}
                    dailyGoalHours={dailyGoalHours}
                    onUpdateDailyGoal={handleUpdateDailyGoal}
                    pomodoroSettings={pomodoroSettings}
                    onSavePomodoroSettings={handleSavePomodoroSettings}
                    gapiInitAttempted={gapiInitAttempted}
                    isGapiReady={isGapiReady}
                    isGoogleAuthenticated={isGoogleAuthenticated}
                    onSignInGoogle={handleSignInGoogle}
                    onSignOutGoogle={handleSignOutGoogle}
                    isDriveBackupEnabled={isDriveBackupEnabled}
                    driveSyncStatusMessageKey={driveSyncStatusMessageKey}
                    driveSyncStatusMessageParams={driveSyncStatusMessageParams}
                    onToggleDriveBackup={handleToggleDriveBackup}
                    onBackupToDrive={performBackupToDrive}
                    onRestoreFromDrive={performRestoreFromDrive}
                    isCalendarSyncEnabled={isCalendarSyncEnabled}
                    calendarSyncStatusMessageKey={calendarSyncStatusMessageKey}
                    calendarSyncStatusMessageParams={calendarSyncStatusMessageParams}
                    onToggleCalendarSync={handleToggleCalendarSync}
                    onManuallyCreateTimekeeperCalendar={ensureTimekeeperCalendarExists}
                    availableThemes={AVAILABLE_THEMES}
                    unlockedThemeIds={unlockedThemeIds}
                    selectedThemeId={selectedThemeId}
                    onSelectTheme={handleSelectTheme}
                  />
                )}
            </div>
          </div>
        </main>
      )}

      {isEditModalOpen && taskToEdit && (
        <EditTaskModal isOpen={isEditModalOpen} task={taskToEdit} projects={projects} onUpdateTask={handleUpdateTask} onClose={handleCloseEditModal} />
      )}
      {isMainPomodoroSettingsModalOpen && (
        <PomodoroSettingsModal
            isOpen={isMainPomodoroSettingsModalOpen}
            currentSettings={pomodoroSettings}
            onSave={handleSavePomodoroSettings}
            onClose={() => setIsMainPomodoroSettingsModalOpen(false)}
        />
      )}
      {confirmationModal?.isOpen && (
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          titleKey={confirmationModal.titleKey}
          messageKey={confirmationModal.messageKey}
          messageParams={confirmationModal.messageParams}
          confirmTextKey={confirmationModal.confirmTextKey}
          onConfirm={confirmationModal.onConfirm}
          onClose={() => setConfirmationModal(null)}
        />
      )}
    </div>
  );
};

export default App;
