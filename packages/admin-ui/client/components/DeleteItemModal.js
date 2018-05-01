import React, { Component, Fragment } from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { Dialog } from '@keystonejs/ui/src/primitives/modals';

const getDeleteMutation = ({ list }) => {
  return gql`
    mutation delete($id: String!) {
      ${list.deleteMutationName}(id: $id) {
        id
      }
    }
  `;
};

export default class DeleteItemModal extends Component {
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
    const { item, list } = this.props;
    const deleteMutation = getDeleteMutation({ list });
    return (
      <Mutation mutation={deleteMutation}>
        {(deleteItem, { loading }) => {
          this.isLoading = loading;
          return (
            <Dialog
              isOpen
              onClose={this.onClose}
              onKeyDown={this.onKeyDown}
              width={400}
            >
              <p style={{ marginTop: 0 }}>
                Are you sure you want to delete{' '}
                <strong>{item.name || item.id}</strong>?
              </p>
              <footer>
                <Button
                  appearance="danger"
                  onClick={() => {
                    if (loading) return;
                    deleteItem({ variables: { id: item.id } }).then(
                      this.props.onDelete
                    );
                  }}
                >
                  Delete
                </Button>
                <Button variant="subtle" onClick={this.onClose}>
                  Cancel
                </Button>
              </footer>
            </Dialog>
          );
        }}
      </Mutation>
    );
  }
}
