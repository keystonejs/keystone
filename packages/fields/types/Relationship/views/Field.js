/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { ShieldIcon } from '@arch-ui/icons';
import { colors, gridSize } from '@arch-ui/theme';
import { Button } from '@arch-ui/button';

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
              css={{ marginLeft: gridSize }}
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
        </FieldInput>
      </FieldContainer>
    );
  }
}
