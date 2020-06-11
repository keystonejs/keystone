/** @jsx jsx */
import { jsx } from '@emotion/core';
import Tooltip from '@arch-ui/tooltip';
import { IconButton } from '@arch-ui/button';
import { PlusIcon } from '@primer/octicons-react';
import { useList } from '../../providers/List';

const AddNewItem = () => {
  let {
    list: { access },
    openCreateItemModal,
  } = useList();
  if (!access.create) return null;
  const cypressId = 'item-page-create-button';
  return (
    <Tooltip content="Create" hideOnMouseDown hideOnKeyDown>
      {ref => (
        <IconButton
          ref={ref}
          css={{ marginRight: -12 }}
          variant="subtle"
          icon={PlusIcon}
          id={cypressId}
          onClick={openCreateItemModal}
        />
      )}
    </Tooltip>
  );
};

export default AddNewItem;
