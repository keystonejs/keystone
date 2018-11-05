// @flow
import React from 'react';
import { Mutation } from 'react-apollo';
import { Button } from '@voussoir/ui/src/primitives/buttons';
import { Confirm } from '@voussoir/ui/src/primitives/modals';

type Props = {
  isOpen: boolean,
  itemIds: Array<string>,
  list: Object,
  item: Object,
  onDelete: (Promise<*>) => void,
};

export default function DeleteItemModal({ isOpen, item, list, onDelete }: Props) {
  return (
    <Mutation mutation={list.deleteMutation}>
      {(deleteItem, { loading }) => {
        return (
          <Confirm
            isOpen={isOpen}
            onKeyDown={e => {
              if (e.key === 'Escape' && !loading) {
                this.props.onClose();
              }
            }}
          >
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
              <Button
                variant="subtle"
                onClick={() => {
                  if (loading) return;
                  this.props.onClose();
                }}
              >
                Cancel
              </Button>
            </footer>
          </Confirm>
        );
      }}
    </Mutation>
  );
}
