import React, { Component, Fragment, useMemo, useCallback } from 'react';
import { Mutation } from 'react-apollo';
import { Button } from '@arch-ui/button';
import Drawer from '@arch-ui/drawer';
import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import Select from '@arch-ui/select';
import { omit, arrayToObject, resolveAllKeys } from '@keystone-alpha/utils';

let Render = ({ children }) => children();

class UpdateManyModal extends Component {
  constructor(props) {
    super(props);
    const { list } = props;
    const selectedFields = [];
    const item = list.getInitialItemData();
    this.state = { item, selectedFields };
  }
  onUpdate = () => {
    const { updateItem, isLoading, items } = this.props;
    const { item, selectedFields } = this.state;
    if (isLoading) return;

    resolveAllKeys(arrayToObject(selectedFields, 'path', field => field.getValue(item)))
      .then(data => {
        updateItem({
          variables: {
            data: items.map(id => ({ id, data })),
          },
        });
      })
      .then(() => {
        this.props.onUpdate();
        this.resetState();
      });
  };

  resetState = () => {
    this.setState({ item: this.props.list.getInitialItemData(), selectedFields: [] });
  };
  onClose = () => {
    const { isLoading } = this.props;
    if (isLoading) return;
    this.resetState();
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
        closeOnBlanketClick
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
          {selectedFields.map((field, i) => {
            const { Field } = field.views;
            return (
              <Render key={field.path}>
                {() => {
                  let onChange = useCallback(value => {
                    this.setState(({ item }) => ({
                      item: {
                        ...item,
                        [field.path]: value,
                      },
                    }));
                  });
                  return useMemo(
                    () => (
                      <Field
                        autoFocus={!i}
                        field={field}
                        value={item[field.path]}
                        onChange={onChange}
                        renderContext="dialog"
                      />
                    ),
                    [i, field, item[field.path], onChange]
                  );
                }}
              </Render>
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
      <Mutation mutation={list.updateManyMutation}>
        {(updateItem, { loading }) => (
          <UpdateManyModal updateItem={updateItem} isLoading={loading} {...this.props} />
        )}
      </Mutation>
    );
  }
}
