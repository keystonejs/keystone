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
import { useHistory } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useToasts } from 'react-toast-notifications';

import { Button, LoadingButton } from '@arch-ui/button';
import Drawer from '@arch-ui/drawer';
import Confirm from '@arch-ui/confirm';
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
import { ErrorBoundary } from './ErrorBoundary';

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

const CreateItemModal = ({ prefillData = {}, onClose, onCreate, viewOnSave }) => {
  const { list, closeCreateItemModal, isCreateItemModalOpen } = useList();

  const [item, setItem] = useState(list.getInitialItemData({ prefill: prefillData }));
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [validationWarnings, setValidationWarnings] = useState({});

  const history = useHistory();
  const { addToast } = useToasts();

  const [createItem, { loading }] = useMutation(list.createMutation, {
    onError: error => handleCreateUpdateMutationError({ error, addToast }),
    refetchQueries: ['getList', 'RelationshipSelect'],
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

    if (viewOnSave) {
      const newItemID = savedData.data[list.gqlNames.createMutationName].id;
      history.push(`${list.fullPath}/${newItemID}`);
    }
  });

  // Identifies if the user has changed the initial data in the form.
  const hasFormDataChanged = () => {
    const data = arrayToObject(creatable, 'path');
    let hasChanged = false;
    const initialData = list.getInitialItemData({ prefill: prefillData });
    const initialValues = getValues(data, initialData);
    const currentValues = getValues(data, item);
    for (const path of Object.keys(currentValues)) {
      if (data[path].hasChanged(initialValues, currentValues)) {
        hasChanged = true;
        break;
      }
    }
    return hasChanged;
  };

  const _createItemModalClose = () => {
    closeCreateItemModal();
    setItem(list.getInitialItemData({}));
    if (onClose) {
      const data = arrayToObject(creatable, 'path', field => field.serialize(item));
      onClose(data);
    }
  };

  const _onClose = () => {
    if (loading) return;
    if (hasFormDataChanged()) {
      // Ask for user confirmation before canceling.
      setConfirmOpen(true);
      return;
    }
    _createItemModalClose();
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
                .filter(({ isReadOnly }) => !isReadOnly)
                .filter(({ maybeAccess }) => !!maybeAccess.create);

              captureSuspensePromises(creatable.map(field => () => field.initFieldView()));

              return creatable.map((field, i) => (
                <Render key={field.path}>
                  {() => {
                    const [Field] = field.readViews([field.views.Field]);
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const onChange = useCallback(value => {
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
                        <ErrorBoundary>
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
                        </ErrorBoundary>
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
          <ConfirmModal
            isOpen={isConfirmOpen}
            onConfirm={() => {
              setConfirmOpen(false);
              _createItemModalClose();
            }}
            onCancel={() => setConfirmOpen(false)}
          />
        </Suspense>
      </div>
    </Drawer>
  );
};

const ConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
  return (
    <Confirm isOpen={isOpen}>
      <p style={{ marginTop: 0 }}>
        All of your form data will be lost. Are you sure you want to cancel?
      </p>
      <footer>
        <Button appearance="danger" variant="ghost" onClick={onConfirm}>
          Ok
        </Button>
        <Button variant="subtle" onClick={onCancel}>
          Cancel
        </Button>
      </footer>
    </Confirm>
  );
};

export default CreateItemModal;
