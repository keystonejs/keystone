// @flow
import React from 'react';
import { Mutation } from 'react-apollo';
import { Button } from '@arch-ui/button';
import Confirm from '@arch-ui/confirm';
import { useApolloClient } from 'react-apollo-hooks';

type Props = {
  isOpen: boolean,
  itemIds: Array<string>,
  list: Object,
  item: Object,
  onClose: any => void,
  onDelete: (Promise<*>) => void,
};

export default function DeleteItemModal({ isOpen, item, list, onClose, onDelete }: Props) {
  let client = useApolloClient();
  return (
    <Mutation
      onCompleted={() => {
        client.resetStore();
      }}
      mutation={list.deleteMutation}
    >
      {(deleteItem, { loading }) => {
        return (
          <Confirm
            isOpen={isOpen}
            onKeyDown={e => {
              if (e.key === 'Escape' && !loading) {
                onClose();
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
                  onClose();
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
