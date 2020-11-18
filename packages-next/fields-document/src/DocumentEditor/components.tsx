/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { ButtonHTMLAttributes } from 'react';

export const Spacer = () => <span css={{ display: 'inline-block', width: 12 }} />;

export const Button = ({
  isDisabled,
  isSelected,
  active,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> & {
  isDisabled?: boolean;
  isSelected?: boolean;
  active?: boolean;
}) => (
  <button
    type="button"
    disabled={isDisabled}
    css={{
      background: isSelected ? '#EDF2F7' : 'white',
      borderColor: isSelected ? '#A0AEC0' : isDisabled ? '#E2E8F0' : '#CBD5E0',
      borderStyle: 'solid',
      borderWidth: 1,
      borderRadius: 5,
      boxShadow: isSelected ? 'inset 0px 3px 5px -4px rgba(0,0,0,0.50)' : undefined,
      color: isSelected ? '#4A5568' : isDisabled ? '#CBD5E0' : '#718096',
      marginRight: 4,
      padding: '4px 8px',
      pointerEvents: isDisabled ? 'none' : undefined,
      ':hover': {
        color: isSelected ? '#4A5568' : '#718096',
        borderColor: isSelected ? '#718096' : '#A0AEC0',
      },
    }}
    {...props}
  />
);
