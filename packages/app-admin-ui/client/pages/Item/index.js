/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, Suspense, useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useHistory, useParams } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import memoizeOne from 'memoize-one';

import { Container } from '@arch-ui/layout';
import { Button } from '@arch-ui/button';
import { AutocompleteCaptor } from '@arch-ui/input';
import { Card } from '@arch-ui/card';
import { gridSize } from '@arch-ui/theme';
import {
  mapKeys,
  arrayToObject,
  omitBy,
  captureSuspensePromises,
  countArrays,
} from '@keystonejs/utils';

import CreateItemModal from '../../components/CreateItemModal';
import DeleteItemModal from '../../components/DeleteItemModal';
import DocTitle from '../../components/DocTitle';
import PageError from '../../components/PageError';
import PageLoading from '../../components/PageLoading';
import PreventNavigation from '../../components/PreventNavigation';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import Footer from './Footer';
import {
  deconstructErrorsToDataShape,
  toastItemSuccess,
  validateFields,
  handleCreateUpdateMutationError,
} from '../../util';
import { ItemTitle } from './ItemTitle';
import { ItemProvider } from '../../providers/Item';
import { useList } from '../../providers/List';
import { useUIHooks } from '../../providers/Hooks';

const Render = ({ children }) => children();

const Form = props => <form css={{ marginBottom: `${gridSize * 3}px` }} {...props} />;

// TODO: show updateInProgress and updateSuccessful / updateFailed UI

const getValues = (fieldsObject, item) => mapKeys(fieldsObject, field => field.serialize(item));

const checkIsReadOnly = ({ maybeAccess, isReadOnly }) => !maybeAccess.update || !!isReadOnly;

// Memoizing allows us to reduce the calls to `.serialize` when data hasn't
// changed.
const getInitialValues = memoizeOne(getValues);
const getCurrentValues = memoizeOne(getValues);

const deserializeItem = memoizeOne((list, data) => list.deserializeItemData(data));

const getRenderableFields = memoizeOne(list =>
  list.fields.filter(({ isPrimaryKey }) => !isPrimaryKey)
);

