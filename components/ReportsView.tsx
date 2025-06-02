

import React from 'react';
import type { Task, Project } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import BarChartIcon from './icons/BarChartIcon'; // For title
import { formatDurationToHumanReadable } from '../utils/formatTime'; // For human-readable total time


interface ReportsViewProps {
  allTasks: Task[];
  projects: Project[];
  // Props onAddProject and onOpenEditModal are removed as this view no longer handles those
}

// Define a local interface for icon props to help with React.cloneElement typing
interface ReportIconProps {
  className?: string;
}

const ReportsView: React.FC<ReportsViewProps> = ({ 
  allTasks, 
  projects, 
}) => {
  const { t } = useLanguage();

  const totalTrackedSeconds = allTasks.reduce((sum, task) => sum + task.durationSeconds, 0);
  const totalPomodorosCompleted = allTasks.filter(task => task.isPomodoro && task.pomodoroCycleCount > 0).length;
  const totalProjects = projects.length;
  const totalTasksLogged = allTasks.length;

  const StatCard: React.FC<{ titleKey: string; value: string | number; icon?: React.ReactElement<ReportIconProps> }> = ({ titleKey, value, icon }) => (
    <div className="bg-slate-100 dark:bg-slate-700/70 p-4 rounded-lg shadow-md flex items-center space-x-3">
      {icon && React.cloneElement(icon, { className: "w-8 h-8 text-blue-500 dark:text-blue-400 flex-shrink-0" })}
      <div>
        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{t(titleKey)}</dt>
        <dd className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">{value}</dd>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col space-y-8 max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
        <BarChartIcon className="w-7 h-7 sm:w-8 sm:h-8 mr-3 text-indigo-600 dark:text-indigo-400" />
        {t('reportsSummaryTitle')}
      </h1>
      
      <section>
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <StatCard titleKey="totalTimeTracked" value={formatDurationToHumanReadable(totalTrackedSeconds)} icon={<BarChartIcon />} />
          <StatCard titleKey="totalPomodorosCompleted" value={totalPomodorosCompleted} icon={<BarChartIcon />} /> 
          <StatCard titleKey="totalProjectsCreated" value={totalProjects} icon={<FolderIcon />} />
          <StatCard titleKey="totalTasksLogged" value={totalTasksLogged} icon={<ClipboardDocumentListIcon />} />
        </dl>
      </section>

      {allTasks.length === 0 && (
         <div className="text-center py-10 px-6 bg-white dark:bg-slate-800/70 rounded-xl shadow-lg mt-6">
            <BarChartIcon className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-3" />
            <p className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('noDataForReportTitle')}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noDataForReportBody')}</p>
        </div>
      )}
       {/* Placeholder for future charts or more detailed reports */}
       <div className="mt-8 p-6 bg-white dark:bg-slate-800/70 rounded-xl shadow-lg text-center">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{t('moreReportsComingSoonTitle')}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('moreReportsComingSoonBody')}</p>
      </div>
    </div>
  );
};

// Helper icons that might be used in StatCard (ensure they accept className)
const FolderIcon: React.FC<ReportIconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

const ClipboardDocumentListIcon: React.FC<ReportIconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25m0 0H6.375a2.25 2.25 0 01-2.25-2.25V6.108c0-1.135.845-2.098 1.976-2.192a48.424 48.424 0 011.123-.08m5.801 0c.065.21.1.433.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664M6.375 8.25H8.25m0 0V6.108c0-1.135.845-2.098 1.976-2.192a48.424 48.424 0 011.123-.08m5.801 0c.065.21.1.433.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m0 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m0 0M12.75 5.25h-.375a2.25 2.25 0 00-2.25 2.25v1.5m0 0H15m0 0v2.25m0 0h1.5m0 0H18a.75.75 0 00.75-.75v-2.25m-7.5 0A2.25 2.25 0 005.25 7.5V5.25m14.25 0A2.25 2.25 0 0018 3h-2.25m-7.5 0V3M3.75 6A2.25 2.25 0 016 3.75h2.25m12.75 0h2.25A2.25 2.25 0 0121.75 6v2.25m0 0A2.25 2.25 0 0119.5 10.5M18 10.5V12m0 0V13.5m0 0V15m0 0V16.5m0 0V18m0 0V19.5m0 0V21.75a.75.75 0 001.5 0V19.5m-15-3.75a.75.75 0 00-1.5 0V18m0 0V19.5m0 0V21m0 0V22.5m-1.5-3.75a.75.75 0 00-1.5 0V18m0 0V19.5m0 0V21m0 0V22.5m7.5-12.75a.75.75 0 00-1.5 0V12m0 0V13.5m0 0V15m0 0V16.5m0 0V18m0 0V19.5m0 0V21m0 0V22.5" />
  </svg>
);


export default ReportsView;