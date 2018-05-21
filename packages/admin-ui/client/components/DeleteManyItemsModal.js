import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { Dialog } from '@keystonejs/ui/src/primitives/modals';

export default class DeleteManyModal extends Component {
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
    const { isOpen, itemIds, list, onDelete } = this.props;

    return (
      <Mutation mutation={list.deleteManyMutation}>
        {(deleteItems, { loading }) => {
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
                <strong>{list.formatCount(itemIds)}</strong>?
              </p>
              <footer>
                <Button
                  appearance="danger"
                  onClick={() => {
                    if (loading) return;
                    deleteItems({
                      variables: { ids: itemIds },
                    }).then(onDelete);
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
