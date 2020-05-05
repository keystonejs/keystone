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
  height: 35,
  marginBottom: gridSize * 2,
  marginTop: gridSize,
  visibility: isVisible ? 'visible' : 'hidden',
}));

const SelectedCount = styled.div`
  color: ${colors.N40};
  margin-right: ${gridSize}px;
`;

const ListManage = ({ list, pageSize, totalItems, selectedItems, onDeleteMany, onUpdateMany }) => {
  const [deleteModalIsVisible, setDeleteModalIsVisible] = useState(false);
  const [updateModalIsVisible, setUpdateModalIsVisible] = useState(false);

  const handleDelete = () => {
    setDeleteModalIsVisible(false);
    onDeleteMany();
  };

  const handleUpdate = () => {
    setUpdateModalIsVisible(false);
    onUpdateMany();
  };

  return (
    <Fragment>
      <FlexGroup align="center">
        <SelectedCount>
          {`${selectedItems.length} of ${Math.min(pageSize, totalItems)} Selected`}
        </SelectedCount>

        {ENABLE_DEV_FEATURES && list.access.update && (
          <IconButton
            appearance="primary"
            icon={SettingsIcon}
            onClick={() => setUpdateModalIsVisible(true)}
            variant="nuance"
            data-test-name="update"
          >
            Update
          </IconButton>
        )}

        {list.access.update && (
          <IconButton
            appearance="danger"
            icon={TrashcanIcon}
            onClick={() => setDeleteModalIsVisible(true)}
            variant="nuance"
            data-test-name="delete"
          >
            Delete
          </IconButton>
        )}
      </FlexGroup>

      <UpdateManyItemsModal
        isOpen={updateModalIsVisible}
        items={selectedItems}
        list={list}
        onClose={() => setUpdateModalIsVisible(false)}
        onUpdate={handleUpdate}
      />

      <DeleteManyItemsModal
        isOpen={deleteModalIsVisible}
        itemIds={selectedItems}
        list={list}
        onClose={() => setDeleteModalIsVisible(false)}
        onDelete={handleDelete}
      />
    </Fragment>
  );
};

export default ListManage;
