import React, { Component, Fragment } from 'react';
import styled from 'react-emotion';
import { Link, Redirect, Route, Switch, withRouter } from 'react-router-dom';

import Nav from '../../components/Nav';

import ComponentsGuide from './Components';
import IconsGuide from './Icons';
import PaletteGuide from './Palette';

import { Container, FlexGroup } from '@keystonejs/ui/src/primitives/layout';
import { colors } from '@keystonejs/ui/src/theme';
import { Title } from '@keystonejs/ui/src/primitives/typography';

const SubNav = styled.div({
  backgroundColor: colors.N05,
  borderBottom: `1px solid ${colors.N10}`,
});
const SubnavItem = ({ isSelected, ...props }) => (
  <Link
    css={{
      display: 'inline-block',
      boxShadow: isSelected ? '0 2px' : null,
      color: isSelected ? colors.text : colors.N60,
      cursor: 'pointer',
      fontWeight: isSelected ? 500 : 'normal',
      marginRight: 10,
      paddingBottom: 10,
      paddingTop: 10,

      ':hover': {
        color: colors.text,
        textDecoration: 'none',
      },
    }}
    {...props}
  />
);

const pages = ['components', 'palette', 'icons'];
const upCase = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

export default withRouter(
  class StyleGuide extends Component<*> {
    render() {
      const {
        adminPath,
        match: { params: { page: currentPage } },
      } = this.props;
      return (
        <Fragment>
          <Nav />
          <SubNav>
            <Container>
              <FlexGroup>
                {pages.map(page => (
                  <SubnavItem
                    key={page}
                    isSelected={currentPage === page}
                    to={`${adminPath}/style-guide/${page}`}
                  >
                    {upCase(page)}
                  </SubnavItem>
                ))}
              </FlexGroup>
            </Container>
          </SubNav>
          <Container css={{ paddingBottom: 200 }}>
            <Title>Style Guide: {upCase(currentPage)}</Title>
            <Switch>
              <Route
                exact
                path={`${adminPath}/style-guide/palette`}
                component={PaletteGuide}
              />
              <Route
                exact
                path={`${adminPath}/style-guide/icons`}
                component={IconsGuide}
              />
              <Route
                path={`${adminPath}/style-guide/components`}
                component={ComponentsGuide}
              />
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
