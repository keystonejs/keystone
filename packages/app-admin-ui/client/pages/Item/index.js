/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, Fragment, Suspense, useMemo, useCallback } from 'react';
import styled from '@emotion/styled';
import { Mutation, Query } from 'react-apollo';
import { withRouter } from 'react-router-dom';
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
import Footer from './Footer';
import {
  deconstructErrorsToDataShape,
  toastItemSuccess,
  toastError,
  validateFields,
} from '../../util';
import { ItemTitle } from './ItemTitle';

let Render = ({ children }) => children();

const Form = styled.form({
  marginBottom: gridSize * 3,
});

// TODO: show updateInProgress and updateSuccessful / updateFailed UI

const getValues = (fieldsObject, item) => mapKeys(fieldsObject, field => field.serialize(item));

// Memoizing allows us to reduce the calls to `.serialize` when data hasn't
// changed.
const getInitialValues = memoizeOne(getValues);
const getCurrentValues = memoizeOne(getValues);

const deserializeItem = memoizeOne((list, data) =>
  list.deserializeItemData(data[list.gqlNames.itemQueryName])
);

const ItemDetails = withRouter(
  class ItemDetails extends Component {
    constructor(props) {
      super(props);
      // memoized function so we can call it multiple times _per component_
      this.getFieldsObject = memoizeOne(() =>
        arrayToObject(
          props.list.fields
            .filter(({ isPrimaryKey }) => !isPrimaryKey)
            .filter(({ maybeAccess }) => !!maybeAccess.update),
          'path'
        )
      );
    }

    state = {
      item: this.props.item,
      itemHasChanged: false,
      showCreateModal: false,
      showDeleteModal: false,
      validationErrors: {},
      validationWarnings: {},
    };

    componentDidMount() {
      this.mounted = true;
      document.addEventListener('keydown', this.onKeyDown, false);
    }
    componentWillUnmount() {
      this.mounted = false;
      document.removeEventListener('keydown', this.onKeyDown, false);
    }
    onKeyDown = event => {
      if (event.defaultPrevented) return;

      switch (event.key) {
        case 'Enter':
          if (event.metaKey) {
            return this.onSave();
          }
      }
    };
    onDelete = deletePromise => {
      const {
        adminPath,
        history,
        list,
        item,
        toastManager: { addToast },
      } = this.props;

      deletePromise
        .then(() => {
          if (this.mounted) {
            this.setState({ showDeleteModal: false });
          }
          history.push(`${adminPath}/${list.path}`);

          toastItemSuccess({ addToast }, item, 'Deleted successfully');
        })
        .catch(error => {
          toastError({ addToast }, error);
        });
    };

    openDeleteModal = () => {
      this.setState({ showDeleteModal: true });
    };
    closeDeleteModal = () => {
      this.setState({ showDeleteModal: false });
    };

    onReset = () => {
      this.setState({
        item: this.props.item,
        itemHasChanged: false,
      });
    };

    renderDeleteModal() {
      const { showDeleteModal } = this.state;
      const { item, list } = this.props;

      return (
        <DeleteItemModal
          isOpen={showDeleteModal}
          item={item}
          list={list}
          onClose={this.closeDeleteModal}
          onDelete={this.onDelete}
        />
      );
    }

    onSave = async () => {
      const { item, validationErrors, validationWarnings } = this.state;

      // There are errors, no need to proceed - the entire save can be aborted.
      if (countArrays(validationErrors)) {
        return;
      }

      const {
        onUpdate,
        toastManager: { addToast },
        updateItem,
        item: initialData,
      } = this.props;

      const fieldsObject = this.getFieldsObject();

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

          this.setState(() => ({
            validationErrors: errors,
            validationWarnings: warnings,
          }));

          return;
        }
      }

      updateItem({ variables: { id: item.id, data } })
        .then(() => {
          const toastContent = (
            <div>
              {item._label_ ? <strong>{item._label_}</strong> : null}
              <div>Saved successfully</div>
            </div>
          );

          addToast(toastContent, {
            autoDismiss: true,
            appearance: 'success',
          });
          this.setState(state => {
            const newState = {
              validationErrors: {},
              validationWarnings: {},
            };
            // we only want to set itemHasChanged to false
            // when it hasn't changed since we did the mutation
            // otherwise a user could edit the data and
            // accidentally close the page without a warning
            if (state.item === item) {
              newState.itemHasChanged = false;
            }
            return newState;
          });
        })
        .then(onUpdate)
        .then(savedItem => {
          // No changes since we kicked off the item saving
          if (!this.state.itemHasChanged) {
            // Then reset the state to the current server value
            // This ensures we are able to pass any extra information returned
            // from the server that otherwise would be unknown to client state
            this.setState({
              item: savedItem,
            });
          }
        });
    };

    /**
     * Create item
     */
    openCreateModal = () => this.setState({ showCreateModal: true });
    closeCreateModal = () => this.setState({ showCreateModal: false });
    renderCreateModal = () => (
      <CreateItemModal
        isOpen={this.state.showCreateModal}
        list={this.props.list}
        onClose={this.closeCreateModal}
        onCreate={this.onCreate}
      />
    );
    onCreate = ({ data }) => {
      const { list, adminPath, history } = this.props;
      const { id } = data[list.gqlNames.createMutationName];
      history.push(`${adminPath}/${list.path}/${id}`);
    };

    render() {
      const { adminPath, list, updateInProgress, itemErrors, item: savedData } = this.props;
      const { item, itemHasChanged, validationErrors, validationWarnings } = this.state;

      return (
        <Fragment>
          {itemHasChanged && <PreventNavigation />}
          <ItemTitle
            onCreateClick={this.openCreateModal}
            id={item.id}
            list={list}
            adminPath={adminPath}
            titleText={savedData._label_}
          />
          <Card css={{ marginBottom: '3em', paddingBottom: 0 }}>
            <Form>
              <AutocompleteCaptor />
              {list.fields
                .filter(({ isPrimaryKey }) => !isPrimaryKey)
                .filter(({ maybeAccess }) => !!maybeAccess.update)
                .map((field, i) => (
                  <Render key={field.path}>
                    {() => {
                      const [Field] = field.adminMeta.readViews([field.views.Field]);

                      let onChange = useCallback(
                        value => {
                          this.setState(({ item: itm }) => ({
                            item: {
                              ...itm,
                              [field.path]: value,
                            },
                            validationErrors: {},
                            validationWarnings: {},
                            itemHasChanged: true,
                          }));
                        },
                        [field]
                      );

                      return useMemo(
                        () => (
                          <Field
                            autoFocus={!i}
                            field={field}
                            list={list}
                            item={item}
                            errors={[
                              ...(itemErrors[field.path] ? [itemErrors[field.path]] : []),
                              ...(validationErrors[field.path] || []),
                            ]}
                            warnings={validationWarnings[field.path] || []}
                            value={item[field.path]}
                            savedValue={savedData[field.path]}
                            onChange={onChange}
                            renderContext="page"
                          />
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
                          savedData[field.path],
                          onChange,
                        ]
                      );
                    }}
                  </Render>
                ))}
            </Form>
            <Footer
              onSave={this.onSave}
              onDelete={this.openDeleteModal}
              canReset={itemHasChanged && !updateInProgress}
              onReset={this.onReset}
              updateInProgress={updateInProgress}
              hasWarnings={countArrays(validationWarnings)}
              hasErrors={countArrays(validationErrors)}
            />
          </Card>

          {this.renderCreateModal()}
          {this.renderDeleteModal()}
        </Fragment>
      );
    }
  }
);
const ItemNotFound = ({ adminPath, errorMessage, list }) => (
  <PageError>
    <p>Couldn't find a {list.singular} matching that ID</p>
    <Button to={`${adminPath}/${list.path}`} variant="ghost">
      Back to List
    </Button>
    {errorMessage ? (
      <p style={{ fontSize: '0.75rem', marginTop: gridSize * 4 }}>
        <code>{errorMessage}</code>
      </p>
    ) : null}
  </PageError>
);

