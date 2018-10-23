// @flow

import React, { Component, type Element } from 'react';
import styled from '@emotion/styled';
import { createPortal } from 'react-dom';
import { FocusTrap } from 'react-focus-marshal';

import { borderRadius, gridSize } from '../theme';
import { SlideDown, withModalHandlers, type CloseType } from '../modal-utils';

const ARROW_WIDTH = 8;
const CHROME_GUTTER = 30;

const Wrapper = styled.div(({ left, top, width }) => {
  const placementStyles = { left, top, width };

  return {
    backgroundColor: 'white',
    borderRadius: borderRadius,
    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.175), 0 3px 8px rgba(0, 0, 0, 0.175)',
    marginTop: gridSize * 2,
    maxHeight: '100%',
    position: 'absolute',
    zIndex: 2,
    ...placementStyles,
  };
});
const WrapperInner = styled.div({
  position: 'relative',
});
const Arrow = styled.div`
  left: ${p => p.left};
  margin-left: -${ARROW_WIDTH}px;
  margin-top: -${ARROW_WIDTH}px;
  position: absolute;

  &::before,
  &::after {
    border-left: ${ARROW_WIDTH}px solid transparent;
    border-right: ${ARROW_WIDTH}px solid transparent;
    border-bottom: ${ARROW_WIDTH}px dashed;
    content: '';
    display: inline-block;
    height: 0;
    left: 0;
    position: absolute;
    top: 0;
    width: 0;
  }

  &::before {
    border-bottom-color: rgba(0, 0, 0, 0.2);
    top: -1px;
  }

  &::after {
    border-bottom-color: white;
  }
`;

type Props = {
  children: Element<*>,
  close: CloseType,
  defaultIsOpen: boolean,
  getModalRef: HTMLElement => void,
  style: Object,
  target: Element<*>,
  targetNode: HTMLElement,
  width: number,
};

type State = { leftOffset: number, topOffset: number, arrowLeftOffset: string };

class Popout extends Component<Props, State> {
  wrapperNode: HTMLElement;
  state = { leftOffset: 0, topOffset: 0, arrowLeftOffset: '0' };
  static defaultProps = {
    width: 320,
  };

  componentDidMount() {
    window.addEventListener('resize', this.calculatePosition);
    this.calculatePosition();
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.calculatePosition);
  }

  calculatePosition = () => {
    const { targetNode, width } = this.props;

    if (!targetNode || !document.body) return;

    // prepare common values
    const bodyRect = document.body.getBoundingClientRect();
    const targetRect = targetNode.getBoundingClientRect();

    const targetCenter = targetRect.left + targetRect.width / 2;
    let leftOffset = Math.max(targetCenter - width / 2, CHROME_GUTTER);
    let topOffset = targetRect.bottom - bodyRect.top;
    let isAlignedRight = false;

    // handle right aligned
    const spaceOnRight = window.innerWidth - (leftOffset + width + CHROME_GUTTER);
    if (spaceOnRight < 0) {
      leftOffset = leftOffset + spaceOnRight;
      isAlignedRight = true;
    }

    // get arrow offset
    let arrowLeftOffset = '50%';
    if (leftOffset === CHROME_GUTTER) {
      arrowLeftOffset = `${targetCenter - ARROW_WIDTH / 2 - CHROME_GUTTER}px`;
    }
    if (isAlignedRight) {
      arrowLeftOffset = `${targetCenter - leftOffset}px`;
    }

    // avoid state thrashing
    const newStateAvaliable =
      this.state.leftOffset !== leftOffset ||
      this.state.topOffset !== topOffset ||
      this.state.arrowLeftOffset !== arrowLeftOffset;

    if (newStateAvaliable) {
      this.setState({ leftOffset, topOffset, arrowLeftOffset });
    }
  };

  render() {
    const { children, getModalRef, style, width } = this.props;
    let { leftOffset, topOffset, arrowLeftOffset } = this.state;

    return document.body
      ? createPortal(
          <Wrapper
            innerRef={getModalRef}
            left={leftOffset}
            top={topOffset}
            width={width}
            style={style} // style comes from Transition
          >
            <FocusTrap options={{ clickOutsideDeactivates: true }}>
              <WrapperInner>
                <Arrow left={arrowLeftOffset} />
                {children}
              </WrapperInner>
            </FocusTrap>
          </Wrapper>,
          document.body
        )
      : null;
  }
}

export default withModalHandlers(Popout, { Transition: SlideDown });
