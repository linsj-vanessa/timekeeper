

import React, { useState } from 'react';
import type { Project } from '../types';
import { PROJECT_COLORS, ProjectColor } from '../constants'; 
import { useLanguage } from '../contexts/LanguageContext';
import FolderIcon from './icons/FolderIcon';

interface ProjectsViewProps {
  projects: Project[];
  onAddProject: (name: string, hexColor: string) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ 
  projects, 
  onAddProject, 
}) => {
  const { t } = useLanguage();
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProjectHexColor, setSelectedProjectHexColor] = useState<string>(PROJECT_COLORS[0].hexColor);

  const handleAddProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim() && selectedProjectHexColor) {
      onAddProject(newProjectName.trim(), selectedProjectHexColor);
      setNewProjectName('');
      setSelectedProjectHexColor(PROJECT_COLORS[0].hexColor);
    }
  };

  const inputBaseClass = "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-700";
  const labelBaseClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
  const sectionCardClass = "p-4 sm:p-6 bg-white dark:bg-slate-800/70 rounded-xl shadow-lg";
  const buttonClass = "px-4 py-2 text-sm font-semibold rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
        <FolderIcon className="w-7 h-7 sm:w-8 sm:h-8 mr-3 text-blue-600 dark:text-blue-400" />
        {t('projectsViewTitle')}
      </h1>
      
      <section className={sectionCardClass}>
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">{t('projectManagement')}</h2>
        <form onSubmit={handleAddProjectSubmit}>
          <div className="mb-3">
            <label htmlFor="newProjectName" className={labelBaseClass}>{t('newProjectName')}</label>
            <input
              type="text"
              id="newProjectName"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder={t('newProjectNamePlaceholder')}
              className={inputBaseClass}
              required
              aria-required="true"
            />
          </div>
          <div className="mb-4">
            <label className={labelBaseClass}>{t('projectColor')}</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((colorOption: ProjectColor) => (
                <button
                  type="button"
                  key={colorOption.hexColor}
                  onClick={() => setSelectedProjectHexColor(colorOption.hexColor)}
                  className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110
                    ${selectedProjectHexColor === colorOption.hexColor 
                      ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-800 shadow-md' 
                      : 'border-transparent hover:border-slate-400 dark:hover:border-slate-500'
                    }
                    ${colorOption.tailwindClass} 
                  `}
                  style={!colorOption.tailwindClass.startsWith('bg-') ? { backgroundColor: colorOption.hexColor } : {}}
                  aria-label={`${t('selectColor')} ${colorOption.name}`}
                  title={colorOption.name}
                >
                   {/* Optional: Add a checkmark if selected */}
                   {selectedProjectHexColor === colorOption.hexColor && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white opacity-75">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className={`${buttonClass} bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto`}
            disabled={!newProjectName.trim()}
          >
            {t('addProject')}
          </button>
        </form>
      </section>

      {projects.length > 0 && (
        <section className={sectionCardClass}>
          <h3 className="text-md sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">{t('existingProjects')}</h3>
          <ul className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {projects.map(project => (
              <li key={project.id} className="flex items-center p-3 bg-slate-100 dark:bg-slate-700/60 rounded-lg shadow-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <span 
                  className="w-4 h-4 rounded-full mr-3 flex-shrink-0 shadow-inner"
                  style={{ backgroundColor: project.color }}
                  aria-hidden="true"
                ></span>
                <span className="text-sm text-slate-800 dark:text-slate-200 font-medium flex-grow">{project.name}</span>
                 {/* Future: Add edit/delete project buttons here */}
              </li>
            ))}
          </ul>
        </section>
      )}
      {projects.length === 0 && !newProjectName && (
         <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">{t('noProjectsYet')}</p>
      )}
    </div>
  );
};

export default ProjectsView;