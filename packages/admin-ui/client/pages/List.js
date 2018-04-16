import React, { Component, Fragment } from 'react';
import styled from 'react-emotion';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Link } from 'react-router-dom';

import Nav from '../components/Nav';
import { Page } from '@keystonejs/ui/src/primitives/layout';
import { Title } from '@keystonejs/ui/src/primitives/typography';
import { colors } from '@keystonejs/ui/src/theme';

const getListQueryArguments = search => (search ? `(search: "${search}")` : '');

const getListQuery = ({ list, search }) => gql`
  {
    ${list.listQueryName}${getListQueryArguments(search)} {
      id
      name
    }
  }
`;

const Table = styled.table({
  borderCollapse: 'collapse',
  borderSpacing: 0,
  tableLayout: 'fixed',
  width: '100%',
});

const HeaderCell = styled.td({
  borderBottom: '2px solid rgba(0, 0, 0, 0.06)',
  color: colors.N40,
  paddingBottom: 8,
  display: 'table-cell',
  fontWeight: 'normal',
  textAlign: 'left',
  verticalAlign: 'bottom',
});

const BodyCell = styled.td({
  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
  padding: '8px 0',
});

class ItemRow extends Component {
  render() {
    const { list, item } = this.props;
    return (
      <tr>
        <BodyCell>
          <Link to={`/admin/${list.path}/${item.id}`}>{item.name}</Link>
        </BodyCell>
      </tr>
    );
  }
}

class ItemsList extends Component {
  state = {
    search: '',
  };
  render() {
    const { list } = this.props;
    const { search } = this.state;
    return (
      <Query query={getListQuery({ list, search })}>
        {({ loading, error, data }) => {
          if (loading) return <Title>Loading...</Title>;
          if (error) {
            return (
              <Fragment>
                <Title>Error</Title>
                <p>{error.message}</p>
              </Fragment>
            );
          }
          const items = data[list.listQueryName];
          return (
            <Table>
              <thead>
                <tr>
                  <HeaderCell>Name</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <ItemRow key={item.id} list={list} item={item} />
                ))}
              </tbody>
            </Table>
          );
        }}
      </Query>
    );
  }
}

const ListPage = ({ list }) => (
  <Fragment>
    <Nav />
    <Page>
      <Title>{list.label}</Title>
      <ItemsList list={list} />
    </Page>
  </Fragment>
);

export default ListPage;
