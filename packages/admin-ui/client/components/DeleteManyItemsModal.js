// @flow
import React from 'react';
import { Mutation } from 'react-apollo';
import { Button } from '@arch-ui/button';
import Confirm from '@arch-ui/confirm';

type Props = {
  isOpen: boolean,
  itemIds: Array<string>,
  list: Object,
  onClose: () => void,
  onDelete: (Promise<*>) => void,
};

export default function DeleteManyModal({ isOpen, itemIds, list, onClose, onDelete }: Props) {
  return (
    <Mutation mutation={list.deleteManyMutation}>
      {(deleteItems, { loading }) => {
        return (
          <Confirm
            isOpen={isOpen}
            onKeyDown={event => {
              if (event.key === 'Escape' && !loading) {
                onClose();
              }
            }}
          >
            <p style={{ marginTop: 0 }}>
              Are you sure you want to delete <strong>{list.formatCount(itemIds)}</strong>?
            </p>
            <footer>
              <Button
                appearance="danger"
                variant="ghost"
                onClick={() => {
                  if (loading) return;
                  deleteItems({
                    variables: { ids: itemIds },
                  }).then(onDelete);
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
