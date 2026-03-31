import React from 'react';

import Typography from '../Typography/Typography';
import DiamondIcon from './DiamondIcon';

type TitleWithDividerProps = {
  twoDividers?: boolean;
  children: React.ReactNode;
};

const TitleWithDivider: React.FC<TitleWithDividerProps> = ({
  twoDividers = false,
  children,
}) => {
  return (
    <div className="flex items-center gap-1">
      {twoDividers ? (
        <div className="flex flex-grow items-center">
          <DiamondIcon />
          <div className="h-px flex-grow bg-gradient-to-l from-primary-400/60 to-primary-700/20 dark:from-primary-400/50 dark:to-transparent"></div>
        </div>
      ) : null}
      <Typography
        variant={twoDividers ? 'h3' : 'h2'}
        component="h1"
        styles="bg-gradient-to-b from-primary-400 to-primary-700 dark:from-primary-300 dark:to-primary-500 bg-clip-text text-transparent drop-shadow-sm"
      >
        {children}
      </Typography>
      <div className="flex flex-grow items-center">
        <div className="h-px flex-grow bg-gradient-to-r from-primary-400/60 to-primary-700/20 dark:from-primary-400/50 dark:to-transparent"></div>
        <DiamondIcon />
      </div>
    </div>
  );
};

export default TitleWithDivider;
