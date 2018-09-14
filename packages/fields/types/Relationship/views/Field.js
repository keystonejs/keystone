import React, { Component } from 'react';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { FieldContainer, FieldLabel, FieldInput } from '@voussoir/ui/src/primitives/fields';
import { Select } from '@voussoir/ui/src/primitives/filters';
import { ShieldIcon } from '@voussoir/icons';
import { colors } from '@voussoir/ui/src/theme';
import { pick } from '@voussoir/utils';

const getGraphqlQuery = refList => {
  // TODO: How can we replace this with field.Controller.getQueryFragment()?
  return gql`{
    ${refList.listQueryName} {
      id
      _label_
    }
  }`;
};

export default class RelationshipField extends Component {
  onChange = option => {
    const { field, onChange } = this.props;
    const { many } = field.config;
    if (many) {
      onChange(field, option.map(i => i.value));
    } else {
      onChange(field, option ? option.value : null);
    }
  };
  render() {
    const { autoFocus, field, item, itemErrors, renderContext } = this.props;
    const { many } = field.config;
    const refList = field.getRefList();
    const query = getGraphqlQuery(refList);
    const htmlID = `ks-input-${field.path}`;
    const canRead = !(
      itemErrors[field.path] instanceof Error && itemErrors[field.path].name === 'AccessDeniedError'
    );

    const selectProps =
      renderContext === 'dialog'
        ? {
            menuPortalTarget: document.body,
            menuShouldBlockScroll: true,
          }
        : null;

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
            <ShieldIcon
              title={itemErrors[field.path].message}
              css={{ color: colors.N20, marginRight: '1em' }}
            />
          ) : null}
        </FieldLabel>
        <FieldInput>
          <Query query={query}>
            {({ data, error, loading }) => {
              if (loading) {
                return <Select key="loading" isDisabled isLoading={loading} />;
              }
              // TODO: better error UI
              // TODO: Handle permission errors
              // (ie; user has permission to read this relationship field, but
              // not the related list, or some items on the list)
              if (error) return 'Error';

              const options = data[refList.listQueryName].map(listData => ({
                value: pick(listData, ['id']),
                label: listData._label_, // eslint-disable-line no-underscore-dangle
              }));

              let value = null;

              if (canRead) {
                if (many) {
                  if (!Array.isArray(item[field.path])) value = [];
                  value = item[field.path]
                    .map(i => options.find(option => option.value.id === i.id))
                    .filter(i => i);
                } else if (item[field.path]) {
                  value = options.find(i => i.value.id === item[field.path].id) || null;
                }
              }

              return (
                <Select
                  autoFocus={autoFocus}
                  isMulti={many}
                  value={value}
                  placeholder={canRead ? undefined : itemErrors[field.path].message}
                  getOptionValue={option => option.value.id}
                  options={options}
                  onChange={this.onChange}
                  id={`react-select-${htmlID}`}
                  isClearable
                  isLoading={loading}
                  instanceId={htmlID}
                  inputId={htmlID}
                  {...selectProps}
                />
              );
            }}
          </Query>
        </FieldInput>
      </FieldContainer>
    );
  }
}
