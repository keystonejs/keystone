/* global ENABLE_DEV_FEATURES */

import React, { Fragment, useState } from 'react';
import styled from '@emotion/styled';

import { SettingsIcon, TrashcanIcon } from '@arch-ui/icons';
import { FlexGroup } from '@arch-ui/layout';
import { IconButton } from '@arch-ui/button';
import { colors, gridSize } from '@arch-ui/theme';

import { useList } from '../../providers/List';
import { useUIHooks } from '../../providers/Hooks';
import UpdateManyItemsModal from '../../components/UpdateManyItemsModal';
import DeleteManyItemsModal from '../../components/DeleteManyItemsModal';

export const ManageToolbar = styled.div(({ isVisible }) => ({
  height: 35,
  marginBottom: gridSize * 2,
  marginTop: gridSize,
  visibility: isVisible ? 'visible' : 'hidden',
}));
const SelectedCount = styled.div({
  color: colors.N40,
  marginRight: gridSize,
});

const UpdateItems = ({ selectedItems, onUpdateMany }) => {
  const [updateModalIsVisible, setUpdateModal] = useState(false);

  const { list } = useList();
  if (!list.access.update) return null;
  const handleUpdate = () => {
    setUpdateModal(false);
    onUpdateMany();
  };

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

const DeleteItems = ({ selectedItems, onDeleteMany }) => {
  const [deleteModalIsVisible, setDeleteModal] = useState(false);
  const { list } = useList();

  if (!list.access.update) return null;
  const handleDelete = () => {
    setDeleteModal(false);
    onDeleteMany();
  };

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

const renderActions = ({ ...props }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { listManageActions } = useUIHooks();

  if (!ENABLE_DEV_FEATURES) return null;

  if (listManageActions) {
    return listManageActions({ ...props, UpdateItems, DeleteItems });
  }
  return (
    <Fragment>
      <UpdateItems {...props} />
      <DeleteItems {...props} />
    </Fragment>
  );
};

export default function ListManage(props) {
  const { selectedItems } = props;

  const { pageSize, totalItems } = props;
  const selectedCount = selectedItems.length;

  return (
    <Fragment>
      <FlexGroup align="center">
        <SelectedCount>
          {selectedCount} of {Math.min(pageSize, totalItems)} Selected
        </SelectedCount>
        {renderActions({ ...props })}
      </FlexGroup>
    </Fragment>
  );
}
