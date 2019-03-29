/* global ENABLE_DEV_FEATURES */

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Component, Fragment } from 'react';
import styled from '@emotion/styled';

import { SettingsIcon, TrashcanIcon } from '@arch-ui/icons';
import { FlexGroup } from '@arch-ui/layout';
import { IconButton } from '@arch-ui/button';
import { Card } from '@arch-ui/card';
import { colors, gridSize } from '@arch-ui/theme';

import UpdateManyItemsModal from '../../components/UpdateManyItemsModal';
import DeleteManyItemsModal from '../../components/DeleteManyItemsModal';

export const ManageToolbar = styled.div(({ isVisible }) => ({
  display: 'flex',
  // height: 35,
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
    const { list, pageSize, selectedItems, totalItems } = this.props;
    const { showDeleteModal, showUpdateModal } = this.state;
    const selectedCount = selectedItems.length;

    return (
      <div css={{ paddingBottom: gridSize }}>
        <FlexGroup align="center">
          {ENABLE_DEV_FEATURES ? (
            list.access.update ? (
              <IconButton
                css={{ paddingBottom: 4, paddingTop: 4 }}
                appearance="primary"
                icon={SettingsIcon}
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
              css={{ paddingBottom: 4, paddingTop: 4 }}
              appearance="danger"
              icon={TrashcanIcon}
              onClick={this.openDeleteModal}
              variant="ghost"
              data-test-name="delete"
            >
              Delete
            </IconButton>
          ) : null}
          <SelectedCount>
            {selectedCount} of {Math.min(pageSize, totalItems)} Selected
          </SelectedCount>
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
      </div>
    );
  }
}
