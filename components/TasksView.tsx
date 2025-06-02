
import React from 'react';
import type { Task, Project } from '../types';
import { DEFAULT_TASK_COLOR, PHASE_DESCRIPTIONS_KEYS } from '../constants';
import EditIcon from './icons/EditIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface TasksViewProps {
  allTasks: Task[];
  projects: Project[];
  onOpenEditModal: (task: Task) => void;
}

const TasksView: React.FC<TasksViewProps> = ({ 
  allTasks, 
  projects, 
  onOpenEditModal 
}) => {
  const { t, formatTime } = useLanguage();

  const getProjectNameById = (projectId?: string): string => {
    if (!projectId) return t('noProject');
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : t('unknownProject', {defaultValue: 'Unknown Project'});
  };
  
  const getProjectHexColorById = (projectId?: string): string => {
    if (!projectId) return DEFAULT_TASK_COLOR;
    const project = projects.find(p => p.id === projectId);
    return project ? project.color : DEFAULT_TASK_COLOR;
  };

  return (
    <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
        <ClipboardDocumentListIcon className="w-7 h-7 sm:w-8 sm:h-8 mr-3 text-green-600 dark:text-green-400" />
        {t('tasksViewTitle')}
      </h1>

      {allTasks.length > 0 ? (
        <div className="overflow-x-auto bg-white dark:bg-slate-800/70 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-700/80 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="p-3.5 font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t('tableColTask')}</th>
                <th className="p-3.5 font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t('tableColProject')}</th>
                <th className="p-3.5 font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t('tableColDuration')}</th>
                <th className="p-3.5 font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t('tableColDate')}</th>
                <th className="p-3.5 font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t('tableColType')}</th>
                <th className="p-3.5 font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-center">{t('edit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {allTasks.slice().sort((a,b) => b.startTimeEpoch - a.startTimeEpoch).map(task => (
                <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors group">
                  <td className="p-3.5 text-slate-700 dark:text-slate-200 font-medium whitespace-normal break-words max-w-xs" title={task.description}>
                    {task.description || (task.isPomodoro && task.pomodoroCycleCount > 0 ? t(PHASE_DESCRIPTIONS_KEYS.FOCUS) : t('untitledTask'))}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                     <span className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full inline-block mr-2.5 flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: getProjectHexColorById(task.projectId) }}
                        aria-hidden="true"
                      ></span>
                      {getProjectNameById(task.projectId)}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300 font-mono">{formatTime(task.durationSeconds)}</td>
                  <td className="p-3.5 text-xs text-slate-500 dark:text-slate-400">{task.date}</td>
                  <td className="p-3.5">
                    {task.isPomodoro 
                      ? <span className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800/40 rounded-full">{t('taskTypePomodoro')} {task.pomodoroCycleCount > 0 ? t('pomodoroCycleCountLabel', {count: task.pomodoroCycleCount}) : ''}</span>
                      : <span className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-800/40 rounded-full">{t('taskTypeManual')}</span>
                    }
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => onOpenEditModal(task)}
                      className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-500 p-1.5 rounded-md transition-colors group-hover:opacity-100 opacity-75"
                      aria-label={`${t('editTaskTitle')} "${task.description || t('untitledTask')}"`}
                    >
                      <EditIcon className="w-4.5 h-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 px-6 bg-white dark:bg-slate-800/70 rounded-xl shadow-lg">
            <ClipboardDocumentListIcon className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-3" />
            <p className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('noTasksYetTitle')}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noTasksTracked')}</p>
        </div>
      )}
    </div>
  );
};

export default TasksView;
