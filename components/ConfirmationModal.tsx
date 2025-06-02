import React from 'react';
import CloseIcon from './icons/CloseIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  titleKey: string;
  messageKey: string;
  messageParams?: Record<string, string | number>;
  confirmTextKey?: string;
  cancelTextKey?: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmButtonClass?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  titleKey,
  messageKey,
  messageParams,
  confirmTextKey = "confirm",
  cancelTextKey = "cancel",
  onConfirm,
  onClose,
  confirmButtonClass = "bg-red-600 hover:bg-red-700",
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="confirmation-modal-title"
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 id="confirmation-modal-title" className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {t(titleKey)}
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" 
            aria-label={t('close')}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-300">{t(messageKey, messageParams)}</p>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-700 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-500 transition-colors"
          >
            {t(cancelTextKey)}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${confirmButtonClass}`}
          >
            {t(confirmTextKey)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;