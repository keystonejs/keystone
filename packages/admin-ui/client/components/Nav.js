import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import styled from 'react-emotion';

import { colors } from '@keystonejs/ui/src/theme';
import AdminMetaProvider from '../providers/AdminMeta';

const NavBar = styled.div({
  backgroundColor: colors.primary,
  color: 'white',
});

const Container = styled('div')`
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  margin: auto;
  padding-left: 10px;
  padding-right: 10px;
  max-width: 1160px;
`;

const Group = styled('div')`
  display: flex;
  align-items: center;
`;

const NavItem = styled(Link)`
  padding: 20px;
  color: white;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Separator = styled('div')`
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  height: 20px;
`;

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
