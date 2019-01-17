// @flow
import * as React from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

import { colors } from '@arch-ui/theme';
import type { LabelType, OnChangeType } from './types';

export type PagePrimitiveProps = {
  children: React.Node,
  href?: string,
  isDisabled: boolean,
  isSelected: boolean,
  to?: string,
};
type PageProps = PagePrimitiveProps & {
  ariaLabel: LabelType,
  children: React.Node,
  isSelected: boolean,
  onClick: OnChangeType,
  value: number,
};

// Element Switch
// remove props that will create react DOM warnings
// ------------------------------

const PagePrimitive = ({ isDisabled, isSelected, ...props }: PagePrimitiveProps) => {
  const current = isSelected ? 'page' : null;
  if (props.to) return <Link aria-current={current} {...props} />;
  if (props.href) return <a aria-current={current} {...props} />;
  return <button type="button" disabled={isDisabled} aria-current={current} {...props} />;
};
PagePrimitive.defaultProps = {
  isDisabled: false,
  isSelected: false,
};

// Primitive
// ------------------------------

const PageElement = styled(PagePrimitive)(({ isDisabled, isSelected }: PageProps) => {
  const disabledStyles = isDisabled
    ? {
        color: colors.N40,
        cursor: 'default',
      }
    : null;
  const selectedStyles = isSelected
    ? {
        '&, &:hover, &:focus': {
          backgroundColor: colors.N10,
          borderColor: 'transparent',
          color: colors.N80,
          cursor: 'default',
        },
      }
    : null;

  return {
    appearance: 'none',
    background: 0,
    border: '1px solid transparent',
    borderRadius: 3,
    color: colors.N60,
    cursor: 'pointer',
    fontSize: 'inherit',
    marginRight: '.1em',
    padding: '0.25em 0.7em',
    textDecoration: 'none',

    '&:hover, &:focus': {
      backgroundColor: 'white',
      borderColor: colors.N20,
      color: colors.N80,
      outline: 'none',
    },

    ...selectedStyles,
    ...disabledStyles,
  };
});

const Page = (props: { value: number, onClick: number => void }) => {
  return (
    <PageElement
      {...props}
      onClick={() => {
        if (props.onClick) {
          props.onClick(props.value);
        }
      }}
    />
  );
};

export default Page;
