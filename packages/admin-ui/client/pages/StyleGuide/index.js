/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';

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
    adminPath,
    match: {
      params: { page: currentPage },
    },
  } = props;
  return (
    <Container css={{ paddingBottom: 24 }}>
      <SecondaryNav>
        <FlexGroup>
          {pages.map(page => (
            <SecondaryNavItem
              key={page}
              isSelected={currentPage === page}
              to={`${adminPath}/style-guide/${page}`}
            >
              {upCase(page)}
            </SecondaryNavItem>
          ))}
        </FlexGroup>
      </SecondaryNav>
      <H1>Style Guide: {upCase(currentPage)}</H1>
      <Switch>
        <Route exact path={`${adminPath}/style-guide/palette`} component={PaletteGuide} />
        <Route exact path={`${adminPath}/style-guide/icons`} component={IconsGuide} />
        <Route path={`${adminPath}/style-guide/components`} component={ComponentsGuide} />
        <Route>
          <Redirect to={`${adminPath}/style-guide/components`} />
        </Route>
      </Switch>
    </Container>
  );
});
