// @flow
/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component, forwardRef, type Element } from 'react';
import { createPortal } from 'react-dom';

import { borderRadius, colors, gridSize, shadows } from '@arch-ui/theme';
import { FocusTrap } from 'react-focus-marshal';
import { withModalHandlers, type ModalHandlerProps, springDown } from '@arch-ui/modal-utils';

const ARROW_WIDTH = 30;
const CHROME_GUTTER = 30;

const Wrapper = forwardRef(({ left, top, width, ...props }, ref) => {
  const placementStyles = { left, top, width };

  return (
    <div
      ref={ref}
      css={{
        backgroundColor: 'white',
        borderRadius: borderRadius * 2,
        boxShadow: shadows[2],
        marginTop: gridSize * 2,
        maxHeight: '100%',
        position: 'absolute',
        zIndex: 2,
        ...placementStyles,
      }}
      {...props}
    />
  );
});

const WrapperInner = props => <div css={{ position: 'relative' }} {...props} />;

const Arrow = ({ left }) => (
  <div
    css={{
      height: ARROW_WIDTH,
      left: left,
      marginLeft: -ARROW_WIDTH / 2,
      marginTop: -11,
      position: 'absolute',
      width: ARROW_WIDTH,
    }}
  >
    <svg
      viewBox="0 0 30 30"
      style={{ transform: 'rotate(90deg)' }}
      focusable="false"
      role="presentation"
    >
      <path
        css={{ fill: colors.text, fillOpacity: 0.1 }}
        d="M8.11 6.302c1.015-.936 1.887-2.922 1.887-4.297v26c0-1.378-.868-3.357-1.888-4.297L.925 17.09c-1.237-1.14-1.233-3.034 0-4.17L8.11 6.302z"
      />
      <path
        css={{ fill: 'white' }}
        d="M8.787 7.036c1.22-1.125 2.21-3.376 2.21-5.03V0v30-2.005c0-1.654-.983-3.9-2.21-5.03l-7.183-6.616c-.81-.746-.802-1.96 0-2.7l7.183-6.614z"
      />
    </svg>
  </div>
);

type Props = ModalHandlerProps & {
  children: Element<*>,
  getModalRef: (HTMLElement | null) => void,
  style: Object,
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
    const attachTo = ((document.body: any): HTMLElement); // NOTE: flow junk

    return attachTo
      ? createPortal(
          <Wrapper
            ref={getModalRef}
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
          attachTo
        )
      : null;
  }
}

export default withModalHandlers(Popout, { transition: springDown });
