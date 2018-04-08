import React, { Component, Fragment } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Link } from 'react-router-dom';

import Nav from '../components/Nav';
import { Page } from '../primitives/layout';
import { H1 } from '../primitives/typography';

const getListQuery = ({ list }) => gql`
  {
    ${list.listQueryName} {
      id
      name
    }
  }
`;

class ItemRow extends Component {
  render() {
    const { list, item } = this.props;
    return (
      <div>
        <Link to={`/admin/${list.path}/${item.id}`}>{item.name}</Link>
      </div>
    );
  }
}

class ItemsList extends Component {
  render() {
    const { list } = this.props;
    return (
      <Query query={getListQuery({ list })}>
        {({ loading, error, data }) => {
          if (loading) return 'Loading...';
          if (error) return `Error! ${error.message}`;
          const items = data[list.listQueryName];

          return (
            <div>
              {items.map(item => (
                <ItemRow key={item.id} list={list} item={item} />
              ))}
            </div>
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
      <H1>{list.label}</H1>
      <ItemsList list={list} />
    </Page>
  </Fragment>
);

export default ListPage;
