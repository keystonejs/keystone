import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import styled from 'react-emotion';

import { colors } from '@keystonejs/ui/src/theme';
import { Container } from '@keystonejs/ui/src/primitives/layout';
import AdminMetaProvider from '../providers/AdminMeta';

const padding = 20;

const NavBar = styled.div({
  backgroundColor: colors.primary,
  color: 'white',
});
const FlexProvider = styled.div({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  marginLeft: -padding,
  marginRight: -padding,
});
const Group = styled.div({
  alignItems: 'center',
  display: 'flex',
});
const Separator = styled.div({
  borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
  height: 20,
});
const NavItem = styled(Link)({
  color: 'white',
  padding: padding,
  textDecoration: 'none',

  ':hover': {
    textDecoration: 'underline',
  },
});

class Home extends Component {
  render() {
    const { lists, listKeys, adminPath } = this.props;
    return (
      <NavBar>
        <Container>
          <FlexProvider>
            <Group>
              <NavItem to={adminPath}>Home</NavItem>
              {listKeys.map(key => {
                const list = lists[key];
                return (
                  <Fragment key={key}>
                    <Separator />
                    <NavItem to={`${adminPath}/${list.path}`}>{list.label}</NavItem>
                  </Fragment>
                );
              })}
            </Group>
            <Group>
              <NavItem to={`${adminPath}/signin`}>Sign Out</NavItem>
            </Group>
          </FlexProvider>
        </Container>
      </NavBar>
    );
  }
}

export default () => (
  <AdminMetaProvider>{props => <Home {...props} />}</AdminMetaProvider>
);
