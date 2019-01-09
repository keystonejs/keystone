import React, { Component, Fragment } from 'react';
import { Mutation } from 'react-apollo';
import { Button } from '@arch-ui/button';
import Drawer from '@arch-ui/drawer';
import { FieldContainer, FieldLabel, FieldInput } from '@voussoir/ui/src/primitives/fields';
import Select from '@arch-ui/select';
import { omit } from '@voussoir/utils';

import FieldTypes from '../FIELD_TYPES';

class UpdateManyModal extends Component {
  constructor(props) {
    super(props);
    const { list } = props;
    const selectedFields = [];
    const item = list.getInitialItemData();
    this.state = { item, selectedFields };
  }
  onUpdate = () => {
    const { updateItem, isLoading } = this.props;
    console.log('onUpdate called');
    return;
    if (isLoading) return;
    const { item } = this.state;
    updateItem({
      variables: { data: item },
    }).then(this.props.onUpdate);
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
        return this.onUpdate();
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
  handleSelect = selected => {
    const { list } = this.props;
    const selectedFields = selected.map(({ path, value }) => {
      return list.fields.find(f => f.path === path || f.path === value);
    });
    this.setState({ selectedFields });
  };
  getOptionValue = option => {
    return option.path || option.value;
  };
  getOptionValue = option => {
    return option.path || option.value;
  };
  getOptions = () => {
    const { list } = this.props;
    // remove the `options` key from select type fields
    return list.fields.map(f => omit(f, ['options']));
  };
  render() {
    const { isLoading, isOpen, items, list } = this.props;
    const { item, selectedFields } = this.state;
    const options = this.getOptions();

    return (
      <Drawer
        isOpen={isOpen}
        onClose={this.onClose}
        heading={`Update ${list.formatCount(items)}`}
        onKeyDown={this.onKeyDown}
        slideInFrom="left"
        footer={
          <Fragment>
            <Button appearance="primary" onClick={this.onUpdate}>
              {isLoading ? 'Loading...' : 'Update'}
            </Button>
            <Button appearance="warning" variant="subtle" onClick={this.onClose}>
              Cancel
            </Button>
          </Fragment>
        }
      >
        <Fragment>
          <FieldContainer>
            <FieldLabel>Fields</FieldLabel>
            <FieldInput>
              <Select
                autoFocus
                isMulti
                menuPosition="fixed"
                onChange={this.handleSelect}
                options={options}
                tabSelectsValue={false}
                value={selectedFields}
                getOptionValue={this.getOptionValue}
                filterOption={this.filterOption}
              />
            </FieldInput>
          </FieldContainer>
          {selectedFields.map(field => {
            const { Field } = FieldTypes[list.key][field.path];
            return (
              <Field
                item={item}
                field={field}
                key={field.path}
                onChange={this.onChange}
                renderContext="dialog"
              />
            );
          })}
        </Fragment>
      </Drawer>
    );
  }
}

export default class UpdateManyModalWithMutation extends Component {
  render() {
    const { list } = this.props;
    // FIXME: updateMutation is the wrong thing to do here! We need to work out how
    // to update many things all at once. This doesn't appear to be common pattern
    // across the board.
    return (
      <Mutation mutation={list.updateMutation}>
        {(updateItem, { loading }) => (
          <UpdateManyModal updateItem={updateItem} isLoading={loading} {...this.props} />
        )}
      </Mutation>
    );
  }
}
