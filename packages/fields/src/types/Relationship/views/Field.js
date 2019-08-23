/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component, Fragment, useState } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { PlusIcon, PersonIcon, LinkExternalIcon } from '@arch-ui/icons';
import { gridSize } from '@arch-ui/theme';
import { IconButton } from '@arch-ui/button';
import Tooltip from '@arch-ui/tooltip';

import CreateItemModal from './CreateItemModal';
import RelationshipSelect from './RelationshipSelect';

const MAX_IDS_IN_FILTER = 100;

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

function LinkToRelatedItems({ field, value }) {
  const { many, ref } = field.config;
  const { adminPath, getListByKey } = field.adminMeta;
  const refList = getListByKey(ref);
  let isDisabled = false;
  let label;
  let link = `${adminPath}/${refList.path}`;
  if (many) {
    label = 'View List of Related Items';

    if (!value.length) {
      isDisabled = true;
    }

    // What happens when there are 10,000 ids? The URL would be too
    // big, so we arbitrarily limit it to the first 100
    link = `${link}?!id_in="${value
      .slice(0, MAX_IDS_IN_FILTER)
      .map(({ id }) => id)
      .join(',')}"`;
  } else {
    label = 'View Item Details';

    if (!value) {
      isDisabled = true;
    } else {
      link = `${link}/${value.id}`;
    }
  }

  return (
    <Tooltip placement="top" content={label}>
      {ref => (
        <IconButton
          ref={ref}
          icon={LinkExternalIcon}
          aria-label={label}
          variant="ghost"
          css={{ marginLeft: gridSize }}
          target="_blank"
          to={link}
          isDisabled={isDisabled}
        />
      )}
    </Tooltip>
  );
}

function CreateAndAddItem({ field, item, list, onCreate }) {
  let relatedList = field.adminMeta.getListByKey(field.config.ref);
  let [isOpen, setIsOpen] = useState(false);
  let label = `Create and add ${relatedList.singular}`;

  let prefillData;
  if (item && item.id) {
    prefillData = relatedList.fields
      // Find relationships on the refList which have a back link to this
      // Relationship field
      .filter(
        relatedField =>
          relatedField.type === 'Relationship' &&
          relatedField.config.ref === list.key &&
          relatedField.config.refFieldPath === field.path
      )
      // And convert it into an object of data to prefill the form with
      .reduce((memo, prefillField) => {
        const prefill = {
          _label_: item._label_ || '<link to parent>',
          id: item.id,
        };
        return {
          ...memo,
          [prefillField.path]: prefillField.config.many ? [prefill] : prefill,
        };
      }, {});
  }

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
        prefillData={prefillData}
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
    const { autoFocus, field, value, renderContext, errors, onChange, item, list } = this.props;
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
            item={item}
            list={list}
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
          <LinkToRelatedItems field={field} value={value} />
        </FieldInput>
      </FieldContainer>
    );
  }
}
