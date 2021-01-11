/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useMemo, useCallback, Suspense, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useToasts } from 'react-toast-notifications';
import { omit, arrayToObject, countArrays } from '@keystonejs/utils';

import { Button, LoadingButton } from '@arch-ui/button';
import Drawer from '@arch-ui/drawer';
import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { LoadingIndicator } from '@arch-ui/loading';
import Select from '@arch-ui/select';

import { validateFields, handleCreateUpdateMutationError } from '../util';
import { ErrorBoundary } from './ErrorBoundary';

const Render = ({ children }) => children();

const UpdateManyModal = ({ list, items, isOpen, onUpdate, onClose }) => {
  const { addToast } = useToasts();
  const [updateItem, { loading }] = useMutation(list.updateManyMutation, {
    onError: error => handleCreateUpdateMutationError({ error, addToast }),
    refetchQueries: ['getList'],
  });

  const [item, setItem] = useState({});
  const [selectedFields, setSelectedFields] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [validationWarnings, setValidationWarnings] = useState({});

  const handleUpdate = async () => {
    if (loading || countArrays(validationErrors)) {
      return;
    }

    const data = arrayToObject(selectedFields, 'path', field => field.serialize(item));

    if (!countArrays(validationWarnings)) {
      const { errors, warnings } = await validateFields(selectedFields, item, data);

      if (countArrays(errors) + countArrays(warnings) > 0) {
        setValidationErrors(errors);
        setValidationWarnings(warnings);

        return;
      }
    }

    const result = await updateItem({
      variables: {
        data: items.map(id => ({ id, data })),
      },
    });

    // Result will be undefined if a GraphQL error occurs (such as failed validation)
    // Leave the modal open in that case
    if (!result) return;

    resetState();
    onUpdate();
  };

  const resetState = () => {
    setItem(list.getInitialItemData({}));
    setSelectedFields([]);
  };

  const handleClose = () => {
    if (loading) return;
    resetState();
    onClose();
  };

  const onKeyDown = event => {
    if (event.defaultPrevented) return;
    switch (event.key) {
      case 'Escape':
        return handleClose();
      case 'Enter':
        return handleUpdate();
    }
  };

  const handleSelect = selected => {
    setSelectedFields(
      selected
        ? selected.map(({ path, value }) => {
            return list.fields
              .filter(({ isPrimaryKey }) => !isPrimaryKey)
              .find(f => f.path === path || f.path === value);
          })
        : []
    );
  };

  const getOptionValue = option => {
    return option.path || option.value;
  };

  const options = useMemo(
    // remove the `options` key from select type fields
    () =>
      list.fields
        .filter(({ isPrimaryKey, maybeAccess }) => !isPrimaryKey && !!maybeAccess.update)
        .map(f => omit(f, ['options'])),
    []
  );

  const hasWarnings = countArrays(validationWarnings);
  const hasErrors = countArrays(validationErrors);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      closeOnBlanketClick
      heading={`Update ${list.formatCount(items)}`}
      onKeyDown={onKeyDown}
      slideInFrom="left"
      footer={
        <Fragment>
          <LoadingButton
            appearance={hasWarnings && !hasErrors ? 'warning' : 'primary'}
            isDisabled={hasErrors || selectedFields.length === 0}
            isLoading={loading}
            onClick={handleUpdate}
          >
            {hasWarnings && !hasErrors ? 'Ignore Warnings and Update' : 'Update'}
          </LoadingButton>
          <Button appearance="warning" variant="subtle" onClick={handleClose}>
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
            onChange={handleSelect}
            options={options}
            tabSelectsValue={false}
            value={selectedFields}
            getOptionValue={getOptionValue}
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
                const [Field] = field.readViews([field.views.Field]);
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const onChange = useCallback(
                  value => {
                    setItem(prev => ({ ...prev, [field.path]: value }));
                    setValidationErrors({});
                    setValidationWarnings({});
                  },
                  [field]
                );
                // eslint-disable-next-line react-hooks/rules-of-hooks
                return useMemo(
                  () => (
                    <ErrorBoundary>
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
                    </ErrorBoundary>
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
};

export default UpdateManyModal;
