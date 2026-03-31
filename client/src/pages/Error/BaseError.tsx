import React from 'react';

import useBaseTranslation from '@/hooks/use-base-translation';

import TitleWithDivider from '@/components/TitleWithDivider/TitleWithDivider';
import Typography from '@/components/Typography/Typography';
import Link from '@/components/Link/Link';

import errorImg from '@/assets/images/error-img.png';

type BaseErrorProps = {
  errorCode: string;
  title: string;
  subtitle: string;
  showHomeLink?: boolean;
};

const BaseErrorPage: React.FC<BaseErrorProps> = ({
  errorCode,
  title,
  subtitle,
  showHomeLink = false,
}) => {
  const { t } = useBaseTranslation('error');
  return (
    <>
      <TitleWithDivider>{t('title')}</TitleWithDivider>
      <div className="flex w-full flex-col-reverse gap-2 rounded-lg border border-neutral-200 bg-white/80 p-6 dark:border-white/[0.08] dark:bg-white/[0.04] backdrop-blur-xl md:flex-row md:gap-8 md:p-12">
        <div className="flex flex-grow flex-col gap-4 text-center">
          <h2 className="font-display text-[64px] font-bold leading-[125%] bg-gradient-to-b from-primary-400 to-primary-600 bg-clip-text text-transparent dark:from-primary-300 dark:to-primary-500">
            {errorCode}
          </h2>
          <Typography
            component="h3"
            variant="h1"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {title}
          </Typography>
          <Typography variant="body-lg" styles="text-neutral-700 dark:text-neutral-300">
            {subtitle}
          </Typography>
          {showHomeLink && (
            <Link underlined={false} to="/">
              {t('homeButton')}
            </Link>
          )}
        </div>
        <img src={errorImg} className="max-w-48 self-center md:max-w-80" />
      </div>
    </>
  );
};

export default BaseErrorPage;
