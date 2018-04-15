import React, { Component, Fragment } from 'react';
import styled from 'react-emotion';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Link } from 'react-router-dom';

import Nav from '../components/Nav';
import { Page } from '@keystonejs/ui/src/primitives/layout';
import { Title } from '@keystonejs/ui/src/primitives/typography';
import { PrimaryButton } from '@keystonejs/ui/src/primitives/buttons';

import FieldTypes from '../fields';

const getItemQuery = ({ list, itemId }) => gql`
  {
    ${list.itemQueryName}(id: "${itemId}") {
      id
      ${list.fields.map(field => field.path).join(' ')}
    }
  }
`;

const ItemId = styled('div')`
  color: #aaa;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
`;

const Form = styled('div')`
  margin: 24px 0;
`;

const Toolbar = styled('div')`
  box-shadow: rgba(0, 0, 0, 0.1) 0px -2px 0px;
  margin: 24px 0;
  padding: 24px 0;
`;

class ItemDetails extends Component {
  constructor(props) {
    super();
    this.state = { item: props.item };
  }
  onChange = (field, value) => {
    const { item } = this.state;
    this.setState({
      item: {
        ...item,
        [field.path]: value,
      },
    });
  };
  saveChanges = () => {};
  render() {
    const { list } = this.props;
    const { item } = this.state;
    return (
      <Fragment>
        <Title>
          <Link to={`/admin/${list.path}`}>{list.label}</Link>: {item.name}
        </Title>
        <ItemId>ID: {item.id}</ItemId>
        <Form>
          {list.fields.map(field => {
            const { Field } = FieldTypes[field.type];
            return (
              <Field
                item={item}
                field={field}
                key={field.path}
                onChange={this.onChange}
              />
            );
          })}
        </Form>
        <Toolbar>
          <PrimaryButton onClick={this.saveChanges}>Save Changes</PrimaryButton>
        </Toolbar>
      </Fragment>
    );
  }
}

const ItemNotFound = ({ itemId, list }) => (
  <Fragment>
    <Title>Item Not Found.</Title>
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
          if (loading) return <Title>Loading...</Title>;
          if (error) {
            return (
              <Fragment>
                <Title>Error</Title>
                <p>{error.message}</p>
              </Fragment>
            );
          }

          const item = data[list.itemQueryName];
          return item ? (
            <ItemDetails list={list} item={item} key={itemId} />
          ) : (
            <ItemNotFound list={list} itemId={itemId} />
          );
        }}
      </Query>
    </Page>
  </Fragment>
);

export default ItemPage;
