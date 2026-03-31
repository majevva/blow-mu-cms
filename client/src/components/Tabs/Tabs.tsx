import React from 'react';

import Typography from '../Typography/Typography';

type TabsProps = {
  tabs: string[];
  activeTab: number;
  onChangeTab: (activeTab: number) => void;
  styles?: string;
};

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChangeTab,
  styles,
}) => {
  return (
    <>
      <div
        className={`w-fit border-b border-neutral-200 dark:border-neutral-700/50 ${styles}`}
      >
        {tabs.map((tab, index) => (
          <Typography
            key={index}
            component="button"
            variant={activeTab === index ? 'label2-s' : 'label2-r'}
            styles={`p-1 transition-colors duration-150 ${
              activeTab === index
                ? 'border-b-2 border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400'
            }`}
            onClick={() => onChangeTab(index)}
          >
            {tab}
          </Typography>
        ))}
      </div>
    </>
  );
};

export default Tabs;
