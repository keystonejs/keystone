/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, useEffect, useState } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { ShieldIcon } from '@arch-ui/icons';
import { colors, gridSize } from '@arch-ui/theme';
import { Button } from '@arch-ui/button';

import RelationshipSelect from './RelationshipSelect';

function SetAsCurrentUser({ sessionPath, listKey, value, onAddUser, many }) {
  let [userId, setUserId] = useState(null);
  useEffect(
    () => {
      fetch(sessionPath)
        .then(x => x.json())
        .then(({ user }) => {
          if (user && user.id) {
            setUserId(user.id);
          }
        });
    },
    [sessionPath, setUserId]
  );

  if (
    userId === null ||
    (value !== null && (many ? value.some(item => item.id === userId) : value.id === userId))
  ) {
    return null;
  }

  return (
    <Query
      query={gql`
        query User($userId: ID!) {
          ${listKey}(where: { id: $userId }) {
            _label_
            id
          }
        }
      `}
      variables={{ userId }}
    >
      {({ data }) => {
        if (data && data[listKey]) {
          return (
            <Button
              css={{ marginLeft: gridSize }}
              variant="ghost"
              onClick={() => {
                onAddUser(data[listKey]);
              }}
            >
              Set as {data[listKey]._label_}
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
    const { authList, withAuth, sessionPath } = field.adminMeta;
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
              sessionPath={sessionPath}
            />
          )}
        </FieldInput>
      </FieldContainer>
    );
  }
}
