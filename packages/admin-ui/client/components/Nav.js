import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import styled from 'react-emotion';

import { colors } from '@keystonejs/ui/src/theme';
import AdminMetaProvider from '../providers/AdminMeta';

const NavBar = styled.div({
  backgroundColor: colors.primary,
  color: 'white',
});

const Container = styled.div({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  margin: 'auto',
  maxWidth: 1160,
  paddingLeft: 10,
  paddingRight: 10,
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
  padding: 20,
  textDecoration: 'none',

  ':hover': {
    textDecoration: 'underline',
  },
});

class Home extends Component {
  render() {
    const { lists, listKeys } = this.props;
    return (
      <NavBar>
        <Container>
          <Group>
            <NavItem to="/admin">Home</NavItem>
            {listKeys.map(key => {
              const list = lists[key];
              return (
                <Fragment key={key}>
                  <Separator />
                  <NavItem to={`/admin/${list.path}`}>{list.label}</NavItem>
                </Fragment>
              );
            })}
          </Group>
          <Group>
            <NavItem to="/admin/signin">Sign Out</NavItem>
          </Group>
        </Container>
      </NavBar>
    );
  }
}

export default () => (
  <AdminMetaProvider>{props => <Home {...props} />}</AdminMetaProvider>
);
