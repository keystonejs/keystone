import React, { Component, Fragment } from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { Link } from 'react-router-dom';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { Dialog } from '@keystonejs/ui/src/primitives/modals';

import {
  BodyCell,
  HeaderCell,
  Table,
} from '@keystonejs/ui/src/primitives/tables';

const getDeleteMutation = ({ list }) => {
  return gql`
    mutation delete($id: String!) {
      ${list.deleteMutationName}(id: $id) {
        id
      }
    }
  `;
};

class DeleteItemModal extends Component {
  onClose = () => {
    if (this.isLoading) return;
    this.props.onClose();
  };
  onKeyDown = e => {
    if (e.key === 'Escape') {
      this.props.onClose();
    }
  };
  render() {
    const { item, list, refetchQueries } = this.props;
    const deleteMutation = getDeleteMutation({ list });
    return (
      <Mutation mutation={deleteMutation} refetchQueries={refetchQueries}>
        {(deleteItem, { loading }) => {
          this.isLoading = loading;
          return (
            <Dialog
              isOpen
              onClose={this.onClose}
              heading={`Delete ${list.singular}`}
              onKeyDown={this.onKeyDown}
              footer={
                <Fragment>
                  <Button
                    appearance="danger"
                    onClick={() => {
                      if (loading) return;
                      deleteItem({ variables: { id: item.id } }).then(
                        this.props.onClose
                      );
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    appearance="primary"
                    variant="subtle"
                    onClick={this.onClose}
                  >
                    Cancel
                  </Button>
                </Fragment>
              }
            >
              <p>
                Are you sure you want to delete{' '}
                <strong>{item.name || item.id}</strong>?
              </p>
            </Dialog>
          );
        }}
      </Mutation>
    );
  }
}

class ListTableRow extends Component {
  state = {
    showDeleteModal: false,
  };
  componentDidMount() {
    this.isMounted = true;
  }
  componentWillUnmount() {
    this.isMounted = false;
  }
  showDeleteModal = () => {
    this.setState({ showDeleteModal: true });
  };
  closeDeleteModal = () => {
    if (!this.isMounted) return;
    this.setState({ showDeleteModal: false });
  };
  renderDeleteModal() {
    const { showDeleteModal } = this.state;
    if (!showDeleteModal) return;

    const { item, list, query } = this.props;

    return (
      <DeleteItemModal
        item={item}
        list={list}
        onClose={this.closeDeleteModal}
        refetchQueries={() => [{ query }]}
      />
    );
  }
  render() {
    const { link, item, fields } = this.props;

    return (
      <tr>
        <BodyCell>
          <button onClick={this.showDeleteModal}>x</button>
          {this.renderDeleteModal()}
        </BodyCell>
        {fields.map(({ path }, index) => (
          <BodyCell key={path}>
            {!index ? <Link to={link}>{item[path]}</Link> : item[path]}
          </BodyCell>
        ))}
      </tr>
    );
  }
}

export default class ListTable extends Component {
  render() {
    const {
      adminPath,
      fields,
      items,
      list,
      noResultsMessage,
      query,
    } = this.props;

    return items.length ? (
      <Table>
        <colgroup>
          <col width="40" />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            {fields.map(({ label }, i) => (
              <HeaderCell colSpan={i ? 1 : 2} key={label}>
                {label}
              </HeaderCell>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <ListTableRow
              key={item.id}
              link={`${adminPath}/${list.path}/${item.id}`}
              list={list}
              fields={fields}
              item={item}
              query={query}
            />
          ))}
        </tbody>
      </Table>
    ) : (
      noResultsMessage
    );
  }
}
