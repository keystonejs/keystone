/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component, Fragment, useState } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { PlusIcon, PersonIcon } from '@arch-ui/icons';
import { gridSize } from '@arch-ui/theme';
import { IconButton } from '@arch-ui/button';
import Tooltip from '@arch-ui/tooltip';

import CreateItemModal from './CreateItemModal';
import RelationshipSelect from './RelationshipSelect';

function SetAsCurrentUser({ listKey, value, onAddUser, many }) {
  let path = 'authenticated' + listKey;
  return (
    <Query
      query={gql`
        query User {
          ${path} {
            _label_
            id
          }
        }
      `}
    >
      {({ data }) => {
        if (data && data[path]) {
          let userId = data[path].id;
          if (
            value !== null &&
            (many ? value.some(item => item.id === userId) : value.id === userId)
          ) {
            return null;
          }
          let label = `${many ? 'Add' : 'Set as'} ${data[path]._label_}`;
          return (
            <Tooltip placement="top" content={label}>
              {ref => (
                <IconButton
                  css={{ marginLeft: gridSize }}
                  variant="ghost"
                  ref={ref}
                  onClick={() => {
                    onAddUser(data[path]);
                  }}
                  icon={PersonIcon}
                  aria-label={label}
                />
              )}
            </Tooltip>
          );
        }
        return null;
      }}
    </Query>
  );
}

function CreateAndAddItem({ field, onCreate }) {
  let relatedList = field.adminMeta.getListByKey(field.config.ref);
  let [isOpen, setIsOpen] = useState(false);
  let label = `Create and add ${relatedList.singular}`;
  return (
    <Fragment>
      <Tooltip placement="top" content={label}>
        {ref => (
          <IconButton
            ref={ref}
            onClick={() => {
              setIsOpen(true);
            }}
            icon={PlusIcon}
            aria-label={label}
            variant="ghost"
            css={{ marginLeft: gridSize }}
          />
        )}
      </Tooltip>
      <CreateItemModal
        isOpen={isOpen}
        list={relatedList}
        onClose={() => {
          setIsOpen(false);
        }}
        onCreate={({ data }) => {
          setIsOpen(false);
          console.log(data);
          onCreate(data[relatedList.gqlNames.createMutationName]);
        }}
      />
    </Fragment>
  );
}

export default class RelationshipField extends Component {
  onChange = option => {
    const { field, onChange } = this.props;
    const { many } = field.config;
    if (many) {
      onChange(option.map(i => i.value));
    } else {
      onChange(option ? option.value : null);
    }
  };
  render() {
    const { autoFocus, field, value, renderContext, errors, onChange } = this.props;
    const { many, ref } = field.config;
    const { authStrategy } = field.adminMeta;
    const htmlID = `ks-input-${field.path}`;
    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
        <FieldInput>
          <div css={{ flex: 1 }}>
            <RelationshipSelect
              autoFocus={autoFocus}
              isMulti={many}
              field={field}
              value={value}
              errors={errors}
              renderContext={renderContext}
              htmlID={htmlID}
              onChange={this.onChange}
            />
          </div>
          <CreateAndAddItem
            onCreate={item => {
              onChange(many ? (value || []).concat(item) : item);
            }}
            field={field}
          />
          {authStrategy && ref === authStrategy.listKey && (
            <SetAsCurrentUser
              many={many}
              onAddUser={user => {
                onChange(many ? (value || []).concat(user) : user);
              }}
              value={value}
              listKey={authStrategy.listKey}
            />
          )}
        </FieldInput>
      </FieldContainer>
    );
  }
}
