import React from 'react';
import { useTranslation } from 'react-i18next';

import { useGetBanners } from '@/api/banners';
import { Banner } from '@/api/types';

import ImageSlider from '@/components/ImageSlider/ImageSlider';
import TitleWithDivider from '@/components/TitleWithDivider/TitleWithDivider';
import EventCard from './EventCard/EventCard';
import Typography from '@/components/Typography/Typography';
import NewsCardList from './NewsCard/NewsCardList';
import ChatBox from '@/components/ChatBox/ChatBox';

type HomePageProps = Record<string, never>;

const HomePage: React.FC<HomePageProps> = () => {
  const { t } = useTranslation();
  const { data: banners, isLoading } = useGetBanners();
  return (
    <>
      {isLoading ? (
        <div className="h-[200px] animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800/40 md:h-[300px]" />
      ) : (
        (banners as Banner[]).length > 0 && (
          <ImageSlider banners={banners as Banner[]} />
        )
      )}
      <TitleWithDivider>{t('home.newsTitle')}</TitleWithDivider>
      <NewsCardList />
      <TitleWithDivider>{t('home.eventsTitle')}</TitleWithDivider>
      <div className="flex flex-col gap-4 md:flex-row md:gap-8">
        <EventCard />
        <div className="flex h-96 w-full items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800/40 dark:bg-neutral-900/60 desktop:min-h-full">
          <Typography
            variant="h2"
            component="h3"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('home.soonTitleCard')}
          </Typography>
        </div>
      </div>
      <TitleWithDivider>Chat</TitleWithDivider>
      <ChatBox />
    </>
  );
};

export default HomePage;
