import React from 'react';
import { twMerge } from 'tailwind-merge';

import Typography from '../Typography/Typography';

type ButtonProps = {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'flat' | 'outline' | 'bezel' | 'ghost1' | 'ghost2';
  size?: 'medium' | 'large';
  active?: boolean;
  disabled?: boolean;
  iconDirection?: 'left' | 'right';
  fullWidth?: boolean;
  styles?: string;
  onClick?: (...args: any) => void;
  [key: string]: any;
};

const Button: React.FC<ButtonProps> = ({
  children,
  icon: Icon = undefined,
  iconDirection = 'left',
  variant = 'flat',
  size,
  disabled = false,
  fullWidth = false,
  styles = '',
  onClick,
  ...props
}) => {
  const buttonStyles = {
    flat: 'enabled:bg-primary-500 enabled:hover:bg-primary-600 enabled:active:bg-primary-700 transition-colors duration-150',
    outline: `border border-primary-500/60 enabled:hover:border-primary-500 enabled:active:border-primary-600 transition-colors duration-150
      dark:border-primary-600/40 dark:enabled:hover:border-primary-500 dark:enabled:active:border-primary-400`,
    bezel: `enabled:bg-gradient-to-b enabled:from-primary-400 enabled:to-primary-600 enabled:hover:from-primary-500 enabled:hover:to-primary-600 enabled:active:from-primary-600 enabled:active:to-primary-700 shadow-glow-sm transition-all duration-150`,
    ghost1: 'transition-colors duration-150',
    ghost2: 'transition-colors duration-150',
  };

  const disabledStyles = {
    flat: 'disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed',
    outline:
      'disabled:border-neutral-300 dark:disabled:border-neutral-700 disabled:cursor-not-allowed',
    bezel:
      'disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed disabled:shadow-none',
    ghost1: 'disabled:text-neutral-400 disabled:cursor-not-allowed',
    ghost2: '',
  };

  const textStyles = {
    flat: 'enabled:text-neutral-950 disabled:text-neutral-400',
    outline: `enabled:text-primary-600 enabled:hover:text-primary-700 enabled:active:text-primary-800 disabled:text-neutral-400
       dark:enabled:text-primary-400 dark:enabled:hover:text-primary-300`,
    bezel: 'enabled:text-neutral-950 disabled:text-neutral-500',
    ghost1:
      'text-primary-600 hover:text-primary-700 dark:hover:text-primary-300 dark:text-primary-400',
    ghost2: 'text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300',
  };

  return (
    <button
      className={twMerge(
        fullWidth ? 'flex-grow' : 'w-fit',
        'gap-1 flex items-center rounded-md px-4',
        size === 'large' ? 'h-11' : 'h-9',
        buttonStyles[variant],
        disabledStyles[variant],
        textStyles[variant],
        variant === 'ghost1' || variant === 'ghost2' ? 'h-fit px-0' : '',
        styles,
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {Icon && iconDirection === 'left' ? Icon : null}
      <Typography
        component="span"
        variant={
          variant === 'ghost2'
            ? 'label3-r'
            : size === 'large' || variant === 'ghost1'
            ? 'label2-s'
            : 'label3-s'
        }
      >
        {children}
      </Typography>
      {Icon && iconDirection === 'right' ? Icon : null}
    </button>
  );
};

export default Button;
