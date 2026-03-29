import React from 'react';
import { twMerge } from 'tailwind-merge';

type TypographyVariant =
  | 'display-1'
  | 'display-2'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body-lg'
  | 'body-lg-medium'
  | 'body'
  | 'body-medium'
  | 'body-sm'
  | 'body-sm-medium'
  | 'label-lg'
  | 'label'
  | 'label-sm'
  | 'caption'
  | 'h2-inter'
  | 'h3-inter'
  | 'body1-r'
  | 'body1-m'
  | 'body2-r'
  | 'body2-m'
  | 'body3-r'
  | 'body3-m'
  | 'label1-r'
  | 'label1-b'
  | 'label2-r'
  | 'label2-s'
  | 'label3-m'
  | 'label3-r'
  | 'label3-s'
  | 'label4-r'
  | 'label4-s'
  | undefined;

type TypographyProps = {
  children: React.ReactNode;
  component?: React.ElementType;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  styles?: string;
  variant: TypographyVariant;
  [key: string]: any;
};

const variantStyles: Record<Exclude<TypographyVariant, undefined>, string> = {
  'display-1': 'font-display font-bold leading-[110%] text-[48px] md:text-[64px]',
  'display-2': 'font-display font-bold leading-[115%] text-[32px] md:text-[48px]',
  h1: 'font-cinzel font-bold leading-[120%] text-[24px] md:text-[40px]',
  h2: 'font-cinzel font-bold leading-[120%] text-[18px] md:text-[32px]',
  h3: 'font-cinzel font-bold leading-[125%] text-[16px] md:text-[24px]',
  h4: 'font-cinzel font-bold leading-[125%] text-[14px] md:text-[18px]',
  'body-lg': 'font-inter font-normal leading-[150%] text-[16px]',
  'body-lg-medium': 'font-inter font-medium leading-[150%] text-[16px]',
  body: 'font-inter font-normal leading-[150%] text-[14px]',
  'body-medium': 'font-inter font-medium leading-[150%] text-[14px]',
  'body-sm': 'font-inter font-normal leading-[150%] text-[12px]',
  'body-sm-medium': 'font-inter font-medium leading-[150%] text-[12px]',
  'label-lg': 'font-cinzel font-medium leading-[125%] text-[16px]',
  label: 'font-inter font-medium leading-[125%] text-[14px]',
  'label-sm': 'font-inter font-medium leading-[125%] text-[12px]',
  caption: 'font-inter font-normal leading-[125%] text-[11px]',
  'h2-inter': 'font-inter font-bold leading-[125%] text-[24px] md:text-[32px]',
  'h3-inter': 'font-inter font-bold leading-[125%] text-[18px] md:text-[24px]',
  'body1-r': 'font-inter font-normal leading-[150%] text-[12px] md:text-[16px]',
  'body1-m': 'font-inter font-medium leading-[150%] text-[12px] md:text-[16px]',
  'body2-r': 'font-inter font-normal leading-[150%] text-[14px]',
  'body2-m': 'font-inter font-medium leading-[150%] text-[14px]',
  'body3-r': 'font-inter font-normal leading-[150%] text-[12px]',
  'body3-m': 'font-inter font-medium leading-[150%] text-[12px]',
  'label1-r': 'font-cinzel font-normal leading-[125%] text-[18px]',
  'label1-b': 'font-cinzel font-bold leading-[125%] text-[18px]',
  'label2-r': 'font-inter font-normal leading-[125%] text-[12px] md:text-[16px]',
  'label2-s': 'font-inter font-semibold leading-[125%] text-[12px] md:text-[16px]',
  'label3-m': 'font-inter font-medium leading-[125%] text-[14px]',
  'label3-r': 'font-inter font-normal leading-[125%] text-[14px]',
  'label3-s': 'font-inter font-semibold leading-[125%] text-[14px]',
  'label4-r': 'font-inter font-normal leading-[125%] text-[12px]',
  'label4-s': 'font-inter font-semibold leading-[125%] text-[12px]',
};

const aliases: Record<Exclude<TypographyVariant, undefined>, Exclude<TypographyVariant, undefined>> = {
  'h2-inter': 'h1',
  'h3-inter': 'h2',
  'body1-r': 'body-lg',
  'body1-m': 'body-lg-medium',
  'body2-r': 'body',
  'body2-m': 'body-medium',
  'body3-r': 'body-sm',
  'body3-m': 'body-sm-medium',
  'label1-r': 'label-lg',
  'label1-b': 'label-lg',
  'label2-r': 'label',
  'label2-s': 'label',
  'label3-m': 'label',
  'label3-r': 'label',
  'label3-s': 'label',
  'label4-r': 'caption',
  'label4-s': 'label-sm',
  'display-1': 'display-1',
  'display-2': 'display-2',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  'body-lg': 'body-lg',
  'body-lg-medium': 'body-lg-medium',
  body: 'body',
  'body-medium': 'body-medium',
  'body-sm': 'body-sm',
  'body-sm-medium': 'body-sm-medium',
  'label-lg': 'label-lg',
  label: 'label',
  'label-sm': 'label-sm',
  caption: 'caption',
};

const Typography: React.FC<TypographyProps> = ({
  variant,
  component: Component = 'p',
  children,
  styles,
  onClick,
  ...props
}) => {
  const resolvedVariant = variant ? aliases[variant] : 'body-lg';
  return (
    <Component
      onClick={onClick}
      className={twMerge(variantStyles[resolvedVariant], styles)}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Typography;
