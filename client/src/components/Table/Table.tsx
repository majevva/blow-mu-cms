import React from 'react';
import Typography from '../Typography/Typography';

export type Column = {
  name: string;
  label: string;
  style?: string;
};

type TableProps = {
  columns: Column[];
  withIndex?: boolean;
  children: React.ReactNode;
  fontSize?: '14px' | '16px';
};

const Table: React.FC<TableProps> = ({
  columns,
  withIndex = false,
  children,
  fontSize = '14px',
}) => {
  return (
    <>
      <table className="">
        <thead className="border-b border-neutral-300 dark:border-neutral-700/60">
          <tr>
            {withIndex ? <th></th> : null}
            {columns.map((column, index) => (
              <Typography
                component="th"
                key={index}
                variant={fontSize === '14px' ? 'label3-s' : 'label2-s'}
                styles={`${column.style} text-neutral-900 dark:text-neutral-100`}
              >
                {column.label}
              </Typography>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </>
  );
};

export default Table;
