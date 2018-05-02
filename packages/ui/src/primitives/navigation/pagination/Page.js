import React, { Component } from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';

import { colors } from '../../../theme';
import type { LabelType, OnChangeType } from './types';

export type PagePrimitiveProps = {
  children: Node,
  href?: string,
  isDisabled: boolean,
  isSelected: boolean,
  to?: string,
};
type PageProps = PagePrimitiveProps & {
  ariaLabel: LabelType,
  children: Node,
  isSelected: boolean,
  onClick: OnChangeType,
  value: number,
};

// Element Switch
// remove props that will create react DOM warnings
// ------------------------------

const PagePrimitive = ({
  isDisabled,
  isSelected,
  ...props
}: PagePrimitiveProps) => {
  if (props.to) return <Link {...props} />;
  if (props.href) return <a {...props} />;
  return <button type="button" disabled={isDisabled} {...props} />;
};
PagePrimitive.defaultProps = {
  isDisabled: false,
  isSelected: false,
};

// Primitive
// ------------------------------

const PageElement = styled(PagePrimitive)(
  ({ isDisabled, isSelected }: PageProps) => {
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
            zIndex: 2,
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
      position: 'relative',
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
  }
);

export default class Page extends Component {
  onClick = () => {
    const { onClick, value } = this.props;
    if (onClick) onClick(value);
  };
  render() {
    return <PageElement {...this.props} onClick={this.onClick} />;
  }
}
