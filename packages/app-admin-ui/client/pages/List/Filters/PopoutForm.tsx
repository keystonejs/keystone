/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component, Fragment } from 'react';

import { colors, gridSize } from '@arch-ui/theme';
import { Popout } from '../../../components/Popout';
import AnimateHeight from '../../../components/AnimateHeight';

const FooterButton = ({ isPrimary, ...props }: { isPrimary?; onClick?; children?; type? }) => (
  <button
    type="button"
    css={{
      background: 0,
      border: 0,
      cursor: 'pointer',
      color: isPrimary ? colors.primary : colors.N40,
      fontSize: '1rem',
      fontWeight: isPrimary ? 'bold' : null,
      margin: -gridSize,
      padding: gridSize,

      ':hover, :focus': {
        outline: 0,
        textDecoration: 'underline',
      },
    }}
    {...props}
  />
);

type Props = {
  onClose?: (x0: Event) => void;
  onSubmit?: (x0: Event) => void;
  headerTitle?: string;
  headerBefore?: $TSFixMe;
  showFooter?: boolean;
  target?: $TSFixMe;
};

export default class FilterPopout extends Component<Props> {
  popoutRef: $TSFixMe;
  popoutBody: $TSFixMe;
  onSubmit = event => {
    const { onSubmit } = this.props;

    this.close(event);
    onSubmit(event);
  };
  close = event => {
    this.popoutRef.close(event);

    // prevent form submission
    // default must be prevented after the popoutRef receives the call to close
    if (event) event.preventDefault();
  };

  // Refs
  // ==============================

  getPopoutRef = ref => {
    if (!ref) return;
    this.popoutRef = ref;
  };
  getPopoutBody = ref => {
    if (!ref) return;
    this.popoutBody = ref;
  };

  renderFooter() {
    const { showFooter } = this.props;

    // bail early
    if (!showFooter) return null;

    return (
      <Fragment>
        <FooterButton onClick={this.close}>Cancel</FooterButton>
        <FooterButton type="submit" isPrimary>
          Apply
        </FooterButton>
      </Fragment>
    );
  }
  popoutForm = props => {
    return <form onSubmit={this.onSubmit} {...props} />;
  };

  render() {
    const { children, ...props } = this.props;

    return (
      <Popout
        component={this.popoutForm}
        bodyRef={this.getPopoutBody}
        innerRef={this.getPopoutRef}
        footerContent={this.renderFooter()}
        {...props}
      >
        <AnimateHeight
          autoScroll={this.popoutBody}
          style={{ position: 'relative' }}
          initialHeight={0}
          render={children}
        />
      </Popout>
    );
  }
}
