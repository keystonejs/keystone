import React, { Fragment } from 'react';
import styled from 'react-emotion';

import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { Popout as PopoutModal } from '@keystonejs/ui/src/primitives/modals';
import { gridSize } from '@keystonejs/ui/src/theme';

const GUTTER = gridSize * 2;

// Layout
const Bar = styled.div({
  paddingBottom: gridSize * 1.5,
  paddingTop: gridSize * 1.5,
  marginLeft: GUTTER,
  marginRight: GUTTER,
  position: 'relative',
});
const Header = styled(Bar)({
  boxShadow: '0 2px 0 rgba(0,0,0,0.1)',
  textAlign: 'center',
});
const HeaderTitle = styled.div({
  fontWeight: 'bold',
  fontSize: '0.85em',
});
const Body = styled.div({
  maxHeight: 300,
  overflow: 'auto',
  padding: GUTTER,
  WebkitOverflowScroll: 'touch',
});
const Footer = styled(Bar)({
  boxShadow: '0 -2px 0 rgba(0,0,0,0.1)',
});

// Other
export const DisclosureArrow = styled.span`
  border-left: 0.3em solid transparent;
  border-right: 0.3em solid transparent;
  border-top: 0.3em solid;
  display: inline-block;
  height: 0px;
  margin-left: 0.33em;
  margin-top: -0.125em;
  vertical-align: middle;
  width: 0px;
`;

type Props = { buttonLabel: string };

export const Popout = ({
  buttonLabel,
  children,
  footerContent,
  headerAfter,
  headerBefore,
  headerTitle,
  target,
}: Props) => (
  <PopoutModal
    content={
      <Fragment>
        <Header>
          {headerBefore}
          <HeaderTitle>{headerTitle}</HeaderTitle>
          {headerAfter}
        </Header>
        <Body>{children}</Body>
        {footerContent ? <Footer>{footerContent}</Footer> : null}
      </Fragment>
    }
  >
    {target || (
      <Button>
        {buttonLabel}
        <DisclosureArrow />
      </Button>
    )}
  </PopoutModal>
);
