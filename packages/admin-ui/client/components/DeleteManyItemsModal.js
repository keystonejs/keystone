import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import { Button } from '@voussoir/ui/src/primitives/buttons';
import { Confirm } from '@voussoir/ui/src/primitives/modals';

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
            <Confirm isOpen={isOpen} onKeyDown={this.onKeyDown}>
              <p style={{ marginTop: 0 }}>
                Are you sure you want to delete <strong>{list.formatCount(itemIds)}</strong>?
              </p>
              <footer>
                <Button
                  appearance="danger"
                  variant="ghost"
                  onClick={() => {
                    if (loading) return;
                    onDelete(
                      deleteItems({
                        variables: { ids: itemIds },
                      })
                    );
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
