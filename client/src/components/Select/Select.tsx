import React, { useState } from 'react';

import { IoChevronDown } from 'react-icons/io5';

import Typography from '../Typography/Typography';

export type Option = {
  value: string;
  label: string;
};
type SelectProps = {
  name: string;
  label: string;
  value: string;
  onSelect: (value: string) => void;
  options: Option[];
};

const Select: React.FC<SelectProps> = ({
  name,
  label,
  value,
  onSelect,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };
  const handleClose = () => setIsOpen(false);
  const handleCloseWithTime = () => setTimeout(handleClose, 150);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <Typography
          variant="label-sm"
          component="label"
          styles="text-neutral-900 dark:text-neutral-100"
        >
          {label}
        </Typography>
        <div className="relative inline-block w-fit">
          <button
            className="h-10 w-32 rounded-[4px] border border-neutral-300 bg-white p-2 text-left font-inter text-[14px] text-neutral-900
                        focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/50 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100"
            name={name}
            onClick={handleToggle}
            onBlur={handleCloseWithTime}
            onChange={handleCloseWithTime}
          >
            {options.find((option) => option.value === value)?.label}
            <IoChevronDown
              className={`absolute right-2 top-1/2 -translate-y-1/2 transform text-neutral-600 transition-transform duration-200 dark:text-neutral-400 ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>

          {isOpen && (
            <ul className="absolute z-10 mt-1 w-full origin-top animate-scale-y rounded-md border border-neutral-300 bg-white dark:bg-neutral-800 dark:border-neutral-700">
              {options.map((option) => (
                <Typography
                  key={option.value}
                  component="li"
                  styles="cursor-pointer p-2 text-neutral-800 hover:bg-primary-50 dark:text-neutral-200 dark:hover:bg-primary-900/20"
                  onClick={() => handleSelect(option.value)}
                  variant="body"
                >
                  {option.label}
                </Typography>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default Select;
