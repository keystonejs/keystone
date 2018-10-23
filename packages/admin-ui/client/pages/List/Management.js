/* global ENABLE_DEV_FEATURES */

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, Fragment } from 'react';

import { SettingsIcon, TrashcanIcon } from '@voussoir/icons';
import { FlexGroup } from '@voussoir/ui/src/primitives/layout';
import { Button, IconButton } from '@voussoir/ui/src/primitives/buttons';
import { gridSize } from '@voussoir/ui/src/theme';

import UpdateManyItemsModal from '../../components/UpdateManyItemsModal';
import DeleteManyItemsModal from '../../components/DeleteManyItemsModal';

export const ManageToolbar = ({ isVisible, ...props }) => (
  <div
    css={{
      marginBottom: gridSize * 2,
      marginTop: gridSize,
      visibility: isVisible ? 'visible' : 'hidden',
    }}
    {...props}
  />
);

type Props = {
  list: Object,
  onDeleteMany: (*) => void,
  onUpdateMany: (*) => void,
  onToggleManage: (*) => void,
  selectedItems: Array<string>,
};
type State = {
  showDeleteModal: boolean,
  showUpdateModal: boolean,
};

export default class ListManage extends Component<Props, State> {
  state = { showDeleteModal: false, showUpdateModal: false };

  closeDeleteModal = () => this.setState({ showDeleteModal: false });
  openDeleteModal = () => this.setState({ showDeleteModal: true });
  closeUpdateModal = () => this.setState({ showUpdateModal: false });
  openUpdateModal = () => this.setState({ showUpdateModal: true });

  handleDelete = () => {
    this.closeDeleteModal();
    this.props.onDeleteMany();
  };
  handleUpdate = () => {
    this.closeUpdateModal();
    this.props.onUpdateMany();
  };

  render() {
    const { list, onToggleManage, selectedItems } = this.props;
    const { showDeleteModal, showUpdateModal } = this.state;
    const selectedCount = selectedItems.length;
    const hasSelected = Boolean(selectedCount);

    return (
      <Fragment>
        <FlexGroup align="center">
          {ENABLE_DEV_FEATURES ? (
            list.access.update ? (
              <IconButton
                appearance="primary"
                icon={SettingsIcon}
                isDisabled={!hasSelected}
                onClick={this.openUpdateModal}
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
              isDisabled={!hasSelected}
              onClick={this.openDeleteModal}
              variant="ghost"
              data-test-name="delete"
            >
              Delete
            </IconButton>
          ) : null}
          <Button autoFocus onClick={onToggleManage} variant="subtle">
            Done
          </Button>
        </FlexGroup>

        <UpdateManyItemsModal
          isOpen={showUpdateModal}
          items={selectedItems}
          list={list}
          onClose={this.closeUpdateModal}
          onUpdate={this.handleUpdate}
        />
        <DeleteManyItemsModal
          isOpen={showDeleteModal}
          itemIds={selectedItems}
          list={list}
          onClose={this.closeDeleteModal}
          onDelete={this.handleDelete}
        />
      </Fragment>
    );
  }
}
