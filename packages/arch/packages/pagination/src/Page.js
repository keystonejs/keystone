// @flow
import * as React from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

import { uniformHeight } from '@arch-ui/common';
import { borderRadius, colors } from '@arch-ui/theme';
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
        color: colors.N20,
        cursor: 'default',
        pointerEvents: 'none',
      }
    : null;
  const selectedStyles = isSelected
    ? {
        '&, &:hover, &:focus': {
          backgroundColor: colors.N10,
          color: colors.N80,
          cursor: 'default',
        },
      }
    : null;

  return {
    ...uniformHeight,
    appearance: 'none',
    background: 'white',
    borderLeftWidth: 0,
    borderColor: colors.N20,
    borderRadius: 0,
    color: colors.N60,
    cursor: 'pointer',
    fontSize: 'inherit',
    textDecoration: 'none',

    '&:hover, &:focus': {
      color: colors.N80,
      outline: 'none',
    },

    ':first-of-type': {
      borderLeftWidth: 1,
      borderBottomLeftRadius: borderRadius,
      borderTopLeftRadius: borderRadius,
    },
    ':last-of-type': {
      borderBottomRightRadius: borderRadius,
      borderTopRightRadius: borderRadius,
    },

    // a bit naughty...
    svg: {
      height: 15,
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
