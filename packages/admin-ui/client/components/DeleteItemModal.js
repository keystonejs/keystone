import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import { Button } from '@voussoir/ui/src/primitives/buttons';
import { Confirm } from '@voussoir/ui/src/primitives/modals';

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
            <Confirm isOpen={isOpen} onKeyDown={this.onKeyDown}>
              <p style={{ marginTop: 0 }}>
                Are you sure you want to delete <strong>{item._label_}</strong>?
              </p>
              <footer>
                <Button
                  appearance="danger"
                  variant="ghost"
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
            </Confirm>
          );
        }}
      </Mutation>
    );
  }
}
