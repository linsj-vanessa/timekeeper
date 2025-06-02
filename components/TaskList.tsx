import React from 'react';
import { Task, Project } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { PHASE_DESCRIPTIONS_KEYS } from '../constants';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks, projects }) => {
  const { t, formatTime } = useLanguage();
  const today = new Date().toISOString().split('T')[0];
  const tasksToday = tasks.filter(task => task.date === today);
  const totalTimeTodaySeconds = tasksToday.reduce((sum, task) => sum + task.durationSeconds, 0);
  
  const totalPomodorosToday = tasksToday
    .filter(task => task.isPomodoro && task.pomodoroCycleCount > 0)
    .length; 


  const getProjectById = (projectId?: string): Project | undefined => {
    return projects.find(p => p.id === projectId);
  };

  if (tasks.length === 0) {
    return (
      <div className="mt-10 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg text-center text-slate-500 dark:text-slate-400">
        {t('noTasksTracked')}
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-5">{t('taskHistory')}</h2>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl shadow-md">
        <h3 className="text-md font-semibold text-blue-700 dark:text-blue-300">{t('todaysSummary')}</h3>
        <p className="text-blue-600 dark:text-blue-400 text-sm">{t('totalTime')}: <span className="font-bold">{formatTime(totalTimeTodaySeconds)}</span></p>
        <p className="text-blue-600 dark:text-blue-400 text-sm">{t('pomodorosCompleted')}: <span className="font-bold">{totalPomodorosToday}</span></p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full min-w-max text-left">
          <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
            <tr>
              <th className="p-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('tableColTask')}</th>
              <th className="p-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('tableColProject')}</th>
              <th className="p-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('tableColDuration')}</th>
              <th className="p-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('tableColDate')}</th>
              <th className="p-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('tableColType')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {tasks.slice().reverse().map((task) => {
              const project = getProjectById(task.projectId);
              return (
                <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-3.5 text-sm text-slate-700 dark:text-slate-300 font-medium">{task.description || (task.isPomodoro && task.pomodoroCycleCount > 0 ? t(PHASE_DESCRIPTIONS_KEYS.FOCUS) : t('untitledTask'))}</td>
                  <td className="p-3.5 text-sm text-slate-600 dark:text-slate-400">
                    {project ? (
                      <span className="flex items-center">
                        <span 
                          className={`w-2.5 h-2.5 rounded-full inline-block mr-2 flex-shrink-0`}
                          style={{ backgroundColor: project.color }}
                        ></span>
                        {project.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic text-xs">{t('noProject')}</span>
                    )}
                  </td>
                  <td className="p-3.5 text-sm text-slate-600 dark:text-slate-400 font-mono">{formatTime(task.durationSeconds)}</td>
                  <td className="p-3.5 text-xs text-slate-500 dark:text-slate-400">{task.date}</td>
                  <td className="p-3.5 text-sm">
                    {task.isPomodoro 
                      ? <span className="px-2 py-0.5 text-xs font-semibold text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-700/30 rounded-full">{t('taskTypePomodoro')} {task.pomodoroCycleCount > 0 ? t('pomodoroCycleCountLabel', {count: task.pomodoroCycleCount}) : ''}</span>
                      : <span className="px-2 py-0.5 text-xs font-semibold text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-700/30 rounded-full">{t('taskTypeManual')}</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {tasks.length === 0 && (
            <p className="p-4 text-center text-slate-400 dark:text-slate-500">{t('noTasksTracked')}</p>
        )}
      </div>
    </div>
  );
};

export default TaskList;