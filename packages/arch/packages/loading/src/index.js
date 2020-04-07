import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

import { colors } from '@arch-ui/theme';
import { A11yText } from '@arch-ui/typography';

// ==============================
// Dots
// ==============================

const fadeAnim = keyframes`0%, 80%, 100% { opacity: 0; } 40% { opacity: 1; }`;
const appearanceColor = {
  default: colors.N20,
  dark: colors.text,
  primary: colors.primary,
  inverted: 'white',
};

const DotsContainer = styled.div(({ size }) => ({
  alignSelf: 'center',
  fontSize: size,
  lineHeight: 1,
  textAlign: 'center',
  verticalAlign: 'middle',
  display: 'inline-flex',
}));
const Dot = styled.span(({ appearance, delay = 0, isOffset }) => ({
  animation: `${fadeAnim} 1s infinite ${delay}ms`,
  animationTimingFunction: 'ease-in-out',
  backgroundColor: appearanceColor[appearance],
  borderRadius: '1em',
  display: 'inline-block',
  height: '1em',
  marginLeft: isOffset ? '1em' : null,
  verticalAlign: 'top',
  width: '1em',
}));
export const LoadingIndicator = ({ appearance = 'default', size = 4 }) => (
  <DotsContainer size={size}>
    <Dot appearance={appearance} />
    <Dot appearance={appearance} delay={160} isOffset />
    <Dot appearance={appearance} delay={320} isOffset />
    <A11yText>Loading</A11yText>
  </DotsContainer>
);

// ==============================
// Spinner
// ==============================

const spinAnim = keyframes`to { transform: rotate(1turn); }`;

const spinnerCommon = ({ size }) => ({
  borderRadius: '50%',
  borderStyle: 'solid',
  borderWidth: size / 8,
  boxSizing: 'border-box',
  height: size,
  width: size,
});
const SpinnerWrapper = styled.div(({ size }) => ({
  height: size,
  width: size,
  position: 'relative',
}));
const SpinnerOrbit = styled.div(({ color, size }) => ({
  ...spinnerCommon({ size }),
  borderColor: color,
  opacity: 0.2,
  position: 'relative',
}));
const SpinnerSatellite = styled.div(({ color, size }) => ({
  ...spinnerCommon({ size }),
  animation: `${spinAnim} 1s linear infinite`,
  borderColor: `${color} transparent transparent`,
  left: 0,
  position: 'absolute',
  top: 0,
}));

export const LoadingSpinner = ({ appearance = 'default', size = 16 }) => {
  const color = appearanceColor[appearance];

  return (
    <SpinnerWrapper>
      <SpinnerOrbit color={color} size={size} />
      <SpinnerSatellite color={color} size={size} />
      <A11yText>Loading</A11yText>
    </SpinnerWrapper>
  );
};
