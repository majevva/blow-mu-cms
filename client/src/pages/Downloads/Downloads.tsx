import React from 'react';

import useBaseTranslation from '@/hooks/use-base-translation';

import TitleWithDivider from '@/components/TitleWithDivider/TitleWithDivider';
import Typography from '@/components/Typography/Typography';
import ImageButton from '@/components/ImageButton/ImageButton';
import Table, { Column } from '@/components/Table/Table';

import DriveLogo from '@/assets/images/logos/drive.svg';
import MegaLogo from '@/assets/images/logos/mega.svg';
import DirectXLogo from '../../assets/images/logos/directx.svg';
import VisualCppLogo from '@/assets/images/logos/visual-cpp.svg';
import DotNetLogo from '@/assets/images/logos/dotnet-framework.svg';
import VbLogo from '@/assets/images/logos/vb.svg';
import NvidiaLogo from '@/assets/images/logos/nvidia.svg';
import AMDLogo from '@/assets/images/logos/amd-radeon.svg';
import IntelGraphicsLogo from '@/assets/images/logos/intel-graphics.svg';
import IntelArcLogo from '@/assets/images/logos/intel-arc.svg';

type DownloadsPageProp = Record<string, never>;

const DownloadsPage: React.FC<DownloadsPageProp> = () => {
  const { t } = useBaseTranslation('downloads');

  const requerimentsTableColumns: Column[] = [
    {
      label: t('systemRequirementsTable.settings'),
      name: 'settings',
    },
    {
      label: t('systemRequirementsTable.minimum'),
      name: 'minimum',
    },
    {
      label: t('systemRequirementsTable.recommended'),
      name: 'recommended',
    },
  ];

  const requirementTableRows: { [key: string]: any }[] = [
    {
      settings: t('systemRequirementsTable.processor'),
      minimum: '2.2 GHz',
      recommended: '3.4 GHz',
    },
    {
      settings: t('systemRequirementsTable.memory'),
      minimum: '2 GB',
      recommended: '8 GB',
    },
    {
      settings: t('systemRequirementsTable.operatingSystem'),
      minimum: 'Windows 7',
      recommended: 'Windows 10',
    },
    {
      settings: t('systemRequirementsTable.graphicsCard'),
      minimum: '256 MB',
      recommended: '512 MB',
    },
    {
      settings: t('systemRequirementsTable.storage'),
      minimum: '2 GB HD',
      recommended: '2 GB SSD',
    },
    {
      settings: t('systemRequirementsTable.internet'),
      minimum: '2 Mb',
      recommended: '10 Mb',
    },
  ];

  return (
    <>
      <TitleWithDivider>{t('title')}</TitleWithDivider>
      <div className="flex w-full flex-col gap-8 rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800/40 dark:bg-neutral-900/60 md:p-12">
        <div className="flex flex-col gap-4">
          <Typography
            component="h2"
            variant="h3-inter"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('subtitle.clientDownload')}
          </Typography>
          <Typography
            variant="body2-r"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('clientSize')} <br /> {t('fileFormat')}
          </Typography>
          <div className="flex flex-wrap gap-8">
            <ImageButton link="https://drive.google.com/drive">
              <DriveLogo />
            </ImageButton>
            <ImageButton link="https://mega.nz">
              <MegaLogo />
            </ImageButton>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Typography
            variant="h3-inter"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('subtitle.additionalDownloads')}
          </Typography>
          <div className="flex flex-wrap gap-8">
            <ImageButton
              link="https://www.microsoft.com/en-us/download/details.aspx?id=35"
              size="medium"
            >
              <DirectXLogo className="h-20 w-36" />
            </ImageButton>
            <ImageButton
              link="https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170"
              size="medium"
            >
              <VisualCppLogo className="w-24 rounded-full" />
            </ImageButton>
            <ImageButton
              link="https://www.microsoft.com/en-us/download/details.aspx?id=30653"
              size="medium"
            >
              <DotNetLogo className="max-h-20 w-20" />
            </ImageButton>
            <ImageButton
              link="https://www.microsoft.com/en-us/download/confirmation.aspx?id=10019"
              size="medium"
            >
              <VbLogo className="w-20" />
            </ImageButton>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Typography
            component="h2"
            variant="h3-inter"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('subtitle.installationGuide')}
          </Typography>
          <ol className="ml-[16px] text-neutral-900 dark:text-neutral-100">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <Typography key={i} component="li" variant="body2-r" type="1">
                {t(`installationSteps.${i + 1}`)}
              </Typography>
            ))}
          </ol>
        </div>
        <div className="flex flex-col gap-4">
          <Typography
            component="h2"
            variant="h3-inter"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('subtitle.systemRequirements')}
          </Typography>
          <Table columns={requerimentsTableColumns} fontSize="16px">
            {requirementTableRows.map((requirement, index) => (
              <tr
                key={index}
                className={`border-b ${
                  requirementTableRows.length != index + 1
                    ? 'border-neutral-300 dark:border-primary-400'
                    : 'border-neutral-700 dark:border-neutral-600'
                }`}
              >
                {requerimentsTableColumns.map((column, colIndex) => (
                  <Typography
                    key={colIndex}
                    component="td"
                    variant={colIndex === 0 ? 'label2-s' : 'label2-r'}
                    styles="text-neutral-900 dark:text-neutral-100 text-center"
                  >
                    {requirement[column.name]}
                  </Typography>
                ))}
              </tr>
            ))}
          </Table>
        </div>
        <div className="flex flex-col gap-4">
          <Typography
            component="h2"
            variant="h3-inter"
            styles="text-neutral-900 dark:text-neutral-100"
          >
            {t('subtitle.drivers')}
          </Typography>

          <div className="flex flex-wrap gap-8">
            <ImageButton
              link="https://www.nvidia.com/download/index.aspx"
              size="medium"
            >
              <NvidiaLogo className="max-h-20 w-[104px]" />
            </ImageButton>
            <ImageButton
              link="https://www.amd.com/en/support/download/drivers.html"
              size="medium"
            >
              <AMDLogo className="max-h-20 w-[105px]" />
            </ImageButton>
            <ImageButton
              link="https://www.intel.com/content/www/us/en/download-center/home.html"
              size="medium"
            >
              <IntelGraphicsLogo className="max-h-20 w-[63px]" />
            </ImageButton>
            <ImageButton
              link="https://www.intel.com/content/www/us/en/products/docs/discrete-gpus/arc/software/drivers.html"
              size="medium"
            >
              <IntelArcLogo className="h-[86px] w-[85px]" />
            </ImageButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default DownloadsPage;
