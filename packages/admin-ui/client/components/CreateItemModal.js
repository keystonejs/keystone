import React, { Component, Fragment } from 'react';
import { Mutation } from 'react-apollo';
import styled from '@emotion/styled';

import { Button } from '@voussoir/ui/src/primitives/buttons';
import { Drawer } from '@voussoir/ui/src/primitives/modals';
import { resolveAllKeys, arrayToObject } from '@voussoir/utils';
import { gridSize } from '@voussoir/ui/src/theme';
import { AutocompleteCaptor } from '@voussoir/ui/src/primitives/forms';

import FieldTypes from '../FIELD_TYPES';

const Body = styled.div({
  marginBottom: gridSize,
  marginTop: gridSize,
});

class CreateItemModal extends Component {
  constructor(props) {
    super(props);
    const { list } = props;
    const item = list.getInitialItemData();
    this.state = { item };
  }
  onCreate = event => {
    // prevent form submission
    event.preventDefault();

    const {
      list: { fields },
      createItem,
      isLoading,
    } = this.props;
    if (isLoading) return;
    const { item } = this.state;

    resolveAllKeys(arrayToObject(fields, 'path', field => field.getValue(item)))
      .then(data => createItem({ variables: { data } }))
      .then(this.props.onCreate);
  };
  onClose = () => {
    const { isLoading } = this.props;
    if (isLoading) return;
    this.props.onClose();
  };
  onKeyDown = event => {
    if (event.defaultPrevented) return;
    switch (event.key) {
      case 'Escape':
        return this.onClose();
    }
  };
  onChange = (field, value) => {
    const { item } = this.state;
    this.setState({
      item: {
        ...item,
        [field.path]: value,
      },
    });
  };
  formComponent = props => <form autoComplete="off" onSubmit={this.onCreate} {...props} />;
  render() {
    const { isLoading, isOpen, list } = this.props;
    const { item } = this.state;
    return (
      <Drawer
        closeOnBlanketClick
        component={this.formComponent}
        isOpen={isOpen}
        onClose={this.onClose}
        heading={`Create ${list.singular}`}
        onKeyDown={this.onKeyDown}
        slideInFrom="right"
        footer={
          <Fragment>
            <Button appearance="create" type="submit">
              {isLoading ? 'Loading...' : 'Create'}
            </Button>
            <Button appearance="warning" variant="subtle" onClick={this.onClose}>
              Cancel
            </Button>
          </Fragment>
        }
      >
        <Body>
          <AutocompleteCaptor />
          {list.fields.map(field => {
            const { Field } = FieldTypes[list.key][field.path];
            return (
              <Field
                item={item}
                field={field}
                key={field.path}
                itemErrors={[] /* TODO: Permission query results */}
                onChange={this.onChange}
                renderContext="dialog"
              />
            );
          })}
        </Body>
      </Drawer>
    );
  }
}

export default class CreateItemModalWithMutation extends Component {
  render() {
    const { list } = this.props;
    return (
      <Mutation mutation={list.createMutation}>
        {(createItem, { loading }) => (
          <CreateItemModal createItem={createItem} isLoading={loading} {...this.props} />
        )}
      </Mutation>
    );
  }
}
