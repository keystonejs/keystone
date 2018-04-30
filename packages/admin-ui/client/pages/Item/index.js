import React, { Component, Fragment } from 'react';
import styled from 'react-emotion';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';
import { Link, withRouter } from 'react-router-dom';

import Nav from '../../components/Nav';
import DeleteItemModal from '../../components/DeleteItemModal';
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

const getUpdateMutation = ({ list }) => {
  return gql`
    mutation delete(
      $id: String!,
      $data: ${list.key}UpdateInput)
    {
      ${list.updateMutationName}(id: $id, data: $data) {
        id
      }
    }
  `;
};

const ItemId = styled.div({
  color: colors.N30,
  fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
});

const Form = styled.div({
  margin: '24px 0',
});

// TODO: show updateInProgress and updateSuccessful / updateFailed UI

const ItemDetails = withRouter(
  class ItemDetails extends Component {
    constructor(props) {
      super();
      this.state = {
        item: props.item,
        showDeleteModal: false,
      };
    }
    componentDidMount() {
      this.mounted = true;
    }
    componentWillUnmount() {
      this.mounted = false;
    }
    showDeleteModal = () => {
      this.setState({ showDeleteModal: true });
    };
    closeDeleteModal = () => {
      this.setState({ showDeleteModal: false });
    };
    onDelete = () => {
      const { adminPath, history, list } = this.props;
      if (this.mounted) {
        this.setState({ showDeleteModal: false });
      }
      history.push(`${adminPath}/${list.path}`);
    };
    onReset = () => {
      this.setState({
        item: this.props.item,
      });
    };
    onChange = (field, value) => {
      const { item } = this.state;
      this.setState({
        item: {
          ...item,
          [field.path]: value,
        },
      });
    };
    renderDeleteModal() {
      const { showDeleteModal } = this.state;
      if (!showDeleteModal) return;

      const { item, list } = this.props;

      return (
        <DeleteItemModal
          item={item}
          list={list}
          onClose={this.closeDeleteModal}
          onDelete={this.onDelete}
        />
      );
    }
    onSave = () => {
      const { onUpdate, updateItem } = this.props;
      // TODO: smarter selection of data to send, should come from field types ?
      const { id, __typename, ...data } = this.state.item;
      updateItem({ variables: { id, data } }).then(onUpdate);
    };
    render() {
      const { adminPath, list } = this.props;
      const { item } = this.state;
      return (
        <Fragment>
          <Title>
            <Link to={`${adminPath}/${list.path}`}>{list.label}</Link>:{' '}
            {item.name}
          </Title>
          <ItemId>ID: {item.id}</ItemId>
          <Form>
            {list.fields.map((field, i) => {
              const { Field } = FieldViews[list.key][field.path];
              return (
                <Field
                  autoFocus={!i}
                  field={field}
                  item={item}
                  key={field.path}
                  onChange={this.onChange}
                />
              );
            })}
          </Form>
          <Footer
            onSave={this.onSave}
            onDelete={this.showDeleteModal}
            onReset={this.onReset}
          />
          {this.renderDeleteModal()}
        </Fragment>
      );
    }
  }
);

const ItemNotFound = ({ itemId, list, adminPath }) => (
  <Fragment>
    <Title>Item Not Found.</Title>
    <p>The item {itemId} does not exist.</p>
    <Link to={`${adminPath}/${list.path}`}>Back to {list.label}</Link>
    {' • '}
    <Link to={adminPath}>Go Home</Link>
  </Fragment>
);

const ItemPage = ({ list, itemId, adminPath }) => {
  const itemQuery = getItemQuery({ list, itemId });
  return (
    <Fragment>
      <Nav />
      <Container>
        <Query query={itemQuery}>
          {({ loading, error, data, refetch }) => {
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
            const updateMutation = getUpdateMutation({ list });
            return item ? (
              <Mutation mutation={updateMutation}>
                {(updateItem, { loading: updateInProgress }) => (
                  <ItemDetails
                    adminPath={adminPath}
                    item={item}
                    key={itemId}
                    list={list}
                    onUpdate={refetch}
                    updateInProgress={updateInProgress}
                    updateItem={updateItem}
                  />
                )}
              </Mutation>
            ) : (
              <ItemNotFound adminPath={adminPath} itemId={itemId} list={list} />
            );
          }}
        </Query>
      </Container>
    </Fragment>
  );
};

export default ItemPage;
