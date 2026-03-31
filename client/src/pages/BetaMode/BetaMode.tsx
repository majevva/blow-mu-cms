import React from 'react';

import { useGetBetaSocialLinks } from '@/api/game-server';
import useBaseTranslation from '@/hooks/use-base-translation';

import LoginForm from '@/components/LoginForm/LoginForm';
import Typography from '@/components/Typography/Typography';

const BetaModePage: React.FC = () => {
  const { t } = useBaseTranslation('betaMode');
  const { data: socialLinks } = useGetBetaSocialLinks();
  const linkItems = [
    { href: socialLinks?.discordUrl, label: t('discordCta') },
    { href: socialLinks?.instagramUrl, label: t('instagramCta') },
    { href: socialLinks?.facebookUrl, label: t('facebookCta') },
    { href: socialLinks?.youtubeUrl, label: t('youtubeCta') },
  ].filter((item) => Boolean(item.href));

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-neutral-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(232,166,42,0.22),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(162,89,34,0.18),_transparent_32%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400 to-transparent opacity-70" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,420px)] lg:items-center">
          <section className="rounded-2xl border border-primary-500/20 bg-neutral-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur">
            <Typography
              component="span"
              variant="label1-b"
              styles="mb-4 inline-flex rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-primary-300"
            >
              {t('eyebrow')}
            </Typography>
            <Typography variant="display-2" styles="max-w-3xl text-white">
              {t('title')}
            </Typography>
            <Typography
              variant="body1-r"
              styles="mt-4 max-w-2xl text-neutral-300"
            >
              {t('description')}
            </Typography>
            <Typography variant="body2-m" styles="mt-6 text-primary-200">
              {t('staffHint')}
            </Typography>
            {linkItems.length > 0 ? (
              <div className="mt-8 flex flex-wrap gap-4">
                {linkItems.map((item, index) => (
                  <a
                    key={`${item.label}:${index}`}
                    className="inline-flex min-h-11 items-center rounded-md border border-primary-400/40 px-5 font-inter text-[14px] font-semibold text-primary-200 transition-colors duration-150 hover:border-primary-300 hover:text-primary-100"
                    href={item.href as string}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ) : null}
          </section>

          <aside className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-2xl shadow-black/30">
            <Typography variant="h3" styles="text-white">
              {t('loginCardTitle')}
            </Typography>
            <Typography variant="body2-r" styles="mt-3 mb-6 text-neutral-400">
              {t('loginCardDescription')}
            </Typography>
            <LoginForm />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BetaModePage;
