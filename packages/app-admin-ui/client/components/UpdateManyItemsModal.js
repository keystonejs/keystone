/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, Fragment, useMemo, useCallback, Suspense } from 'react';
import { Mutation } from 'react-apollo';
import { Button, LoadingButton } from '@arch-ui/button';
import Drawer from '@arch-ui/drawer';
import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import Select from '@arch-ui/select';
import { omit, arrayToObject, countArrays } from '@keystonejs/utils';
import { LoadingIndicator } from '@arch-ui/loading';

import { validateFields } from '../util';

let Render = ({ children }) => children();

class UpdateManyModal extends Component {
  constructor(props) {
    super(props);
    const { list } = props;
    const selectedFields = [];
    const item = list.getInitialItemData();
    const validationErrors = {};
    const validationWarnings = {};

    this.state = { item, selectedFields, validationErrors, validationWarnings };
  }
  onUpdate = async () => {
    const { updateItem, isLoading, items } = this.props;
    const { item, selectedFields, validationErrors, validationWarnings } = this.state;
    if (isLoading) return;
    if (countArrays(validationErrors)) {
      return;
    }

    const data = arrayToObject(selectedFields, 'path', field => field.serialize(item));

    if (!countArrays(validationWarnings)) {
      const { errors, warnings } = await validateFields(selectedFields, item, data);

      if (countArrays(errors) + countArrays(warnings) > 0) {
        this.setState(() => ({
          validationErrors: errors,
          validationWarnings: warnings,
        }));

        return;
      }
    }

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
    this.setState({ item: this.props.list.getInitialItemData({}), selectedFields: [] });
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
      return list.fields
        .filter(({ isPrimaryKey }) => !isPrimaryKey)
        .find(f => f.path === path || f.path === value);
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
    return list.fields.filter(({ isPrimaryKey }) => !isPrimaryKey).map(f => omit(f, ['options']));
  };
  render() {
    const { isLoading, isOpen, items, list } = this.props;
    const { item, selectedFields, validationErrors, validationWarnings } = this.state;
    const options = this.getOptions();

    const hasWarnings = countArrays(validationWarnings);
    const hasErrors = countArrays(validationErrors);

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
            <LoadingButton
              appearance={hasWarnings && !hasErrors ? 'warning' : 'primary'}
              isDisabled={hasErrors}
              isLoading={isLoading}
              onClick={this.onUpdate}
            >
              {hasWarnings && !hasErrors ? 'Ignore Warnings and Update' : 'Update'}
            </LoadingButton>
            <Button appearance="warning" variant="subtle" onClick={this.onClose}>
              Cancel
            </Button>
          </Fragment>
        }
      >
        <FieldContainer>
          <FieldLabel field={{ label: 'Fields', config: { isRequired: false } }} />
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
                  let onChange = useCallback(
                    value => {
                      this.setState(({ item }) => ({
                        item: {
                          ...item,
                          [field.path]: value,
                        },
                        validationErrors: {},
                        validationWarnings: {},
                      }));
                    },
                    [field]
                  );
                  return useMemo(
                    () => (
                      <Field
                        autoFocus={!i}
                        field={field}
                        value={item[field.path]}
                        // Explicitly pass undefined here as it doesn't make
                        // sense to pass in any one 'saved' value
                        savedValue={undefined}
                        errors={validationErrors[field.path] || []}
                        warnings={validationWarnings[field.path] || []}
                        onChange={onChange}
                        renderContext="dialog"
                      />
                    ),
                    [
                      i,
                      field,
                      item[field.path],
                      validationErrors[field.path],
                      validationWarnings[field.path],
                      onChange,
                    ]
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
