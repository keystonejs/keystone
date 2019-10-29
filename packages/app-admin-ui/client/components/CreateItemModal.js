/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, Fragment, useCallback, useMemo, Suspense } from 'react';
import { Mutation } from 'react-apollo';
import { useToasts } from 'react-toast-notifications';

import { Button, LoadingButton } from '@arch-ui/button';
import Drawer from '@arch-ui/drawer';
import { arrayToObject, captureSuspensePromises, countArrays } from '@keystonejs/utils';
import { gridSize } from '@arch-ui/theme';
import { AutocompleteCaptor } from '@arch-ui/input';

import PageLoading from './PageLoading';
import { validateFields, toastError } from '../util';

let Render = ({ children }) => children();

class CreateItemModal extends Component {
  constructor(props) {
    super(props);
    const { list, prefillData } = props;
    const item = list.getInitialItemData({ prefill: prefillData });
    const validationErrors = {};
    const validationWarnings = {};

    this.state = { item, validationErrors, validationWarnings };
  }
  onCreate = async event => {
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

    const {
      list: { fields },
      createItem,
      isLoading,
      addToast,
    } = this.props;
    if (isLoading) return;
    const { item, validationErrors, validationWarnings } = this.state;

    if (countArrays(validationErrors)) {
      return;
    }

    const creatable = fields
      .filter(({ isPrimaryKey }) => !isPrimaryKey)
      .filter(({ maybeAccess }) => !!maybeAccess.create);

    const data = arrayToObject(creatable, 'path', field => field.serialize(item));

    if (!countArrays(validationWarnings)) {
      const { errors, warnings } = await validateFields(creatable, item, data);

      if (countArrays(errors) + countArrays(warnings) > 0) {
        this.setState(() => ({
          validationErrors: errors,
          validationWarnings: warnings,
        }));

        return;
      }
    }

    createItem({
      variables: { data },
    })
      .then(data => {
        this.props.onCreate(data);
        this.setState({ item: this.props.list.getInitialItemData({}) });
      })
      .catch(error => {
        toastError({ addToast, options: { autoDismiss: true } }, error);
      });
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
  formComponent = props => <form autoComplete="off" onSubmit={this.onCreate} {...props} />;
  render() {
    const { isLoading, isOpen, list } = this.props;
    const { item, validationErrors, validationWarnings } = this.state;

    const hasWarnings = countArrays(validationWarnings);
    const hasErrors = countArrays(validationErrors);

    const cypressId = 'create-item-modal-submit-button';

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
            <LoadingButton
              appearance={hasWarnings && !hasErrors ? 'warning' : 'primary'}
              id={cypressId}
              isDisabled={hasErrors}
              isLoading={isLoading}
              onClick={this.onUpdate}
              type="submit"
            >
              {hasWarnings && !hasErrors ? 'Ignore Warnings and Create' : 'Create'}
            </LoadingButton>
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
          <Suspense fallback={<PageLoading />}>
            <AutocompleteCaptor />
            <Render>
              {() => {
                const creatable = list.fields
                  .filter(({ isPrimaryKey }) => !isPrimaryKey)
                  .filter(({ maybeAccess }) => !!maybeAccess.create);

                captureSuspensePromises(creatable.map(field => () => field.initFieldView()));
                return creatable.map((field, i) => (
                  <Render key={field.path}>
                    {() => {
                      let [Field] = field.adminMeta.readViews([field.views.Field]);
                      let onChange = useCallback(value => {
                        this.setState(({ item }) => ({
                          item: {
                            ...item,
                            [field.path]: value,
                          },
                          validationErrors: {},
                          validationWarnings: {},
                        }));
                      }, []);
                      return useMemo(
                        () => (
                          <Field
                            autoFocus={!i}
                            value={item[field.path]}
                            savedValue={item[field.path]}
                            field={field}
                            /* TODO: Permission query results */
                            errors={validationErrors[field.path] || []}
                            warnings={validationWarnings[field.path] || []}
                            onChange={onChange}
                            renderContext="dialog"
                          />
                        ),
                        [
                          i,
                          item[field.path],
                          field,
                          onChange,
                          validationErrors[field.path],
                          validationWarnings[field.path],
                        ]
                      );
                    }}
                  </Render>
                ));
              }}
            </Render>
          </Suspense>
        </div>
      </Drawer>
    );
  }
}

export default function CreateItemModalWithMutation(props) {
  const { list } = props;
  const { addToast } = useToasts();
  return (
    <Mutation mutation={list.createMutation}>
      {(createItem, { loading }) => (
        <CreateItemModal
          createItem={createItem}
          isLoading={loading}
          addToast={addToast}
          {...props}
        />
      )}
    </Mutation>
  );
}
