/* global ENABLE_DEV_FEATURES */

import React, { Fragment, useState } from 'react';

import { IconButton } from '@arch-ui/button';
import { GearIcon } from '@primer/octicons-react';

import { useList } from '../providers/List';
import { UpdateManyItemsModal } from '../../components';

const UpdateItems = () => {
  const [updateModalIsVisible, setUpdateModal] = useState(false);
  const { list, query, selectedItems } = useList();

  const handleUpdate = () => {
    setUpdateModal(false);
    query.refetch();
  };

  if (!(ENABLE_DEV_FEATURES && list.access.update)) return null;

  return (
    <Fragment>
      <IconButton
        appearance="primary"
        icon={GearIcon}
        onClick={() => setUpdateModal(true)}
        variant="nuance"
        data-test-name="update"
      >
        Update
      </IconButton>
      <UpdateManyItemsModal
        isOpen={updateModalIsVisible}
        items={selectedItems}
        list={list}
        onClose={() => setUpdateModal(false)}
        onUpdate={handleUpdate}
      />
    </Fragment>
  );
};

export default UpdateItems;
