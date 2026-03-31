import React from 'react';

import { useTranslation } from 'react-i18next';

import Typography from '../Typography/Typography';
import YoutubeIcon from './FooterIcons/YoutubeIcon';
import DiscordIcon from './FooterIcons/DiscordIcon';
import FacebookIcon from './FooterIcons/FacebookIcon';
import InstagramIcon from './FooterIcons/InstagramIcon';

type FooterProps = Record<string, never>;

const Footer: React.FC<FooterProps> = () => {
  const { t } = useTranslation();

  return (
    <>
      <footer className="m-auto mt-16 flex max-w-[1328px] flex-col-reverse items-center gap-6 rounded-t-lg bg-neutral-100 px-14 py-12 dark:border-x dark:border-t dark:border-primary-800/20 dark:bg-neutral-900/80 md:flex-row md:justify-between md:py-12">
        <div className="flex h-28 flex-col items-center text-neutral-800 dark:text-neutral-200 md:justify-between">
          <Typography component="h1" variant="h2">
            Blow MU
          </Typography>
          <Typography variant="label2-r" styles="text-center text-neutral-600 dark:text-neutral-400">
            {t('footer.copyright1')} <br></br> {t('footer.copyright2')}
          </Typography>
          <span className="flex gap-1 font-inter text-[12px] text-neutral-600 dark:text-neutral-400">
            {t('footer.developedBy')}
            <strong className="font-semibold text-primary-600 dark:text-primary-400">Blow MU Team</strong>
          </span>
        </div>
        <div className="flex place-items-center gap-6">
          <div className="h-fit cursor-pointer rounded-md border border-primary-600/30 bg-primary-500/10 p-1.5 text-primary-600 transition-colors duration-150 hover:bg-primary-500 hover:text-white dark:border-primary-500/20 dark:text-primary-400 dark:hover:bg-primary-600 dark:hover:text-white">
            <DiscordIcon />
          </div>
          <div className="h-fit cursor-pointer rounded-md border border-primary-600/30 bg-primary-500/10 p-1.5 text-primary-600 transition-colors duration-150 hover:bg-primary-500 hover:text-white dark:border-primary-500/20 dark:text-primary-400 dark:hover:bg-primary-600 dark:hover:text-white">
            <YoutubeIcon />
          </div>
          <div className="h-fit cursor-pointer rounded-md border border-primary-600/30 bg-primary-500/10 p-1.5 text-primary-600 transition-colors duration-150 hover:bg-primary-500 hover:text-white dark:border-primary-500/20 dark:text-primary-400 dark:hover:bg-primary-600 dark:hover:text-white">
            <FacebookIcon />
          </div>
          <div className="h-fit cursor-pointer rounded-md border border-primary-600/30 bg-primary-500/10 p-1.5 text-primary-600 transition-colors duration-150 hover:bg-primary-500 hover:text-white dark:border-primary-500/20 dark:text-primary-400 dark:hover:bg-primary-600 dark:hover:text-white">
            <InstagramIcon />
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