const ItemPage = ({ list, itemId, adminPath, getListByKey }) => {
  const itemQuery = list.getItemQuery(itemId);
  const { addToast } = useToasts();
  return (
    <Suspense fallback={<PageLoading />}>
      {/* network-only because the data we mutate with is important for display
          in the UI, and may be different than what's in the cache */}
      <Query query={itemQuery} fetchPolicy="network-only" errorPolicy="all">
        {({ loading, error, data, refetch }) => {
          // Now that the network request for data has been triggered, we
          // try to initialise the fields. They are Suspense capable, so may
          // throw Promises which will be caught by the above <Suspense>
          captureSuspensePromises(
            list.fields
              .filter(({ isPrimaryKey }) => !isPrimaryKey)
              .filter(({ maybeAccess }) => !!maybeAccess.update)
              .map(field => () => field.initFieldView())
          );

          // If the views load before the API request comes back, keep showing
          // the loading component
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
                <DocTitle>{list.singular} not found</DocTitle>
                <ItemNotFound adminPath={adminPath} errorMessage={error.message} list={list} />
              </Fragment>
            );
          }

          const item = deserializeItem(list, data);
          const itemErrors = deconstructErrorsToDataShape(error)[list.gqlNames.itemQueryName] || {};

          return item ? (
            <main>
              <DocTitle>
                {item._label_} - {list.singular}
              </DocTitle>
              <Container id="toast-boundary">
                <Mutation
                  mutation={list.updateMutation}
                  onError={updateError => {
                    const [title, ...rest] = updateError.message.split(/\:/);
                    const toastContent = rest.length ? (
                      <div>
                        <strong>{title.trim()}</strong>
                        <div>{rest.join('').trim()}</div>
                      </div>
                    ) : (
                      updateError.message
                    );

                    addToast(toastContent, {
                      appearance: 'error',
                    });
                  }}
                >
                  {(updateItem, { loading: updateInProgress, error: updateError }) => {
                    return (
                      <ItemDetails
                        adminPath={adminPath}
                        item={item}
                        itemErrors={itemErrors}
                        key={itemId}
                        list={list}
                        getListByKey={getListByKey}
                        onUpdate={() =>
                          refetch().then(refetchedData => deserializeItem(list, refetchedData.data))
                        }
                        toastManager={{ addToast }}
                        updateInProgress={updateInProgress}
                        updateErrorMessage={updateError && updateError.message}
                        updateItem={updateItem}
                      />
                    );
                  }}
                </Mutation>
              </Container>
            </main>
          ) : (
            <ItemNotFound adminPath={adminPath} list={list} />
          );
        }}
      </Query>
    </Suspense>
  );
};

export default ItemPage;
