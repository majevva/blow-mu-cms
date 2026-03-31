import React from 'react';

import { useTranslation } from 'react-i18next';

import List from '@/components/List/List';
import EventCountdown from './EventCountdown';

type EventCardProps = Record<string, never>;

const EventCard: React.FC<EventCardProps> = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="grid w-full items-center rounded-lg border border-neutral-200 bg-neutral-50 px-12 py-14 dark:border-neutral-800/40 dark:bg-neutral-900/60">
        <List>
          <List.Item label={t('home.eventCard.bloodCastle')} value={t('home.eventCard.soon')} />
          <List.Item label={t('home.eventCard.devilSquare')} value={t('home.eventCard.soon')} />
          <EventCountdown
            label={t('home.eventCard.chaosCastle')}
            intervalHours={1}
            openDurationMinutes={5}
          />
          <EventCountdown
            label={t('home.eventCard.goldenInvasion')}
            openDurationMinutes={5}
            startHour="00:00"
            intervalHours={4}
          />
          <EventCountdown
            label={t('home.eventCard.redInvasion')}
            openDurationMinutes={5}
            startHour="02:00"
            intervalHours={6}
          />
          <EventCountdown
            label={t('home.eventCard.happyHour')}
            openDurationMinutes={60}
            startHour="00:00"
            intervalHours={6}
          />
        </List>
      </div>
    </>
  );
};

export default EventCard;
