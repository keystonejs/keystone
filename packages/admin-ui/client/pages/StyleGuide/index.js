/** @jsx jsx */
import { jsx } from '@emotion/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { Link } from 'next-prefixed';

import ComponentsGuide from './Components';
import IconsGuide from './Icons';
import PaletteGuide from './Palette';

import { Container, FlexGroup } from '@arch-ui/layout';
import { SecondaryNav, SecondaryNavItem } from '@arch-ui/navbar';
import { H1 } from '@arch-ui/typography';

const pages = ['components', 'palette', 'icons'];
const upCase = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

export default withRouter(function StyleGuide(props) {
  const {
    match: {
      params: { page: currentPage },
    },
  } = props;
  return (
    <Container css={{ paddingBottom: 24 }}>
      <SecondaryNav>
        <FlexGroup>
          {pages.map(page => (
            <Link passHref href={`/style-guide/${page}`}>
              <SecondaryNavItem key={page} isSelected={currentPage === page} as="a">
                {upCase(page)}
              </SecondaryNavItem>
            </Link>
          ))}
        </FlexGroup>
      </SecondaryNav>
      <H1>Style Guide: {upCase(currentPage)}</H1>
      <Switch>
        <Route exact path="/style-guide/palette" component={PaletteGuide} />
        <Route exact path="/style-guide/icons" component={IconsGuide} />
        <Route path="/style-guide/components" component={ComponentsGuide} />
        <Route>
          <Redirect to="/style-guide/components" />
        </Route>
      </Switch>
    </Container>
  );
});
