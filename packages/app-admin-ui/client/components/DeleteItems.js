import React, { Fragment, useState } from 'react';

import { TrashcanIcon } from '@primer/octicons-react';
import { IconButton } from '@arch-ui/button';

import DeleteManyItemsModal from './DeleteManyItemsModal';
import { useList } from '../providers/List';

const DeleteItems = () => {
  const [deleteModalIsVisible, setDeleteModal] = useState(false);
  const { list, query, selectedItems, setSelectedItems } = useList();

  const handleDelete = () => {
    setDeleteModal(false);
    query.refetch();
    setSelectedItems([]);
  };

  if (!list.access.update) return null;

  return (
    <Fragment>
      <IconButton
        appearance="danger"
        icon={TrashcanIcon}
        onClick={() => setDeleteModal(true)}
        variant="nuance"
        data-test-name="delete"
      >
        Delete
      </IconButton>
      <DeleteManyItemsModal
        isOpen={deleteModalIsVisible}
        itemIds={selectedItems}
        list={list}
        onClose={() => setDeleteModal(false)}
        onDelete={handleDelete}
      />
    </Fragment>
  );
};

export default DeleteItems;
