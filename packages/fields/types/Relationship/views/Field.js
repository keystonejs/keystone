import React, { Component } from 'react';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import {
  FieldContainer,
  FieldLabel,
  FieldInput,
} from '@keystonejs/ui/src/primitives/fields';

import { Select } from '@keystonejs/ui/src/primitives/forms';

const getGraphqlQuery = refList => {
  return gql`{
      ${refList.listQueryName} {
        name id
      }
    }`;
};

export default class RelationshipField extends Component {
  onChange = option => {
    const { field, onChange } = this.props;
    onChange(field, option ? option.value : null);
  };
  render() {
    const { autoFocus, field, item, getListByKey } = this.props;
    const refList = getListByKey(field.config.ref);
    const query = getGraphqlQuery(refList);
    return (
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldInput>
          <Query query={query}>
            {({ data, error, loading }) => {
              if (loading) {
                return <Select autoFocus={autoFocus} isLoading={loading} />;
              }
              // TOOD: better error UI
              if (error) return 'Error';
              const options = data[refList.listQueryName].map(
                ({ id, name }) => ({ value: id, label: name })
              );
              const value = item[field.path]
                ? options.filter(i => i.value === item[field.path])[0] || null
                : null;
              return (
                <Select
                  autoFocus={autoFocus}
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
