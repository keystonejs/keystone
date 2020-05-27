/* global ENABLE_DEV_FEATURES */

import React, { Fragment, useState } from 'react';

import { IconButton } from '@arch-ui/button';
import { SettingsIcon } from '@arch-ui/icons/src';

import { useList } from '../providers/List';
import { UpdateManyItemsModal } from '../../components';
import { useListSelect } from '../pages/List/dataHooks';

const UpdateItems = () => {
  const [updateModalIsVisible, setUpdateModal] = useState(false);
  const {
    list,
    listData: { items },
    query,
  } = useList();
  const [selectedItems] = useListSelect(items);

  const handleUpdate = () => {
    setUpdateModal(false);
    query.refetch();
  };

  if (!(ENABLE_DEV_FEATURES && list.access.update)) return null;

  return (
    <Fragment>
      <IconButton
        appearance="primary"
        icon={SettingsIcon}
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
