/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, Fragment, useCallback, useMemo, useEffect, useState } from 'react';
import { Mutation } from 'react-apollo';

import { Button } from '@arch-ui/button';
import Drawer from '@arch-ui/drawer';
import { resolveAllKeys, arrayToObject } from '@voussoir/utils';
import { gridSize } from '@arch-ui/theme';
import { AutocompleteCaptor } from '@arch-ui/input';

import PageWithListFields from '../pages/PageWithListFields';
import PageLoading from './PageLoading';

let Render = ({ children }) => children();

const CreateItemBody = ({ list, onChange, item }) => {
  const [defaultsLoaded, setDefaultsLoaded] = useState(false);
  useEffect(
    () => {
      if (!defaultsLoaded) {
        const initialData = list.getInitialItemData();
        setDefaultsLoaded(true);
        onChange(initialData);
      }
    },
    [list, defaultsLoaded, setDefaultsLoaded]
  );

  if (!defaultsLoaded) {
    // Don't render anything on the first pass, we'll have actual data next time
    // through once the useEffect() hook has run
    return <PageLoading />;
  }

  return (
    <Fragment>
      <AutocompleteCaptor />
      {list
        .getFields()
        .filter(field => field.isEditable())
        .map((field, i) => {
          const { Field } = field.views;
          if (!Field) {
            return null;
          }
          // TODO: Replace this with an access on the `list._fields[]` object?
          // It should have all the views, etc, loaded by now
          return (
            <Render key={field.path}>
              {() => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                let onFieldChange = useCallback(
                  value => {
                    onChange({
                      ...item,
                      [field.path]: value,
                    });
                  },
                  [onChange, item]
                );
                // eslint-disable-next-line react-hooks/rules-of-hooks
                return useMemo(
                  () => (
                    <Field
                      autoFocus={!i}
                      value={item[field.path]}
                      field={field}
                      /* TODO: Permission query results */
                      // error={}
                      onChange={onFieldChange}
                      renderContext="dialog"
                    />
                  ),
                  [i, item[field.path], field, item, onFieldChange]
                );
              }}
            </Render>
          );
        })}
    </Fragment>
  );
};

class CreateItemModal extends Component {
  state = { item: {} };
  onCreate = event => {
    // prevent form submission
    event.preventDefault();
    // we have to stop propagation so that if this modal is inside another form
    // it won't submit the form above it
    // this will most likely happen when a CreateItemModal is nested inside
    // another CreateItemModal when creating an item in a relationship field
    // if you're thinking, why is this necessary, the modal is in a portal?
    // it's important to remember that react events
    // propagate through portals as if they aren't there
    event.stopPropagation();

    const { list, createItem, isSaving } = this.props;
    if (isSaving) return;
    const { item } = this.state;

    resolveAllKeys(
      arrayToObject(list.getFields().filter(field => field.isEditable()), 'path', field =>
        field.getValue(item)
      )
    )
      .then(data => createItem({ variables: { data } }))
      .then(data => {
        this.props.onCreate(data);
        this.setState({ item: this.props.list.getInitialItemData() });
      });
  };
  onClose = () => {
    const { isSaving } = this.props;
    if (isSaving) return;
    this.props.onClose();
  };
  onKeyDown = event => {
    if (event.defaultPrevented) return;
    switch (event.key) {
      case 'Escape':
        return this.onClose();
    }
  };
  formComponent = props => <form autoComplete="off" onSubmit={this.onCreate} {...props} />;
  render() {
    const { isSaving, isOpen, list } = this.props;
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
              {isSaving ? 'Loading...' : 'Create'}
            </Button>
            <Button appearance="warning" variant="subtle" onClick={this.onClose}>
              Cancel
            </Button>
          </Fragment>
        }
      >
        <div
          css={{
            marginBottom: gridSize,
            marginTop: gridSize,
          }}
        >
          <PageWithListFields list={this.props.list}>
            <CreateItemBody
              list={this.props.list}
              item={this.state.item}
              onChange={item => console.log(item) || this.setState({ item })}
            />
          </PageWithListFields>
        </div>
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
          <CreateItemModal createItem={createItem} isSaving={loading} {...this.props} />
        )}
      </Mutation>
    );
  }
}
