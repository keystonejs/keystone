import React from 'react';

// This function wraps a component and adds a `data-selector` attribue
// which can be used by test system to select DOM elements.
export const withSelector = (id, WrappedComponent) =>
  process.env.NODE_ENV === 'production'
    ? WrappedComponent
    : props => <WrappedComponent data-selector={id} {...props} />;
