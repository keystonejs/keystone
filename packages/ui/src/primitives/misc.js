import React from 'react';
import styled from 'react-emotion';

export const A11yText = styled.span({
  border: 0,
  clip: 'rect(1px, 1px, 1px, 1px)',
  height: 1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: 1,
});

// This function wraps a component and adds a `data-selector` attribue
// which can be used by test system to select DOM elements.
export const withSelector = (id, WrappedComponent) =>
  process.env.NODE_ENV === 'production'
    ? WrappedComponent
    : props => <WrappedComponent data-selector={id} {...props} />;
