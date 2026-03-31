import React, { useEffect, useState } from 'react';
import {
  LoaderFunction,
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from 'react-router-dom';
import { LoaderData } from '@/types/react-router-dom';

import { FaChevronLeft } from 'react-icons/fa6';

import { useGetCharacter, useResetCharacter } from '@/api/characters';
import { CharacterDetails } from '@/api/types';
import useBaseTranslation from '@/hooks/use-base-translation';
import { getApiErrorMessage } from '@/i18n/get-api-error-message';
import { useToast } from '@/contexts/ToastContext';

import TitleWithDivider from '@/components/TitleWithDivider/TitleWithDivider';
import Button from '@/components/Button/Button';
import Typography from '@/components/Typography/Typography';
import CharacterAvatar from './CharacterAvatar';
import List from '@/components/List/List';
import Attributes from './Attributes';
import { AxiosError } from 'axios';
import GuildLogo from '@/components/GuildLogo/GuildLogo';
import Link from '@/components/Link/Link';

type CharacterPageProps = Record<string, never>;
type Params = {
  characterName: string;
};

export const loader = (async ({ params }: LoaderFunctionArgs) => {
  const typedParams = params as unknown as Params;
  return { characterName: typedParams.characterName };
}) satisfies LoaderFunction;

const CharacterPage: React.FC<CharacterPageProps> = () => {
  const navigate = useNavigate();
  const { t } = useBaseTranslation('character');
  const { openToast } = useToast();
  const { characterName } = useLoaderData() as LoaderData<typeof loader>;
  const { data: characterData, isLoading } = useGetCharacter(characterName);
  const [character, setCharacter] = useState<CharacterDetails | undefined>(
    characterData,
  );
  const resetMutation = useResetCharacter();

  const onGoBackAccount = () => navigate(-1);

  const onUpdateCharacter = (characterUpdated: CharacterDetails) => {
    setCharacter(characterUpdated);
  };

  const LEVEL_REQUIRED_TO_RESET = import.meta.env.VITE_LEVEL_REQUIRED_TO_RESET;
  const onReset = () => {
    resetMutation.mutate(characterData?.characterName as string, {
      onSuccess: (characterSuccess) => {
        onUpdateCharacter(characterSuccess);
        openToast.success(t('experience.reset.successMessage'));
      },
      onError: (error: Error) => {
        const errorAxios = error as AxiosError;
        const errorMessage = String(errorAxios.response?.data || '');

        openToast.error(getApiErrorMessage(errorMessage));
      },
    });
  };

  useEffect(() => {
    if (!isLoading) {
      setCharacter(characterData);
    }
  }, [isLoading, characterData]);

  return (
    <>
      <TitleWithDivider>{t('title')}</TitleWithDivider>
      <div className="flex w-full flex-col gap-8 rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800/40 dark:bg-neutral-900/60 md:p-12">
        {!isLoading && character && (
          <>
            <Button
              variant="ghost1"
              icon={<FaChevronLeft className="size-4" />}
              iconDirection="left"
              onClick={onGoBackAccount}
            >
              {t('backButton')}
            </Button>
            <div className="flex items-center gap-4">
              <CharacterAvatar
                characterClassName={character?.characterClassName}
              />
              <Typography
                component="h2"
                variant="h3-inter"
                styles="text-neutral-900 dark:text-neutral-100"
              >
                {characterName}
              </Typography>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-4 md:gap-12">
                <div className="flex flex-col gap-4">
                  <Typography
                    component="h3"
                    variant="h3-inter"
                    styles="text-neutral-900 dark:text-neutral-100"
                  >
                    {t('experience.title')}
                  </Typography>
                  <List>
                    <List.Item
                      label={t('experience.level')}
                      value={character?.level}
                    />
                    <List.Item
                      label={t('experience.resets')}
                      value={character?.resets}
                    />
                  </List>
                </div>
                <div className="flex w-48 flex-col gap-4">
                  <Typography
                    component="h3"
                    variant="h3-inter"
                    styles="text-neutral-900 dark:text-neutral-100"
                  >
                    {t('location.title')}
                  </Typography>
                  <List>
                    <List.Item
                      label={t('location.map')}
                      value={character?.currentMap.mapName}
                    />
                    <List.Item
                      label={t('location.coordinates')}
                      value={`${character?.currentMap.positionX} ${character?.currentMap.positionY}`}
                    />
                  </List>
                </div>
                <div className="flex flex-col gap-4">
                  <Typography
                    component="h3"
                    variant="h3-inter"
                    styles="text-neutral-900 dark:text-neutral-100"
                  >
                    {t('class')}
                  </Typography>
                  <Typography
                    variant="body1-r"
                    styles="text-neutral-900 dark:text-neutral-100"
                  >
                    {character?.characterClassName}
                  </Typography>
                </div>
                <div className="flex flex-col gap-4">
                  <Typography
                    component="h3"
                    variant="h3-inter"
                    styles="text-neutral-900 dark:text-neutral-100"
                  >
                    {t('guild.title')}
                  </Typography>
                  <Typography
                    variant="body1-r"
                    styles="text-neutral-900 dark:text-neutral-100 flex gap-2"
                  >
                    {character?.guild ? (
                      <>
                        <GuildLogo
                          base64Logo={character?.guild?.logo}
                          size={24}
                        />
                        <Link to={`/guilds/${character?.guild?.name}`}>
                          {character?.guild?.name}
                        </Link>
                      </>
                    ) : (
                      t('guild.emptyMessage')
                    )}
                  </Typography>
                </div>
              </div>
              <Button
                variant="bezel"
                disabled={character?.level != LEVEL_REQUIRED_TO_RESET}
                onClick={onReset}
              >
                {t('experience.reset.button')}
              </Button>
            </div>
            <Attributes character={character} />
          </>
        )}
      </div>
    </>
  );
};

export default CharacterPage;
