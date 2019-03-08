/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, Fragment, useMemo, useCallback } from 'react';
import styled from '@emotion/styled';
import { Mutation, Query } from 'react-apollo';
import { withToastManager } from 'react-toast-notifications';

import { viewLoadables } from '../../providers/loadables';
import { withRouter, Link } from '../../providers/Router';
import CreateItemModal from '../../components/CreateItemModal';
import DeleteItemModal from '../../components/DeleteItemModal';
import DocTitle from '../../components/DocTitle';
import PageError from '../../components/PageError';
import PageLoading from '../../components/PageLoading';
import PreventNavigation from '../../components/PreventNavigation';
import Footer from './Footer';
import { Container } from '@arch-ui/layout';
import { Button } from '@arch-ui/button';
import { AutocompleteCaptor } from '@arch-ui/input';
import { gridSize } from '@arch-ui/theme';
import { deconstructErrorsToDataShape, toastItemSuccess, toastError } from '../../util';
import { IdCopy } from './IdCopy';
import { ItemTitle } from './ItemTitle';

import { resolveAllKeys, arrayToObject } from '@keystone-alpha/utils';
import isEqual from 'lodash.isequal';

let Render = ({ children }) => children();

const Form = styled.form({
  margin: '24px 0',
});

// TODO: show updateInProgress and updateSuccessful / updateFailed UI
const ItemDetails = withRouter(
  class extends Component {
    state = {
      item: this.props.item,
      itemHasChanged: false,
      showCreateModal: false,
      showDeleteModal: false,
      nestedCreateModal: null,
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
      const { list, item, router } = this.props;
      deletePromise
        .then(() => {
          if (this.mounted) {
            this.setState({ showDeleteModal: false });
          }
          router.push({ route: 'list', params: { listPath: list.path } });

          toastItemSuccess(this.props.toast, item, 'Deleted successfully');
        })
        .catch(error => {
          toastError(this.props.toast, error);
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
      const { list, onUpdate, toastManager, updateItem, item: initialData } = this.props;

      resolveAllKeys(
        // Don't try to update anything that hasn't changed.
        // This is particularly important for access control where a field
        // may be `read: true, update: false`, so will appear in the item
        // details, but is not editable, and would cause an error if a value
        // was sent as part of the update query.
        arrayToObject(
          list
            .getFieldControllers()
            .filter(field => !isEqual(field.getValue(initialData), field.getValue(item))),
          'path',
          field => field.getValue(item)
        )
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
      const { list, router } = this.props;
      const { id } = data[list.gqlNames.createMutationName];
      router.push({ route: 'item', params: { listPath: list.path, itemId: id } });
    };

    render() {
      const { list, updateInProgress, itemErrors, item: savedData } = this.props;
      const { item: editedItem, itemHasChanged } = this.state;
      return (
        <Fragment>
          {itemHasChanged && <PreventNavigation />}
          <ItemTitle
            onCreateClick={this.openCreateModal}
            list={list}
            titleText={savedData._label_}
          />
          <IdCopy id={editedItem.id} />
          <Form>
            <AutocompleteCaptor />
            {list
              .getFieldControllers()
              .filter(field => field.isEditable())
              .map((field, i) => {
                const Field = viewLoadables.Field[field.views.Field];
                if (!Field) {
                  return null;
                }
                return (
                  <Render key={field.path}>
                    {() => {
                      let onChange = useCallback(
                        value => {
                          this.setState(({ item }) => ({
                            item: {
                              ...item,
                              [field.path]: value,
                            },
                            itemHasChanged: true,
                          }));
                        },
                        [field]
                      );

                      let onNestedCreate = useCallback(
                        ({ list: relatedList, onCreate }) => {
                          // Remove the nested modal by setting the rendered
                          // component to null so the previously set one is
                          // unmounted
                          const closeIt = () => this.setState(() => ({ nestedCreateModal: null }));
                          // When a nested create is requested, we force the
                          // component to be the below which includes the
                          // appropriate callbacks, etc
                          this.setState(() => ({
                            nestedCreateModal: (
                              <CreateItemModal
                                isOpen
                                list={relatedList}
                                onClose={closeIt}
                                onCreate={({ data }) => {
                                  onCreate(data[relatedList.gqlNames.createMutationName]);
                                  closeIt();
                                }}
                              />
                            ),
                          }));
                        },
                        [this.setState]
                      );

                      return useMemo(
                        () => (
                          <Field
                            onNestedCreate={onNestedCreate}
                            autoFocus={!i}
                            field={field}
                            error={itemErrors[field.path]}
                            value={editedItem[field.path]}
                            onChange={onChange}
                            renderContext="page"
                          />
                        ),
                        [i, field, itemErrors[field.path], editedItem[field.path]]
                      );
                    }}
                  </Render>
                );
              })}
            {this.state.nestedCreateModal}
          </Form>

          <Footer
            onSave={this.onSave}
            onDelete={this.openDeleteModal}
            canReset={itemHasChanged && !updateInProgress}
            onReset={this.onReset}
            updateInProgress={updateInProgress}
          />
          {this.renderCreateModal()}
          {this.renderDeleteModal()}
        </Fragment>
      );
    }
  }
);
const ItemNotFound = ({ errorMessage, list }) => (
  <PageError>
    <p>Couldn't find a {list.singular} matching that ID</p>
    <Link passHref route="list" params={{ listPath: list.path }}>
      <Button as="a" variant="ghost">
        Back to List
      </Button>
    </Link>
    {errorMessage ? (
      <p style={{ fontSize: '0.75rem', marginTop: gridSize * 4 }}>
        <code>{errorMessage}</code>
      </p>
    ) : null}
  </PageError>
);

const ItemPage = ({ list, itemId, getListByKey, toastManager }) => {
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
                <ItemNotFound errorMessage={error.message} list={list} />
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
            <ItemNotFound list={list} />
          );
        }}
      </Query>
    </Fragment>
  );
};

export default withToastManager(ItemPage);
