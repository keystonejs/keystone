import React, { Component } from 'react';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import {
  FieldContainer,
  FieldLabel,
  FieldInput,
} from '@keystonejs/ui/src/primitives/fields';
import { Select } from '@keystonejs/ui/src/primitives/filters';

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
    const { autoFocus, field, item, renderContext } = this.props;
    const { many } = field.config;
    const refList = field.getRefList();
    const query = getGraphqlQuery(refList);
    const htmlID = `ks-input-${field.path}`;

    const selectProps =
      renderContext === 'dialog'
        ? {
            menuPortalTarget: document.body,
            menuShouldBlockScroll: true,
          }
        : null;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID}>{field.label}</FieldLabel>
        <FieldInput>
          <Query query={query}>
            {({ data, error, loading }) => {
              if (loading) {
                return <Select key="loading" isDisabled isLoading={loading} />;
              }
              // TODO: better error UI
              if (error) return 'Error';
              const options = data[refList.listQueryName].map(listData => ({
                value: listData,
                label: listData._label_, // eslint-disable-line no-underscore-dangle
              }));
              let value = item[field.path];
              if (many) {
                if (!Array.isArray(value)) value = [];
                value = value
                  .map(
                    i => options.filter(option => option.value.id === i.id)[0]
                  )
                  .filter(i => i);
              } else if (value) {
                value =
                  options.filter(i => i.value.id === item[field.path].id)[0] ||
                  null;
              } else {
                value = null;
              }
              return (
                <Select
                  autoFocus={autoFocus}
                  isMulti={many}
                  value={value}
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
