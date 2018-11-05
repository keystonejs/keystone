/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, Fragment } from 'react';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';

import Nav from '../../components/Nav';

import ComponentsGuide from './Components';
import IconsGuide from './Icons';
import PaletteGuide from './Palette';

import { Container, FlexGroup } from '@voussoir/ui/src/primitives/layout';
import { SecondaryNav, SecondaryNavItem } from '@voussoir/ui/src/primitives/navigation';
import { H1 } from '@voussoir/ui/src/primitives/typography';

const pages = ['components', 'palette', 'icons'];
const upCase = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

export default withRouter(
  class StyleGuide extends Component<*> {
    render() {
      const {
        adminPath,
        match: {
          params: { page: currentPage },
        },
      } = this.props;
      return (
        <Fragment>
          <Nav />
          <Container css={{ paddingBottom: 200, width: '100%' }}>
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
        </Fragment>
      );
    }
  }
);
