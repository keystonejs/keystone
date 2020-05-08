/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  Fragment,
  useCallback,
  useMemo,
  Suspense,
  useState,
  useRef,
  useEffect,
  forwardRef,
} from 'react';
import { useMutation } from '@apollo/react-hooks';
import { useToasts } from 'react-toast-notifications';

import { Button, LoadingButton } from '@arch-ui/button';
import Drawer from '@arch-ui/drawer';
import {
  arrayToObject,
  captureSuspensePromises,
  countArrays,
  mapKeys,
  omitBy,
} from '@keystonejs/utils';
import { gridSize } from '@arch-ui/theme';
import { AutocompleteCaptor } from '@arch-ui/input';

import PageLoading from './PageLoading';
import { useList } from '../providers/List';
import { validateFields, handleCreateUpdateMutationError } from '../util';

const Render = ({ children }) => children();

const getValues = (fieldsObject, item) => mapKeys(fieldsObject, field => field.serialize(item));

const useEventCallback = callback => {
  const callbackRef = useRef(callback);
  const cb = useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
  useEffect(() => {
    callbackRef.current = callback;
  });
  return cb;
};

const CreateItemModal = ({ prefillData = {}, onClose, onCreate }) => {
  const { list, closeCreateItemModal, isCreateItemModalOpen } = useList();
  const [item, setItem] = useState(list.getInitialItemData({ prefill: prefillData }));
  const [validationErrors, setValidationErrors] = useState({});
  const [validationWarnings, setValidationWarnings] = useState({});

  const { addToast } = useToasts();
  const [createItem, { loading }] = useMutation(list.createMutation, {
    errorPolicy: 'all',
    onError: error => handleCreateUpdateMutationError({ error, addToast }),
  });

  const { fields } = list;
  const creatable = fields
    .filter(({ isPrimaryKey }) => !isPrimaryKey)
    .filter(({ maybeAccess }) => !!maybeAccess.create);

  const _onCreate = useEventCallback(async event => {
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

    const fieldsObject = arrayToObject(creatable, 'path');

    const initialData = list.getInitialItemData({ prefill: prefillData });
    const initialValues = getValues(fieldsObject, initialData);
    const currentValues = getValues(fieldsObject, item);

    // 'null' is explicit for the blank fields when making a GraphQL
    // request. This prevents the `knex` DB-level default values to be applied
    // correctly, But, if we exclude the blank field altogether, default values
    // (knex DB-level default) are respected. Additionally, we need to make sure
    // that we don't omit the required fields for client-side input validation.
    const hasNotChangedAndIsNotRequired = path => {
      const hasChanged = fieldsObject[path].hasChanged(initialValues, currentValues);
      const isRequired = fieldsObject[path].isRequired;
      return !hasChanged && !isRequired;
    };

    const data = omitBy(currentValues, hasNotChangedAndIsNotRequired);

    const fields = Object.values(omitBy(fieldsObject, path => !data.hasOwnProperty(path)));

    if (loading) return;

    if (countArrays(validationErrors)) return;
    if (!countArrays(validationWarnings)) {
      const { errors, warnings } = await validateFields(fields, item, data);

      if (countArrays(errors) + countArrays(warnings) > 0) {
        setValidationErrors(errors);
        setValidationWarnings(warnings);
        return;
      }
    }

    const savedData = await createItem({ variables: { data } });
    if (!savedData) return;

    closeCreateItemModal();
    setItem(list.getInitialItemData({}));

    if (onCreate) {
      onCreate(savedData);
    }
  });

  const _onClose = () => {
    if (loading) return;
    closeCreateItemModal();
    setItem(list.getInitialItemData({}));
    const data = arrayToObject(creatable, 'path', field => field.serialize(item));
    if (onClose) {
      onClose(data);
    }
  };

  const _onKeyDown = event => {
    if (event.defaultPrevented) return;
    switch (event.key) {
      case 'Escape':
        return _onClose();
    }
  };

  const formComponent = useCallback(
    forwardRef((props, ref) => (
      <form ref={ref} autoComplete="off" onSubmit={_onCreate} {...props} />
    )),
    [_onCreate]
  );

  const hasWarnings = countArrays(validationWarnings);
  const hasErrors = countArrays(validationErrors);
  const cypressId = 'create-item-modal-submit-button';
  return (
    <Drawer
      closeOnBlanketClick
      component={formComponent}
      isOpen={isCreateItemModalOpen}
      onClose={_onClose}
      heading={`Create ${list.singular}`}
      onKeyDown={_onKeyDown}
      slideInFrom="right"
      footer={
        <Fragment>
          <LoadingButton
            appearance={hasWarnings && !hasErrors ? 'warning' : 'primary'}
            id={cypressId}
            isDisabled={hasErrors}
            isLoading={loading}
            type="submit"
          >
            {hasWarnings && !hasErrors ? 'Ignore Warnings and Create' : 'Create'}
          </LoadingButton>
          <Button appearance="warning" variant="subtle" onClick={_onClose}>
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
                    let [Field] = field.readViews([field.views.Field]);
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    let onChange = useCallback(value => {
                      setItem(item => ({
                        ...item,
                        [field.path]: value,
                      }));
                      setValidationErrors({});
                      setValidationWarnings({});
                    }, []);
                    // eslint-disable-next-line react-hooks/rules-of-hooks
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
};

export default CreateItemModal;
