import React from 'react';

import SwordIcon from './SwordIcon';
import BowIcon from './BowIcon';
import Typography from '../../Typography/Typography';

type TableEmptyMessageProps = { message: string; type: 'card' | 'page' };

const TableEmptyMessage: React.FC<TableEmptyMessageProps> = ({
  message,
  type,
}) => {
  const isCard = type === 'card';
  const colSpan = isCard ? 4 : 6;

  return (
    <>
      <tr className="h-[140px] w-full border-b border-neutral-300 text-center dark:border-neutral-700">
        <td align="center" colSpan={colSpan}>
          <div className="flex items-center justify-center gap-2">
            <SwordIcon styles="size-6 fill-primary-600 dark:fill-primary-400" />
            <Typography
              variant="h4"
              styles="text-neutral-600 dark:text-neutral-400 font-inter"
              component="span"
            >
              {message}
            </Typography>
            <BowIcon styles="size-6 fill-primary-600 dark:fill-primary-400" />
          </div>
        </td>
      </tr>
    </>
  );
};

export default TableEmptyMessage;
