/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import { gql, useQuery } from '@apollo/client';

import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import { PlusIcon, PersonIcon, LinkExternalIcon } from '@primer/octicons-react';
import { gridSize } from '@arch-ui/theme';
import { IconButton } from '@arch-ui/button';
import Tooltip from '@arch-ui/tooltip';

import RelationshipSelect from './RelationshipSelect';
import {
  CreateItemModal,
  ListProvider,
  useList,
  useAdminMeta,
} from '@keystonejs/app-admin-ui/components';

const MAX_IDS_IN_FILTER = 100;

function SetAsCurrentUser({ listKey, value, onAddUser, many, isDisabled }) {
  const path = 'authenticated' + listKey;

  const { data } = useQuery(gql`
    query User {
      ${path} {
        _label_
        id
      }
    }
  `);

  if (data && data[path]) {
    const userId = data[path].id;
    if (value !== null && (many ? value.some(item => item.id === userId) : value.id === userId)) {
      return null;
    }
    const label = `${many ? 'Add' : 'Set as'} ${data[path]._label_}`;
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
            isDisabled={isDisabled}
          />
        )}
      </Tooltip>
    );
  }

  return null;
}

function LinkToRelatedItems({ field, value }) {
  const { many } = field.config;
  const { fullPath } = field.getRefList();
  let isDisabled = false;
  let label;
  let link = fullPath;
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

function CreateAndAddItem({ field, item, onCreate, isDisabled }) {
  const { list, openCreateItemModal } = useList();

  let relatedList = field.getRefList();
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
        {ref => {
          return (
            <IconButton
              ref={ref}
              onClick={openCreateItemModal}
              icon={PlusIcon}
              aria-label={label}
              variant="ghost"
              css={{ marginLeft: gridSize }}
              isDisabled={isDisabled}
            />
          );
        }}
      </Tooltip>
      <CreateItemModal
        prefillData={prefillData}
        onCreate={({ data }) => {
          onCreate(data[relatedList.gqlNames.createMutationName]);
        }}
      />
    </Fragment>
  );
}

const RelationshipField = ({
  autoFocus,
  field,
  value = [],
  renderContext,
  errors,
  onChange,
  item,
  list,
  isDisabled,
}) => {
  const handleChange = option => {
    const { many } = field.config;
    if (many) {
      onChange(option ? option.map(i => i.value) : []);
    } else {
      onChange(option ? option.value : null);
    }
  };

  const { many, ref } = field.config;
  const { authStrategy } = useAdminMeta();
  const htmlID = `ks-input-${field.path}`;

  const relatedList = field.getRefList();

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldDescription text={field.adminDoc} />
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
            onChange={handleChange}
            isDisabled={isDisabled}
          />
        </div>
        <ListProvider list={relatedList}>
          <CreateAndAddItem
            onCreate={item => {
              onChange(many ? value.concat(item) : item);
            }}
            field={field}
            item={item}
            list={list}
            isDisabled={isDisabled}
          />
        </ListProvider>
        {authStrategy && ref === authStrategy.listKey && (
          <SetAsCurrentUser
            many={many}
            onAddUser={user => {
              onChange(many ? value.concat(user) : user);
            }}
            value={value}
            listKey={authStrategy.listKey}
            isDisabled={isDisabled}
          />
        )}
        <LinkToRelatedItems field={field} value={value} />
      </FieldInput>
    </FieldContainer>
  );
};

export default RelationshipField;
