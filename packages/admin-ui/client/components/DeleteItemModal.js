import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { Dialog } from '@keystonejs/ui/src/primitives/modals';

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
    const { isOpen, item, list, onDelete } = this.props;

    return (
      <Mutation mutation={list.deleteMutation}>
        {(deleteItem, { loading }) => {
          this.isLoading = loading;
          return (
            <Dialog
              isOpen={isOpen}
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
                    onDelete(deleteItem({ variables: { id: item.id } }));
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
