/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';

import { colors } from '@arch-ui/theme';

export class ErrorBoundary extends Component {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <span css={{ color: colors.danger }}>Unable to render view</span>;
    }

    return this.props.children;
  }
}
