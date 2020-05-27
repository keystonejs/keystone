import React, { Fragment, useState } from 'react';

import { TrashcanIcon } from '@arch-ui/icons';
import { IconButton } from '@arch-ui/button';

import DeleteManyItemsModal from './DeleteManyItemsModal';
import { useList } from '../providers/List';
import { useListSelect } from '../pages/List/dataHooks';

const DeleteItems = () => {
  const [deleteModalIsVisible, setDeleteModal] = useState(false);
  const {
    list,
    listData: { items },
    query,
  } = useList();
  const [selectedItems, onSelectChange] = useListSelect(items);

  const handleDelete = () => {
    setDeleteModal(false);
    query.refetch();
    onSelectChange([]);
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
