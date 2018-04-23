import React, { Component, Fragment } from 'react';
import styled from 'react-emotion';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Link } from 'react-router-dom';

import Nav from '../../components/Nav';
import Footer from './Footer';
import { Container } from '@keystonejs/ui/src/primitives/layout';
import { Title } from '@keystonejs/ui/src/primitives/typography';
import { colors } from '@keystonejs/ui/src/theme';

// This import is loaded by the @keystone/field-views-loader loader.
// It imports all the views required for a keystone app by looking at the adminMetaData
import FieldViews from '../KEYSTONE_FIELD_VIEWS';

const getItemQuery = ({ list, itemId }) => gql`
  {
    ${list.itemQueryName}(id: "${itemId}") {
      id
      ${list.fields.map(field => field.path).join(' ')}
    }
  }
`;

const ItemId = styled.div({
  color: colors.N30,
  fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
});

const Form = styled.div({
  margin: '24px 0',
});

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
    const { list, adminPath } = this.props;
    const { item } = this.state;
    return (
      <Fragment>
        <Title>
          <Link to={`${adminPath}/${list.path}`}>{list.label}</Link>: {item.name}
        </Title>
        <ItemId>ID: {item.id}</ItemId>
        <Form>
          {list.fields.map(field => {
            const { Field } = FieldViews[list.key][field.path];
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
        <Footer
          onSave={this.saveChanges}
          onDelete={() => {}}
          onReset={() => {}}
        />
      </Fragment>
    );
  }
}

const ItemNotFound = ({ itemId, list, adminPath }) => (
  <Fragment>
    <Title>Item Not Found.</Title>
    <p>The item {itemId} does not exist.</p>
    <Link to={`${adminPath}/${list.path}`}>Back to {list.label}</Link>
    {' • '}
    <Link to={adminPath}>Go Home</Link>
  </Fragment>
);

const ItemPage = ({ list, itemId, adminPath }) => (
  <Fragment>
    <Nav />
    <Container>
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
            <ItemDetails list={list} item={item} key={itemId} adminPath={adminPath} />
          ) : (
            <ItemNotFound list={list} itemId={itemId} adminPath={adminPath} />
          );
        }}
      </Query>
    </Container>
  </Fragment>
);

export default ItemPage;
