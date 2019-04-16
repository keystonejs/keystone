/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, Fragment, useMemo, useCallback } from 'react';
import styled from '@emotion/styled';
import { Mutation, Query } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { withToastManager } from 'react-toast-notifications';
import memoizeOne from 'memoize-one';
import isEqual from 'lodash.isequal';

import { Container } from '@arch-ui/layout';
import { Button } from '@arch-ui/button';
import { AutocompleteCaptor } from '@arch-ui/input';
import { Card } from '@arch-ui/card';
import { gridSize } from '@arch-ui/theme';
import { resolveAllKeys, arrayToObject, omitBy } from '@keystone-alpha/utils';

import CreateItemModal from '../../components/CreateItemModal';
import DeleteItemModal from '../../components/DeleteItemModal';
import DocTitle from '../../components/DocTitle';
import PageError from '../../components/PageError';
import PageLoading from '../../components/PageLoading';
import PreventNavigation from '../../components/PreventNavigation';
import Footer from './Footer';
import { deconstructErrorsToDataShape, toastItemSuccess, toastError } from '../../util';
import { ItemTitle } from './ItemTitle';

let Render = ({ children }) => children();

const Form = styled.form({
  marginBottom: gridSize * 3,
});

// TODO: show updateInProgress and updateSuccessful / updateFailed UI

const getValues = (fields, item) =>
  resolveAllKeys(arrayToObject(fields, 'path', field => field.getValue(item)));

// Memoizing allows us to reduce the calls to `.getValue` when data hasn't
// changed.
const getInitialValues = memoizeOne(getValues);
const getCurrentValues = memoizeOne(getValues);

const ItemDetails = withRouter(
  class ItemDetails extends Component {
    state = {
      item: this.props.item,
      itemHasChanged: false,
      showCreateModal: false,
      showDeleteModal: false,
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
      const { adminPath, history, list, item, toastManager } = this.props;
      deletePromise
        .then(() => {
          if (this.mounted) {
            this.setState({ showDeleteModal: false });
          }
          history.push(`${adminPath}/${list.path}`);

          toastItemSuccess(toastManager, item, 'Deleted successfully');
        })
        .catch(error => {
          toastError(toastManager, error);
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

    onSave = () => {
      const { item } = this.state;
      const {
        list: { fields },
        onUpdate,
        toastManager,
        updateItem,
        item: initialData,
      } = this.props;

      Promise.all([getInitialValues(fields, initialData), getCurrentValues(fields, item)])
        .then(([initialValues, currentValues]) =>
          // Don't try to update anything that hasn't changed.
          // This is particularly important for access control where a field
          // may be `read: true, update: false`, so will appear in the item
          // details, but is not editable, and would cause an error if a value
          // was sent as part of the update query.
          omitBy(currentValues, path => isEqual(initialValues[path], currentValues[path]))
        )
        .then(data => updateItem({ variables: { id: item.id, data } }))
        .then(() => {
          const toastContent = (
            <div>
              {item._label_ ? <strong>{item._label_}</strong> : null}
              <div>Saved successfully</div>
            </div>
          );

          toastManager.add(toastContent, {
            autoDismiss: true,
            appearance: 'success',
          });
          this.setState(state => {
            // we only want to set itemHasChanged to false
            // when it hasn't changed since we did the mutation
            // otherwise a user could edit the data and
            // accidentally close the page without a warning
            if (state.item === item) {
              return { itemHasChanged: false };
            }
            return null;
          });
        })
        .then(onUpdate);
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
      const { item, itemHasChanged } = this.state;
      // we want to read all of the fields before reading the views individually
      // note we want to _read_ before not just preload because the important thing
      // isn't doing all the requests in parallel, that already happens
      // what we're doing here is making sure there aren't a bunch of rerenders as
      // each of the promises resolve
      // this probably won't be necessary with concurrent mode/maybe just other react changes
      // also, note that this is just an optimisation, it's not strictly necessary and it should
      // probably be removed in the future because i'm guessing this will make performance _worse_ in concurrent mode
      list.adminMeta.readViews(list.fields.map(({ views }) => views.Field));

      return (
        <Fragment>
          {itemHasChanged && <PreventNavigation />}
          <ItemTitle
            onCreateClick={this.openCreateModal}
            item={item}
            list={list}
            adminPath={adminPath}
            titleText={savedData._label_}
          />
          <Card css={{ marginBottom: '3em', paddingBottom: 0 }}>
            <Form>
              <AutocompleteCaptor />
              {list.fields.map((field, i) => {
                return (
                  <Render key={field.path}>
                    {() => {
                      let [Field] = field.adminMeta.readViews([field.views.Field]);

                      let onChange = useCallback(
                        value => {
                          this.setState(({ item: itm }) => ({
                            item: {
                              ...itm,
                              [field.path]: value,
                            },
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
                            error={itemErrors[field.path]}
                            value={item[field.path]}
                            onChange={onChange}
                            renderContext="page"
                          />
                        ),
                        [i, field, itemErrors[field.path], item[field.path]]
                      );
                    }}
                  </Render>
                );
              })}
            </Form>
            <Footer
              onSave={this.onSave}
              onDelete={this.openDeleteModal}
              canReset={itemHasChanged && !updateInProgress}
              onReset={this.onReset}
              updateInProgress={updateInProgress}
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

const ItemPage = ({ list, itemId, adminPath, getListByKey, toastManager }) => {
  const itemQuery = list.getItemQuery(itemId);
  return (
    <Fragment>
      {/* network-only because the data we mutate with is important for display
          in the UI, and may be different than what's in the cache */}
      <Query query={itemQuery} fetchPolicy="network-only" errorPolicy="all">
        {({ loading, error, data, refetch }) => {
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

          const item = data[list.gqlNames.itemQueryName];
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

                    toastManager.add(toastContent, {
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
                        onUpdate={refetch}
                        toastManager={toastManager}
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
    </Fragment>
  );
};

export default withToastManager(ItemPage);
