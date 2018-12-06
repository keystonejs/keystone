// @flow
import * as React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Select } from '@voussoir/ui/src/primitives/filters';
import { pick } from '@voussoir/utils';
import { useState } from '@voussoir/ui/src/new-typed-react';

type Props = {
  innerRef?: React.Ref<*>,
  autoFocus?: boolean,
  field: Object,
  item: Object | null,
  itemErrors: Object,
  renderContext: string | null,
  htmlID: string,
  onChange: Function,
  value: *,
  isMulti: boolean,
};

const RelationshipSelect = ({
  innerRef,
  autoFocus,
  field,
  item,
  itemErrors,
  renderContext,
  htmlID,
  onChange,
  value,
  isMulti,
}: Props) => {
  const [search, setSearch] = useState('');
  const refList = field.getRefList();
  const query = gql`query RelationshipSelect($search: String!) {${refList.buildQuery(
    refList.gqlNames.listQueryName,
    `(first: 100, search: $search)`
  )}}`;

  const canRead = !(
    itemErrors[field.path] instanceof Error && itemErrors[field.path].name === 'AccessDeniedError'
  );
  const selectProps = renderContext === 'dialog' ? { menuShouldBlockScroll: true } : null;

  return (
    <Query query={query} variables={{ search }}>
      {({ data, error, loading }) => {
        // TODO: better error UI
        // TODO: Handle permission errors
        // (ie; user has permission to read this relationship field, but
        // not the related list, or some items on the list)
        if (error) console.log('ERROR!!!', error);
        if (error) return 'Error';

        const options = loading
          ? []
          : data[refList.gqlNames.listQueryName].map(listData => ({
              value: pick(listData, ['id']),
              label: listData._label_,
            }));

        // Collect IDs to represent and convert them into a value.
        let foo;
        if (item && canRead) {
          const fieldValue = item[field.path];
          if (isMulti) {
            foo = (Array.isArray(fieldValue) ? fieldValue : []).map(i => i.id);
          } else if (fieldValue) {
            foo = fieldValue.id;
          }
        } else if (value) {
          foo = value;
        }

        let currentValue;
        if (foo) {
          if (isMulti) {
            currentValue = foo
              .map(i => options.find(option => option.value.id === i) || null)
              .filter(i => i);
          } else {
            currentValue = options.find(option => option.value.id === foo) || null;
          }
        }

        return (
          <Select
            onInputChange={val => {
              setSearch(val);
            }}
            isLoading={loading}
            autoFocus={autoFocus}
            isMulti={isMulti}
            value={currentValue}
            placeholder={canRead ? undefined : itemErrors[field.path].message}
            getOptionValue={option => option.value.id}
            options={options}
            onChange={onChange}
            id={`react-select-${htmlID}`}
            isClearable
            isLoading={loading}
            instanceId={htmlID}
            inputId={htmlID}
            innerRef={innerRef}
            menuPortalTarget={document.body}
            {...selectProps}
          />
        );
      }}
    </Query>
  );
};

export default RelationshipSelect;
