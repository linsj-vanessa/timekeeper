import React, { useState, useEffect } from 'react';
import type { Task, Project } from '../types';
import CloseIcon from './icons/CloseIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  projects: Project[];
  onUpdateTask: (updatedTaskData: {
    id: string;
    description: string;
    durationSeconds: number;
    projectId?: string;
  }) => void;
  onClose: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, task, projects, onUpdateTask, onClose }) => {
  const { t } = useLanguage();
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [hours, setHours] = useState<string>('0');
  const [minutes, setMinutes] = useState<string>('0');
  const [seconds, setSeconds] = useState<string>('0');

  useEffect(() => {
    if (task && isOpen) {
      setDescription(task.description);
      setSelectedProjectId(task.projectId);

      const totalSeconds = task.durationSeconds;
      setHours(Math.floor(totalSeconds / 3600).toString());
      setMinutes(Math.floor((totalSeconds % 3600) / 60).toString());
      setSeconds((totalSeconds % 60).toString());
    } else if (!isOpen) {
      setDescription('');
      setSelectedProjectId(undefined);
      setHours('0');
      setMinutes('0');
      setSeconds('0');
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;
    const s = parseInt(seconds, 10) || 0;
    const totalDurationSeconds = (h * 3600) + (m * 60) + s;

    onUpdateTask({
      id: task.id,
      description: description.trim() || t("untitledTask"),
      durationSeconds: totalDurationSeconds,
      projectId: selectedProjectId,
    });
  };

  const inputBaseClass = "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-700";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="edit-task-modal-title">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 id="edit-task-modal-title" className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t('editTask')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" aria-label={t('close')}>
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="editTaskDescription" className={labelClass}>{t('tableColTask')}</label>
            <input
              type="text"
              id="editTaskDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputBaseClass}
            />
          </div>

          <div>
            <label className={labelClass}>{t('tableColDuration')}</label>
            <div className="flex space-x-2">
              <div>
                <label htmlFor="editTaskHours" className="sr-only">Hours</label>
                <input type="number" id="editTaskHours" value={hours} onChange={(e) => setHours(e.target.value)} min="0" className={`${inputBaseClass} text-center`} placeholder="HH" aria-label="Hours"/>
              </div>
              <span className="pt-2 text-slate-700 dark:text-slate-300">:</span>
              <div>
                <label htmlFor="editTaskMinutes" className="sr-only">Minutes</label>
                <input type="number" id="editTaskMinutes" value={minutes} onChange={(e) => setMinutes(e.target.value)} min="0" max="59" className={`${inputBaseClass} text-center`} placeholder="MM" aria-label="Minutes"/>
              </div>
              <span className="pt-2 text-slate-700 dark:text-slate-300">:</span>
              <div>
                <label htmlFor="editTaskSeconds" className="sr-only">Seconds</label>
                <input type="number" id="editTaskSeconds" value={seconds} onChange={(e) => setSeconds(e.target.value)} min="0" max="59" className={`${inputBaseClass} text-center`} placeholder="SS" aria-label="Seconds"/>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="editTaskProject" className={labelClass}>{t('tableColProject')}</label>
            <select
              id="editTaskProject"
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value || undefined)}
              className={`${inputBaseClass} cursor-pointer`}
            >
              <option value="">{t('noProjectOptional')}</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;