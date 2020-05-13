import React, { Fragment } from 'react';
import { css } from '@emotion/core';
import styled from '@emotion/styled';

import { Button } from '@arch-ui/button';
import PopoutModal from '@arch-ui/popout';
import { colors, gridSize } from '@arch-ui/theme';
import { alpha } from '@arch-ui/color-utils';

export const POPOUT_GUTTER = gridSize * 2;

// Layout
const Bar = styled.div`
  padding-bottom: ${gridSize * 1.5}px;
  padding-top: ${gridSize * 1.5}px;
  margin-left: ${POPOUT_GUTTER}px;
  margin-right: ${POPOUT_GUTTER}px;
  position: relative;
  z-index: 1;
`;

const Header = styled(Bar)`
  align-items: center;
  box-shadow: 0 2px 0 ${alpha(colors.text, 0.1)};
  display: flex;
  justify-content: center;
  text-align: center;
`;

const HeaderTitle = styled.div`
  font-weight: bold;
  font-size: 0.85em;
`;

const HeaderLeft = styled.div`
  position: absolute;
  left: 0;
`;

const HeaderRight = styled.div`
  position: absolute;
  left: 0;
`;

const Body = styled.div`
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
`;

const Footer = styled(Bar)`
  align-items: center;
  box-shadow: 0 -2px 0 ${alpha(colors.text, 0.1)};
  display: flex;
  justify-content: space-between;
`;

// Other
export const DisclosureArrow = styled.span(
  ({ size = '0.3em' }) => css`
    border-left: ${size} solid transparent;
    border-right: ${size} solid transparent;
    border-top: ${size} solid;
    display: inline-block;
    height: 0;
    margin-left: 0.33em;
    margin-top: -0.125em;
    vertical-align: middle;
    width: 0;
  `
);

export const Popout = ({
  buttonLabel,
  component: Wrapper = Fragment,
  children,
  innerRef,
  bodyRef,
  footerContent,
  headerAfter,
  headerBefore,
  headerTitle,
  target,
  ...props
}) => {
  const defaultTarget = handlers => (
    <Button variant="subtle" appearance="primary" {...handlers}>
      {buttonLabel}
      <DisclosureArrow />
    </Button>
  );

  return (
    <PopoutModal ref={innerRef} target={target || defaultTarget} {...props}>
      <Wrapper>
        <Header>
          <HeaderLeft>{headerBefore}</HeaderLeft>
          <HeaderTitle>{headerTitle}</HeaderTitle>
          <HeaderRight>{headerAfter}</HeaderRight>
        </Header>
        <Body ref={bodyRef}>{children}</Body>
        {footerContent ? <Footer>{footerContent}</Footer> : null}
      </Wrapper>
    </PopoutModal>
  );
};
