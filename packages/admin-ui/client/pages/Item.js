import React, { Component, Fragment } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Link } from 'react-router-dom';

import Nav from '../components/Nav';
import { Page } from '../primitives/layout';
import { H1 } from '../primitives/typography';

const getItemQuery = ({ list, itemId }) => gql`
  {
    ${list.itemQueryName}(id: "${itemId}") {
      id
      name
    }
  }
`;

class ItemDetails extends Component {
  render() {
    const { list, item } = this.props;
    return (
      <Fragment>
        <H1>
          <Link to={`/admin/${list.path}`}>{list.label}</Link>: {item.name}
        </H1>
      </Fragment>
    );
  }
}

const ItemNotFound = ({ itemId, list }) => (
  <Fragment>
    <H1>Item Not Found.</H1>
    <p>The item {itemId} does not exist.</p>
    <Link to={`/admin/${list.path}`}>Back to {list.label}</Link>
    {' • '}
    <Link to="/admin">Go Home</Link>
  </Fragment>
);

const ItemPage = ({ list, itemId }) => (
  <Fragment>
    <Nav />
    <Page>
      <Query query={getItemQuery({ list, itemId })}>
        {({ loading, error, data }) => {
          if (loading) return 'Loading...';
          if (error) return `Error! ${error.message}`;
          const item = data[list.itemQueryName];

          return item ? (
            <ItemDetails list={list} item={item} />
          ) : (
            <ItemNotFound list={list} itemId={itemId} />
          );
        }}
      </Query>
    </Page>
  </Fragment>
);

export default ItemPage;
