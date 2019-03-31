/* global ENABLE_DEV_FEATURES */

import React, { Fragment, useState } from 'react';
import styled from '@emotion/styled';

import { SettingsIcon, TrashcanIcon } from '@arch-ui/icons';
import { FlexGroup } from '@arch-ui/layout';
import { IconButton } from '@arch-ui/button';
import { colors, gridSize } from '@arch-ui/theme';

import UpdateManyItemsModal from '../../components/UpdateManyItemsModal';
import DeleteManyItemsModal from '../../components/DeleteManyItemsModal';

export const ManageToolbar = styled.div(({ isVisible }) => ({
  display: 'flex',
  height: 35,
  marginBottom: gridSize * 2,
  marginTop: gridSize,
  visibility: isVisible ? 'visible' : 'hidden',
}));
const SelectedCount = styled.div({
  color: colors.N60,
  marginRight: gridSize,
});

type Props = {
  list: Object,
  onDeleteMany: (*) => void,
  onUpdateMany: (*) => void,
  selectedItems: Array<string>,
};

export default function ListManage(props: Props) {
  const { onDeleteMany, onUpdateMany, selectedItems } = props;
  const [deleteModalIsVisible, toggleDeleteModal] = useState(false);
  const [updateModalIsVisible, toggleUpdateModal] = useState(false);

  const handleDelete = () => {
    toggleDeleteModal(false);
    onDeleteMany();
  };
  const handleUpdate = () => {
    toggleUpdateModal(false);
    onUpdateMany();
  };

  const { list, pageSize, totalItems } = props;
  const selectedCount = selectedItems.length;

  return (
    <Fragment>
      <FlexGroup align="center">
        <SelectedCount>
          {selectedCount} of {Math.min(pageSize, totalItems)} Selected
        </SelectedCount>
        {ENABLE_DEV_FEATURES ? (
          list.access.update ? (
            <IconButton
              appearance="primary"
              icon={SettingsIcon}
              onClick={() => toggleUpdateModal(true)}
              variant="ghost"
              data-test-name="update"
            >
              Update
            </IconButton>
          ) : null
        ) : null}
        {list.access.update ? (
          <IconButton
            appearance="danger"
            icon={TrashcanIcon}
            onClick={() => toggleDeleteModal(true)}
            variant="ghost"
            data-test-name="delete"
          >
            Delete
          </IconButton>
        ) : null}
      </FlexGroup>

      <UpdateManyItemsModal
        isOpen={updateModalIsVisible}
        items={selectedItems}
        list={list}
        onClose={() => toggleUpdateModal(false)}
        onUpdate={handleUpdate}
      />
      <DeleteManyItemsModal
        isOpen={deleteModalIsVisible}
        itemIds={selectedItems}
        list={list}
        onClose={() => toggleDeleteModal(false)}
        onDelete={handleDelete}
      />
    </Fragment>
  );
}
