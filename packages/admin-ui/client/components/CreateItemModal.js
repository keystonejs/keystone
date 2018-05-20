import React, { Component, Fragment } from 'react';
import { Mutation } from 'react-apollo';
import styled from 'react-emotion';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { Dialog } from '@keystonejs/ui/src/primitives/modals';
import { gridSize } from '@keystonejs/ui/src/theme';

import FieldTypes from '../FIELD_TYPES';

const Form = styled.div({
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
  onCreate = () => {
    const {
      list: { fields },
      createItem,
      isLoading,
    } = this.props;
    if (isLoading) return;
    const { item } = this.state;

    const data = fields.reduce((values, field) => {
      values[field.path] = field.getValue(item);
      return values;
    }, {});

    createItem({
      variables: { data },
    }).then(this.props.onCreate);
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
      case 'Enter':
        if (document.activeElement.nodeName === 'INPUT') {
          return this.onCreate();
        }
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
  render() {
    const { isLoading, list } = this.props;
    const { item } = this.state;
    return (
      <Dialog
        onClose={this.onClose}
        heading={`Create ${list.singular}`}
        onKeyDown={this.onKeyDown}
        footer={
          <Fragment>
            <Button appearance="create" onClick={this.onCreate}>
              {isLoading ? 'Loading...' : 'Create'}
            </Button>
            <Button
              appearance="warning"
              variant="subtle"
              onClick={this.onClose}
            >
              Cancel
            </Button>
          </Fragment>
        }
      >
        <Form>
          {list.fields.map(field => {
            const { Field } = FieldTypes[list.key][field.path];
            return (
              <Field
                item={item}
                field={field}
                key={field.path}
                onChange={this.onChange}
              />
            );
          })}
        </Form>
      </Dialog>
    );
  }
}

export default class CreateItemModalWithMutation extends Component {
  render() {
    const { list } = this.props;
    return (
      <Mutation mutation={list.createMutation}>
        {(createItem, { loading }) => (
          <CreateItemModal
            createItem={createItem}
            isLoading={loading}
            {...this.props}
          />
        )}
      </Mutation>
    );
  }
}
