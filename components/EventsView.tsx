
import React from 'react';
import type { Event } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import GiftIcon from './icons/GiftIcon'; // Use GiftIcon as per constants
import { AVAILABLE_THEMES } from '../constants';

interface EventsViewProps {
  allEvents: Event[]; // These are now predefined events
  onParticipateInEvent: (eventId: string) => void;
}

const EventsView: React.FC<EventsViewProps> = ({
  allEvents,
  onParticipateInEvent,
}) => {
  const { t } = useLanguage();

  const buttonClass = "px-5 py-2.5 text-sm font-semibold rounded-lg shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-secondary)]";
  const primaryButtonClass = (color: string = 'purple') => `${buttonClass} bg-${color}-600 hover:bg-${color}-700 text-white focus:ring-${color}-500`;

  return (
    <div className="flex flex-col space-y-8 max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] flex items-center">
        <GiftIcon className="w-7 h-7 sm:w-8 sm:h-8 mr-3 text-purple-600 dark:text-purple-400" />
        {t('navEvents')} {/* Changed title to be more generic */}
      </h1>

      {/* Section for displaying predefined events */}
      <section>
        {allEvents.length > 0 ? (
          <ul className="space-y-6">
            {allEvents.map(event => {
              const EventIcon = event.icon;
              const themeToUnlock = event.themeIdToUnlock ? AVAILABLE_THEMES.find(th => th.id === event.themeIdToUnlock) : null;
              return (
                <li key={event.id} className="p-5 rounded-lg shadow-lg bg-[var(--color-bg-secondary)] border-l-4 border-purple-500">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                    <div className="flex items-center mb-2 sm:mb-0">
                      {EventIcon && <EventIcon className="w-6 h-6 mr-3 text-purple-500" />}
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{t(event.nameKey)}</h3>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] sm:ml-4">{event.date}</p>
                  </div>
                  <p className="mb-4 text-sm text-[var(--color-text-secondary)]">{t(event.descriptionKey)}</p>
                  {themeToUnlock && (
                     <p className="mb-3 text-xs italic text-purple-600 dark:text-purple-400">
                        {t('eventUnlocksThemeLabel', { themeName: t(themeToUnlock.nameKey) })}
                     </p>
                  )}
                  <button
                    onClick={() => onParticipateInEvent(event.id)}
                    className={`${primaryButtonClass('purple')} w-full sm:w-auto`}
                    aria-label={`${t('participateInEventButton')} ${t(event.nameKey)}`}
                  >
                    {t('participateInEventButton')}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-8 px-6 bg-[var(--color-bg-secondary)] rounded-xl shadow-lg">
            <GiftIcon className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-3" />
            <p className="text-md font-semibold text-[var(--color-text-primary)] mb-1">{t('noEventsAvailable')}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default EventsView;
