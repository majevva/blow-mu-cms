import React from 'react';

import { AccountState } from '@/api/types';
import useBaseTranslation from '@/hooks/use-base-translation';

import Typography from '@/components/Typography/Typography';
import Button from '@/components/Button/Button';

export type ManagedAccountFormValues = {
  loginName: string;
  email: string;
  securityCode: string;
  state: AccountState;
  password: string;
  nextPassword: string;
  vaultPassword: string;
  vaultExtended: boolean;
};

type ManagedAccountFormProps = {
  mode: 'create' | 'edit';
  isLoading: boolean;
  isSubmitting: boolean;
  values: ManagedAccountFormValues;
  onChange: (
    field: keyof ManagedAccountFormValues,
    value: string | boolean | AccountState,
  ) => void;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const CREATE_STATES = [
  AccountState.NORMAL,
  AccountState.GAME_MASTER,
  AccountState.GAME_MASTER_INVISIBLE,
  AccountState.SPECTATOR,
  AccountState.BANNED,
  AccountState.TEMPORARILY_BANNED,
  AccountState.SUPER_ADMIN,
];

const ManagedAccountForm: React.FC<ManagedAccountFormProps> = ({
  mode,
  isLoading,
  isSubmitting,
  values,
  onChange,
  onCancel,
  onSubmit,
}) => {
  const { t } = useBaseTranslation('admin');
  const isCreate = mode === 'create';

  return (
    <div className="rounded-lg border border-neutral-200 bg-white/70 p-5 dark:border-neutral-800/40 dark:bg-neutral-950/30">
      <Typography
        component="h3"
        variant="h3-inter"
        styles="text-neutral-900 dark:text-neutral-100"
      >
        {isCreate ? t('managedAccountCreateTitle') : t('managedAccountEditTitle')}
      </Typography>
      <Typography
        component="p"
        variant="body2-r"
        styles="mt-2 text-neutral-600 dark:text-neutral-300"
      >
        {isCreate
          ? t('managedAccountCreateDescription')
          : t('managedAccountEditDescription')}
      </Typography>

      <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit}>
        <label className="flex flex-col gap-2">
          <Typography
            component="span"
            variant="label2-r"
            styles="text-neutral-800 dark:text-neutral-200"
          >
            {t('managedAccountFields.loginName')}
          </Typography>
          <input
            className="h-10 rounded-[4px] border border-neutral-300 bg-white px-3 font-inter text-[14px] text-neutral-900 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
            value={values.loginName}
            onChange={(e) => onChange('loginName', e.target.value)}
            disabled={!isCreate || isLoading || isSubmitting}
          />
        </label>

        <label className="flex flex-col gap-2">
          <Typography
            component="span"
            variant="label2-r"
            styles="text-neutral-800 dark:text-neutral-200"
          >
            {t('managedAccountFields.email')}
          </Typography>
          <input
            className="h-10 rounded-[4px] border border-neutral-300 bg-white px-3 font-inter text-[14px] text-neutral-900 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
            value={values.email}
            onChange={(e) => onChange('email', e.target.value)}
            disabled={isLoading || isSubmitting}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <Typography
              component="span"
              variant="label2-r"
              styles="text-neutral-800 dark:text-neutral-200"
            >
              {t('managedAccountFields.securityCode')}
            </Typography>
            <input
              className="h-10 rounded-[4px] border border-neutral-300 bg-white px-3 font-inter text-[14px] text-neutral-900 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
              value={values.securityCode}
              onChange={(e) => onChange('securityCode', e.target.value)}
              disabled={isLoading || isSubmitting}
            />
          </label>

          <label className="flex flex-col gap-2">
            <Typography
              component="span"
              variant="label2-r"
              styles="text-neutral-800 dark:text-neutral-200"
            >
              {t('managedAccountFields.state')}
            </Typography>
            <select
              className="h-10 rounded-[4px] border border-neutral-300 bg-white px-3 font-inter text-[14px] text-neutral-900 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
              value={values.state}
              onChange={(e) => onChange('state', e.target.value as AccountState)}
              disabled={isLoading || isSubmitting}
            >
              {CREATE_STATES.map((state) => (
                <option key={state} value={state}>
                  {t(`states.${state}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isCreate ? (
          <label className="flex flex-col gap-2">
            <Typography
              component="span"
              variant="label2-r"
              styles="text-neutral-800 dark:text-neutral-200"
            >
              {t('managedAccountFields.password')}
            </Typography>
            <input
              className="h-10 rounded-[4px] border border-neutral-300 bg-white px-3 font-inter text-[14px] text-neutral-900 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
              type="password"
              value={values.password}
              onChange={(e) => onChange('password', e.target.value)}
              disabled={isLoading || isSubmitting}
            />
          </label>
        ) : (
          <>
            <label className="flex flex-col gap-2">
              <Typography
                component="span"
                variant="label2-r"
                styles="text-neutral-800 dark:text-neutral-200"
              >
                {t('managedAccountFields.nextPassword')}
              </Typography>
              <input
                className="h-10 rounded-[4px] border border-neutral-300 bg-white px-3 font-inter text-[14px] text-neutral-900 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
                type="password"
                value={values.nextPassword}
                onChange={(e) => onChange('nextPassword', e.target.value)}
                disabled={isLoading || isSubmitting}
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <Typography
                  component="span"
                  variant="label2-r"
                  styles="text-neutral-800 dark:text-neutral-200"
                >
                  {t('managedAccountFields.vaultPassword')}
                </Typography>
                <input
                  className="h-10 rounded-[4px] border border-neutral-300 bg-white px-3 font-inter text-[14px] text-neutral-900 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-100"
                  value={values.vaultPassword}
                  onChange={(e) => onChange('vaultPassword', e.target.value)}
                  disabled={isLoading || isSubmitting}
                />
              </label>

              <label className="flex items-center gap-3 pt-8">
                <input
                  type="checkbox"
                  checked={values.vaultExtended}
                  onChange={(e) => onChange('vaultExtended', e.target.checked)}
                  disabled={isLoading || isSubmitting}
                />
                <Typography
                  component="span"
                  variant="label2-r"
                  styles="text-neutral-800 dark:text-neutral-200"
                >
                  {t('managedAccountFields.vaultExtended')}
                </Typography>
              </label>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('managedAccountCancel')}
          </Button>
          <Button type="submit" disabled={isLoading || isSubmitting}>
            {isSubmitting
              ? t('managedAccountSaving')
              : isCreate
                ? t('managedAccountCreateButton')
                : t('managedAccountSaveButton')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ManagedAccountForm;
