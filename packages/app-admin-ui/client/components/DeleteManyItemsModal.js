import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { Button } from '@arch-ui/button';
import Confirm from '@arch-ui/confirm';

export default function DeleteManyModal({ isOpen, itemIds, list, onClose, onDelete }) {
  const [deleteItems, { loading }] = useMutation(list.deleteManyMutation);
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
}