const ItemDetails = ({ list, item: initialData, itemErrors, onUpdate }) => {
  const [item, setItem] = useState(initialData);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [validationWarnings, setValidationWarnings] = useState({});

  const itemHasChanged = useRef(false);
  const deleteConfirmed = useRef(false);

  const history = useHistory();
  const { addToast } = useToasts();
  const { customToast } = useUIHooks();

  const [updateItem, { loading: updateInProgress }] = useMutation(list.updateMutation, {
    onError: error => handleCreateUpdateMutationError({ error, addToast }),
  });

  const getFieldsObject = memoizeOne(() =>
    arrayToObject(
      // NOTE: We _exclude_ read only fields
      getRenderableFields(list).filter(({ config }) => !config.isReadOnly),
      'path'
    )
  );

  const mounted = useRef();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown, false);
    return () => {
      document.removeEventListener('keydown', onKeyDown, false);
    };
  }, []);

  const onKeyDown = event => {
    if (event.defaultPrevented) return;

    switch (event.key) {
      case 'Enter':
        if (event.metaKey) {
          return onSave();
        }
    }
  };

  const onDelete = () => {
    deleteConfirmed.current = true;
    if (mounted) {
      setShowDeleteModal(false);
    }

    toastItemSuccess(
      { addToast, customToast },
      { item: initialData, list },
      'Deleted successfully',
      'delete'
    );
    history.replace(list.getFullPersistentPath());
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const onReset = () => {
    setItem(initialData);
    itemHasChanged.current = false;
  };

  const onSave = async () => {
    // There are errors, no need to proceed - the entire save can be aborted.
    if (countArrays(validationErrors)) {
      return;
    }

    const fieldsObject = getFieldsObject();

    const initialValues = getInitialValues(fieldsObject, initialData);
    const currentValues = getCurrentValues(fieldsObject, item);

    // Don't try to update anything that hasn't changed.
    // This is particularly important for access control where a field
    // may be `read: true, update: false`, so will appear in the item
    // details, but is not editable, and would cause an error if a value
    // was sent as part of the update query.
    const data = omitBy(
      currentValues,
      path => !fieldsObject[path].hasChanged(initialValues, currentValues)
    );

    const fields = Object.values(omitBy(fieldsObject, path => !data.hasOwnProperty(path)));

    // On the first pass through, there wont be any warnings, so we go ahead
    // and check.
    // On the second pass through, there _may_ be warnings, and by this point
    // we know there are no errors (see the `validationErrors` check above),
    // if so, we let the user force the update through anyway and hence skip
    // this check.
    // Later, on every change, we reset the warnings, so we know if things
    // have changed since last time we checked.
    if (!countArrays(validationWarnings)) {
      const { errors, warnings } = await validateFields(fields, item, data);

      const totalErrors = countArrays(errors);
      const totalWarnings = countArrays(warnings);

      if (totalErrors + totalWarnings > 0) {
        const messages = [];
        if (totalErrors > 0) {
          messages.push(`${totalErrors} error${totalErrors > 1 ? 's' : ''}`);
        }

        if (totalWarnings > 0) {
          messages.push(`${totalWarnings} warning${totalWarnings > 1 ? 's' : ''}`);
        }

        addToast(`Validation failed: ${messages.join(' and ')}.`, {
          autoDismiss: true,
          appearance: errors.length ? 'error' : 'warning',
        });

        setValidationErrors(errors);
        setValidationWarnings(warnings);

        return;
      }
    }

    // Cache the current item data at the time of saving.
    const itemSaveCheckCache = item;

    // The result will be undefined if an error (such as access denial) occurred.
    const mutationResult = await updateItem({ variables: { id: item.id, data } });
    if (!mutationResult) {
      return;
    }

    setValidationErrors({});
    setValidationWarnings({});

    // we only want to set itemHasChanged to false
    // when it hasn't changed since we did the mutation
    // otherwise a user could edit the data and
    // accidentally close the page without a warning
    if (item === itemSaveCheckCache) {
      itemHasChanged.current = false;
    }

    const savedItem = await onUpdate();

    // Defer the toast to this point since it ensures up-to-date data, such as for _label_.
    toastItemSuccess(
      { addToast, customToast },
      { item: savedItem, list },
      'Saved successfully',
      'update'
    );

    // No changes since we kicked off the item saving.
    // Then reset the state to the current server value
    // This ensures we are able to pass any extra information returned
    // from the server that otherwise would be unknown to client state
    if (!itemHasChanged.current) {
      setItem(savedItem);
    }
  };

  return (
    <Fragment>
      {itemHasChanged.current && !deleteConfirmed.current && <PreventNavigation />}
      <ItemTitle id={item.id} list={list} titleText={initialData._label_} />
      <Card css={{ marginBottom: '3em', paddingBottom: 0 }}>
        <Form>
          <AutocompleteCaptor />
          {getRenderableFields(list).map((field, i) => (
            <Render key={field.path}>
              {() => {
                const [Field] = field.readViews([field.views.Field]);
                const isReadOnly = checkIsReadOnly(field) || !list.access.update;
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const onChange = useCallback(
                  value => {
                    setItem(oldItem => {
                      // Don't flag things as changed if they're not actually changed
                      if (oldItem[field.path] === value) {
                        return oldItem;
                      }

                      setValidationErrors({});
                      setValidationWarnings({});

                      itemHasChanged.current = true;

                      return {
                        ...oldItem,
                        [field.path]: value,
                      };
                    });
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
                        list={list}
                        item={item}
                        isDisabled={isReadOnly}
                        errors={[
                          ...(itemErrors[field.path] ? [itemErrors[field.path]] : []),
                          ...(validationErrors[field.path] || []),
                        ]}
                        warnings={validationWarnings[field.path] || []}
                        value={item[field.path]}
                        savedValue={initialData[field.path]}
                        onChange={onChange}
                        renderContext="page"
                      />
                    </ErrorBoundary>
                  ),
                  [
                    i,
                    field,
                    list,
                    itemErrors[field.path],
                    item[field.path],
                    item.id,
                    validationErrors[field.path],
                    validationWarnings[field.path],
                    initialData[field.path],
                    onChange,
                    isReadOnly,
                  ]
                );
              }}
            </Render>
          ))}
        </Form>
        <Footer
          onSave={onSave}
          onDelete={openDeleteModal}
          canReset={itemHasChanged.current && !updateInProgress}
          onReset={onReset}
          updateInProgress={updateInProgress}
          hasWarnings={countArrays(validationWarnings)}
          hasErrors={countArrays(validationErrors)}
        />
      </Card>

      <CreateItemModal viewOnSave />
      <DeleteItemModal
        isOpen={showDeleteModal}
        item={initialData}
        list={list}
        onClose={closeDeleteModal}
        onDelete={onDelete}
      />
    </Fragment>
  );
};

