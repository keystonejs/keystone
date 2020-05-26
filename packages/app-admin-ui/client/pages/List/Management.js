/* global ENABLE_DEV_FEATURES */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState } from 'react';

import { SettingsIcon, TrashcanIcon } from '@arch-ui/icons';
import { FlexGroup } from '@arch-ui/layout';
import { IconButton } from '@arch-ui/button';
import { colors, gridSize } from '@arch-ui/theme';

import UpdateManyItemsModal from '../../components/UpdateManyItemsModal';
import DeleteManyItemsModal from '../../components/DeleteManyItemsModal';

export const ManageToolbar = ({ isVisible, ...props }) => (
  <div
    css={{
      height: '35px',
      marginBottom: `${gridSize * 2}px`,
      marginTop: `${gridSize}px`,
      visibility: isVisible ? 'visible' : 'hidden',
    }}
    {...props}
  />
);

const SelectedCount = props => (
  <div css={{ color: colors.N40, marginRight: `${gridSize}px` }} {...props} />
);

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

        {list.access.delete && (
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
