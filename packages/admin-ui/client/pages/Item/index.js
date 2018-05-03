import React, { Component, Fragment } from 'react';
import styled from 'react-emotion';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';
import { Link, withRouter } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import Nav from '../../components/Nav';
import DeleteItemModal from '../../components/DeleteItemModal';
import Footer from './Footer';
import { CheckIcon, ClippyIcon } from '@keystonejs/icons';
import { Container, FlexGroup } from '@keystonejs/ui/src/primitives/layout';
import { Title } from '@keystonejs/ui/src/primitives/typography';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { colors } from '@keystonejs/ui/src/theme';

// This import is loaded by the @keystone/field-views-loader loader.
// It imports all the views required for a keystone app by looking at the adminMetaData
import FieldTypes from '../../FIELD_TYPES';

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
  fontFamily: 'Monaco, Consolas, monospace',
  fontSize: '0.85em',
});

const Form = styled.div({
  margin: '24px 0',
});

// TODO: show updateInProgress and updateSuccessful / updateFailed UI

const ItemDetails = withRouter(
  class ItemDetails extends Component {
    state = {
      copyText: '',
      item: this.props.item,
      showDeleteModal: false,
    };
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
    onCopy = text => () => {
      this.setState({ copyText: text }, () => {
        setTimeout(() => {
          this.setState({ copyText: '' });
        }, 500);
      });
    };
    render() {
      const { adminPath, list, getListByKey } = this.props;
      const { copyText, item } = this.state;
      const isCopied = copyText === item.id;
      const CopyIcon = isCopied ? CheckIcon : ClippyIcon;

      return (
        <Fragment>
          <Title>
            <Link to={`${adminPath}/${list.path}`}>{list.label}</Link>:{' '}
            {item.name}
          </Title>
          <FlexGroup align="center" isContiguous>
            <ItemId>ID: {item.id}</ItemId>
            <CopyToClipboard text={item.id} onCopy={this.onCopy(item.id)}>
              <Button variant="subtle">
                <CopyIcon
                  css={{ color: isCopied ? colors.create : 'inherit' }}
                />
              </Button>
            </CopyToClipboard>
          </FlexGroup>
          <Form>
            {list.fields.map((field, i) => {
              const { Field } = FieldTypes[list.key][field.path];
              return (
                <Field
                  autoFocus={!i}
                  field={field}
                  item={item}
                  list={list}
                  getListByKey={getListByKey}
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

const ItemPage = ({ list, itemId, adminPath, getListByKey }) => {
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
                    getListByKey={getListByKey}
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