const ItemNotFound = ({ errorMessage, list }) => (
  <PageError>
    <p>Couldn't find a {list.singular} matching that ID</p>
    <Button to={list.fullPath} variant="ghost">
      Back to List
    </Button>
    {errorMessage && (
      <p style={{ fontSize: '0.75rem', marginTop: `${gridSize * 4}px` }}>
        <code>{errorMessage}</code>
      </p>
    )}
  </PageError>
);

const ItemPage = () => {
  const { itemId } = useParams();
  const { list } = useList();

  // network-only because the data we mutate with is important for display
  // in the UI, and may be different than what's in the cache
  // NOTE: We specifically trigger this query here, before the later code which
  // could Suspend which allows the code and data to load in parallel.
  const { loading, error, data, refetch } = useQuery(list.itemQuery, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
    variables: { id: itemId },
  });

  // Now that the network request for data has been triggered, we
  // try to initialise the fields. They are Suspense capable, so may
  // throw Promises which will be caught by the wrapping <Suspense>
  captureSuspensePromises([
    // NOTE: We should really filter out non-renderable fields here, but there's
    // an edgecase where deserialising will include all fields (even
    // non-renderable ones), so we have to ensure the field views are all loaded
    // even if they may not be used. This is particularly salient for the
    // Content field which needs its views loaded to correctly deserialize.
    // Ideally we'd use getRenderableFields() here.
    ...list.fields.map(field => () => field.initFieldView()),
    // Deserialising requires the field be loaded and also any of its
    // deserialisation dependencies (eg; the Content field relies on the Blocks
    // being loaded), so it too could suspend here.
    () =>
      deserializeItem(
        list,
        loading || !data
          ? {}
          : data[list.gqlNames.itemQueryName]
          ? data[list.gqlNames.itemQueryName]
          : {}
      ),
  ]);

  // If the views load before the API request comes back, keep showing
  // the loading component
  // Ideally we'd throw a Promise here, but Apollo doesn't expose a "loaded"
  // promise from the hooks.
  if (loading) return <PageLoading />;

  // Only show error page if there is no data
  // (ie; there could be partial data + partial errors)
  if (
    error &&
    (!data ||
      !data[list.gqlNames.itemQueryName] ||
      !Object.keys(data[list.gqlNames.itemQueryName]).length)
  ) {
    return (
      <Fragment>
        <DocTitle title={`${list.singular} not found`} />
        <ItemNotFound errorMessage={error.message} list={list} />
      </Fragment>
    );
  }

  // Now that everything is loaded and didn't error, we can confidently gather
  // up all the required data for display
  const item = deserializeItem(list, data[list.gqlNames.itemQueryName]);
  const itemErrors = deconstructErrorsToDataShape(error)[list.gqlNames.itemQueryName] || {};

  if (!item) {
    return <ItemNotFound list={list} />;
  }

  return (
    <ItemProvider item={item}>
      <main>
        <DocTitle title={`${item._label_} — ${list.singular}`} />
        <Container id="toast-boundary">
          <ItemDetails
            item={item}
            itemErrors={itemErrors}
            key={itemId}
            list={list}
            onUpdate={async () => {
              const { data } = await refetch();
              return deserializeItem(list, data[list.gqlNames.itemQueryName]);
            }}
          />
        </Container>
      </main>
    </ItemProvider>
  );
};

export default props => (
  <Suspense fallback={<PageLoading />}>
    <ItemPage {...props} />
  </Suspense>
);
