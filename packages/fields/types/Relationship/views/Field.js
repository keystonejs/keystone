import React, { Component } from 'react';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import {
  FieldContainer,
  FieldLabel,
  FieldInput,
} from '@keystonejs/ui/src/primitives/fields';

import { Select } from '@keystonejs/ui/src/primitives/forms';

const renderTemplate = (template, values) => {
  return template.replace(/{{(.*?)}}/g, (match, key) => values[key] || '');
};

const getGraphqlQuery = refList => {
  return gql`{
    ${refList.listQueryName} {
      id
      ${refList.displayFields.filter(field => field !== 'id').join(' ')}
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
    const { autoFocus, field, item } = this.props;
    const { many } = field.config;
    const refList = field.getRefList();
    const query = getGraphqlQuery(refList);
    return (
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldInput>
          <Query query={query}>
            {({ data, error, loading }) => {
              if (loading) {
                return <Select key="loading" isDisabled isLoading={loading} />;
              }
              // TODO: better error UI
              if (error) return 'Error';
              const options = data[refList.listQueryName].map(
                (listData) => ({
                  value: listData,
                  label: renderTemplate(refList.displayTemplate, listData),
                })
              );
              let value = item[field.path];
              if (many) {
                if (!Array.isArray(value)) value = [];
                value = value
                  .map(i => options.filter(option => option.value.id === i.id)[0])
                  .filter(i => i);
              } else if (value) {
                value =
                  options.filter(i => i.value.id === item[field.path].id)[0] || null;
              } else {
                value = null;
              }
              return (
                <Select
                  autoFocus={autoFocus}
                  isMulti={many}
                  menuPosition="fixed"
                  value={value}
                  options={options}
                  onChange={this.onChange}
                  isClearable
                  isLoading={loading}
                />
              );
            }}
          </Query>
        </FieldInput>
      </FieldContainer>
    );
  }
}
