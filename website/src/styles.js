import React from 'react';
import Styled from '@emotion/styled';

export const colors = {
  B: {
    A95: 'rgba(38, 132, 255, 0.95)',
    A90: 'rgba(38, 132, 255, 0.90)',
    A85: 'rgba(38, 132, 255, 0.85)',
    A80: 'rgba(38, 132, 255, 0.80)',
    A75: 'rgba(38, 132, 255, 0.75)',
    A70: 'rgba(38, 132, 255, 0.70)',
    A65: 'rgba(38, 132, 255, 0.65)',
    A60: 'rgba(38, 132, 255, 0.60)',
    A55: 'rgba(38, 132, 255, 0.55)',
    A50: 'rgba(38, 132, 255, 0.50)',
    A45: 'rgba(38, 132, 255, 0.45)',
    A40: 'rgba(38, 132, 255, 0.40)',
    A35: 'rgba(38, 132, 255, 0.35)',
    A30: 'rgba(38, 132, 255, 0.30)',
    A25: 'rgba(38, 132, 255, 0.25)',
    A20: 'rgba(38, 132, 255, 0.20)',
    A15: 'rgba(38, 132, 255, 0.15)',
    A10: 'rgba(38, 132, 255, 0.10)',
    A05: 'rgba(38, 132, 255, 0.05)',
    D80: 'rgb(8, 26, 51)',
    D55: 'rgb(19, 66, 128)',
    base: 'rgb(38, 132, 255)',
    text: 'rgb(23, 43, 77)',
  },
};

export const KSButton = Styled.a(props => ({
  textDecoration: 'none',
  boxSizing: 'border-box',
  fontSize: '1.25rem',
  padding: '1rem 2rem',
  borderRadius: 6,
  margin: '0.5rem',
  transition: 'transform linear 120ms',
  '&:hover': {
    transform: 'scale(1.025)',
  },
  '&:active': {
    opacity: 0.8,
  },

  border: props.onDark ? `2px solid rgba(255,255,255,0.4);` : `2px solid ${colors.B.base}`,
  background: props.primary && props.onDark ? 'white' : props.primary ? colors.B.base : 'none',

  color: props.primary && props.onDark ? colors.B.base : 'white',
}));
