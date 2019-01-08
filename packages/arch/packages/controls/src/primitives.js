// @flow
import React from 'react';
import styled from '@emotion/styled';

export const Wrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
});
export const Label = styled.label({
  alignItems: 'center',
  display: 'flex',
  lineHeight: 1,
});
export const Text = 'span';

export const Svg = ({ html, ...props }) => (
  <svg
    dangerouslySetInnerHTML={{ __html: html }}
    focusable="false"
    height="24"
    role="presentation"
    viewBox="0 0 24 24"
    width="24"
    {...props}
  />
);

type IconProps = {
  isActive: boolean,
  checked: boolean,
  isDisabled: boolean,
  isFocused: boolean,
};
export const Icon = styled.div(({ isDisabled, isFocused, checked, isActive }: IconProps) => {
  const colors = '#2684FF';
  // background
  let bg = colors.N05;
  if (isDisabled && checked) {
    bg = colors.B.D20;
  } else if (isDisabled) {
    bg = colors.N10;
  } else if (isActive) {
    bg = checked ? colors.B.D10 : colors.N10;
  } else if (isFocused && !checked) {
    bg = 'white';
  } else if (checked) {
    bg = colors.B.base;
  }

  // fill
  let fill = 'white';
  if (isDisabled && checked) {
    fill = colors.N70;
  } else if (!checked) {
    fill = 'transparent';
  }

  // stroke
  let innerStroke = isFocused ? colors.B.L20 : colors.N30;
  let innerStrokeWidth = 1;
  if (checked) {
    innerStroke = isActive ? colors.B.D20 : colors.B.base;
  }
  let outerStroke = 'transparent';
  let outerStrokeWidth = 1;
  if (isFocused && !isActive) {
    outerStroke = colors.B.A20;
    outerStrokeWidth = 5;
  }

  return {
    color: bg,
    fill,
    lineHeight: 0,

    // awkwardly apply the focus ring
    '& .outer-stroke': {
      transition: 'stroke 0.2s ease-in-out',
      stroke: outerStroke,
      strokeWidth: outerStrokeWidth,
    },
    '& .inner-stroke': {
      stroke: innerStroke,
      strokeWidth: innerStrokeWidth,
    },
  };
});
