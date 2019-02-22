/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, Fragment, useState } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { ShieldIcon } from '@arch-ui/icons';
import { colors, gridSize } from '@arch-ui/theme';
import { Button } from '@arch-ui/button';

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
          return (
            <Button
              css={{ marginLeft: gridSize, marginRight: gridSize }}
              variant="ghost"
              onClick={() => {
                onAddUser(data[path]);
              }}
            >
              {many ? 'Add' : 'Set as'} {data[path]._label_}
            </Button>
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
  console.log(relatedList);
  return (
    <Fragment>
      <Button
        onClick={() => {
          setIsOpen(true);
        }}
        variant="ghost"
        css={{ marginLeft: gridSize }}
      >
        Create and add {relatedList.singular}
      </Button>
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
    const { autoFocus, field, value, renderContext, error, onChange } = this.props;
    const { many, ref } = field.config;
    const { authList, withAuth } = field.adminMeta;
    const htmlID = `ks-input-${field.path}`;
    const canRead = !(error instanceof Error && error.name === 'AccessDeniedError');
    return (
      <FieldContainer>
        <FieldLabel
          htmlFor={htmlID}
          css={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {field.label}{' '}
          {!canRead ? (
            <ShieldIcon title={error.message} css={{ color: colors.N20, marginRight: '1em' }} />
          ) : null}
        </FieldLabel>
        <FieldInput>
          <RelationshipSelect
            autoFocus={autoFocus}
            isMulti={many}
            field={field}
            value={value}
            error={error}
            renderContext={renderContext}
            htmlID={htmlID}
            onChange={this.onChange}
          />
          {withAuth && ref === authList && (
            <SetAsCurrentUser
              many={many}
              onAddUser={user => {
                onChange(many ? (value || []).concat(user) : user);
              }}
              value={value}
              listKey={authList}
            />
          )}
          <CreateAndAddItem
            onCreate={item => {
              onChange(many ? (value || []).concat(item) : item);
            }}
            field={field}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
