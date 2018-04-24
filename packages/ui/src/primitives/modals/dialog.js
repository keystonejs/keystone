// @flow

import React, { Component, Fragment } from 'react';
import { createPortal } from 'react-dom';
import styled from 'react-emotion';

import { colors } from '../../theme';
import { alpha } from '../../theme/color-utils';

const Blanket = styled.div({
  backgroundColor: alpha(colors.N90, 0.66),
  bottom: 0,
  left: 0,
  position: 'fixed',
  right: 0,
  top: 0,
  zIndex: 2,
});
const Positioner = styled.div(({ width }) => ({
  bottom: 0,
  left: 0,
  marginLeft: 'auto',
  marginRight: 'auto',
  maxWidth: width,
  padding: 40,
  position: 'fixed',
  right: 0,
  top: 0,
  zIndex: 2,
}));
const Dialog = styled.div({
  backgroundColor: 'white',
  borderRadius: 5,
  padding: 20,
});
const Heading = styled.h3({
  borderBottom: `2px solid ${colors.N10}`,
  fontSize: 18,
  fontWeight: 500,
  margin: 0,
  marginBottom: 15,
  paddingBottom: 15,
});
const Body = styled.div({
  lineHeight: 1.4,
});

export default class ModalDialog extends Component<*> {
  static defaultProps = {
    attachTo: document.body,
    width: 640,
  };
  render() {
    const { attachTo, children, heading, onClose, width } = this.props;

    return createPortal(
      <Fragment>
        <Blanket onClick={onClose} />
        <Positioner width={width}>
          <Dialog>
            {heading ? <Heading>{heading}</Heading> : null}
            <Body>{children}</Body>
          </Dialog>
        </Positioner>
      </Fragment>,
      attachTo
    );
  }
}
