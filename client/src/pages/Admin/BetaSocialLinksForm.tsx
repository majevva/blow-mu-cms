import React from 'react';

import Button from '@/components/Button/Button';
import Checkbox from '@/components/Checkbox/Checkbox';
import Typography from '@/components/Typography/Typography';
import useBaseTranslation from '@/hooks/use-base-translation';

export type BetaSocialLinksFormValues = {
  enabled: boolean;
  instagramUrl: string;
  discordUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
};

type BetaSocialLinksFormProps = {
  values: BetaSocialLinksFormValues;
  isLoading: boolean;
  isSubmitting: boolean;
  onChange: (
    field: keyof BetaSocialLinksFormValues,
    value: string | boolean,
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const SOCIAL_FIELDS: Array<{
  field: keyof BetaSocialLinksFormValues;
  placeholder: string;
}> = [
  { field: 'instagramUrl', placeholder: 'https://instagram.com/blowmu' },
  { field: 'discordUrl', placeholder: 'https://discord.gg/blowmu' },
  { field: 'facebookUrl', placeholder: 'https://facebook.com/blowmu' },
  { field: 'youtubeUrl', placeholder: 'https://youtube.com/@blowmu' },
];

const BetaSocialLinksForm: React.FC<BetaSocialLinksFormProps> = ({
  values,
  isLoading,
  isSubmitting,
  onChange,
  onSubmit,
}) => {
  const { t } = useBaseTranslation('admin');

  return (
    <div className="rounded-lg border border-neutral-200 bg-white/70 p-5 dark:border-neutral-800/40 dark:bg-neutral-950/30">
      <div className="flex flex-col gap-1">
        <Typography
          component="h2"
          variant="h3-inter"
          styles="text-neutral-900 dark:text-neutral-100"
        >
          {t('socialLinksTitle')}
        </Typography>
        <Typography
          component="p"
          variant="body2-r"
          styles="text-neutral-600 dark:text-neutral-300"
        >
          {t('socialLinksDescription')}
        </Typography>
      </div>

      <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="md:col-span-2">
          <Checkbox
            checked={values.enabled}
            disabled={isLoading || isSubmitting}
            label={t('socialLinksFields.enabled')}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onChange('enabled', event.target.checked)
            }
          />
        </div>
        {SOCIAL_FIELDS.map(({ field, placeholder }) => (
          <label key={field} className="flex flex-col gap-2">
            <Typography
              component="span"
              variant="label2-r"
              styles="text-neutral-800 dark:text-neutral-200"
            >
              {t(`socialLinksFields.${field}`)}
            </Typography>
            <input
              className="rounded-[4px] border border-neutral-300 bg-white p-2 font-inter text-[14px] text-neutral-900 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
              disabled={isLoading || isSubmitting}
              placeholder={placeholder}
              value={values[field] as string}
              onChange={(event) => onChange(field, event.target.value)}
            />
          </label>
        ))}

        <div className="flex justify-end md:col-span-2">
          <Button type="submit" disabled={isLoading || isSubmitting}>
            {isSubmitting ? t('socialLinksSaving') : t('socialLinksSaveButton')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BetaSocialLinksForm;
