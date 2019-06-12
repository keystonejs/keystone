/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, Fragment, useMemo, useCallback, Suspense } from 'react';
import { Mutation } from 'react-apollo';
import { Button } from '@arch-ui/button';
import Drawer from '@arch-ui/drawer';
import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import Select from '@arch-ui/select';
import { omit, arrayToObject } from '@keystone-alpha/utils';
import { LoadingIndicator } from '@arch-ui/loading';

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

    const data = arrayToObject(selectedFields, 'path', field => field.serialize(item));

    updateItem({
      variables: {
        data: items.map(id => ({ id, data })),
      },
    }).then(() => {
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
          return (
            <Suspense
              fallback={<LoadingIndicator css={{ height: '3em' }} size={12} />}
              key={field.path}
            >
              <Render>
                {() => {
                  let [Field] = field.adminMeta.readViews([field.views.Field]);
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
                        // Explicitly pass undefined here as it doesn't make
                        // sense to pass in any one 'saved' value
                        savedValue={undefined}
                        onChange={onChange}
                        renderContext="dialog"
                      />
                    ),
                    [i, field, item[field.path], onChange]
                  );
                }}
              </Render>
            </Suspense>
          );
        })}
      </Drawer>
    );
  }
}

export default class UpdateManyModalWithMutation extends Component {
  render() {
    const { list } = this.props;
    return (
      <Mutation mutation={list.updateManyMutation}>
        {(updateItem, { loading }) => (
          <UpdateManyModal updateItem={updateItem} isLoading={loading} {...this.props} />
        )}
      </Mutation>
    );
  }
}
