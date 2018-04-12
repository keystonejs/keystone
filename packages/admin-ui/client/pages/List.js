import React, { Component, Fragment } from 'react';
import styled from 'react-emotion';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Link } from 'react-router-dom';

import Nav from '../components/Nav';
import { Page } from '@keystonejs/ui/src/primitives/layout';
import { Title } from '@keystonejs/ui/src/primitives/typography';

const getListQuery = ({ list }) => gql`
  {
    ${list.listQueryName} {
      id
      name
    }
  }
`;

const Table = styled('table')`
  border-collapse: collapse;
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;
`;

const HeaderCell = styled('td')`
  border-bottom: 2px solid rgba(0, 0, 0, 0.06);
  color: #999;
  padding-bottom: 8px;
  display: table-cell;
  font-weight: normal;
  text-align: left;
  vertical-align: bottom;
`;

const BodyCell = styled('td')`
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding: 8px 0;
`;

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
  render() {
    const { list } = this.props;
    return (
      <Query query={getListQuery({ list })}>
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
