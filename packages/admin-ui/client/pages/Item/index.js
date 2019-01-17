/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, Fragment } from 'react';
import styled from '@emotion/styled';
import { Mutation, Query } from 'react-apollo';
import { Link, withRouter } from 'react-router-dom';
import { withToastManager } from 'react-toast-notifications';

import CopyToClipboard from '../../components/CopyToClipboard';
import CreateItemModal from '../../components/CreateItemModal';
import DeleteItemModal from '../../components/DeleteItemModal';
import Animation from '../../components/Animation';
import DocTitle from '../../components/DocTitle';
import PageError from '../../components/PageError';
import PageLoading from '../../components/PageLoading';
import PreventNavigation from '../../components/PreventNavigation';
import Footer from './Footer';
import { TriangleLeftIcon, CheckIcon, ClippyIcon, PlusIcon } from '@arch-ui/icons';
import { Container, FlexGroup } from '@arch-ui/layout';
import { A11yText, Title } from '@arch-ui/typography';
import { Button, IconButton } from '@arch-ui/button';
import { AutocompleteCaptor } from '@arch-ui/input';
import { colors, gridSize } from '@arch-ui/theme';
import { deconstructErrorsToDataShape, toastItemSuccess, toastError } from '../../util';

import { resolveAllKeys, arrayToObject } from '@voussoir/utils';
import isEqual from 'lodash.isequal';

// This import is loaded by the @voussoir/field-views-loader loader.
// It imports all the views required for a keystone app by looking at the adminMetaData
import FieldTypes from '../../FIELD_TYPES';

const ItemId = styled.div({
  color: colors.N30,
  fontFamily: 'Monaco, Consolas, monospace',
  fontSize: '0.85em',
});
const Form = styled.form({
  margin: '24px 0',
});
const TitleLink = ({ children, ...props }) => (
  <Link
    css={{
      position: 'relative',
      textDecoration: 'none',

      ':hover': {
        textDecoration: 'none',
      },

      '& > svg': {
        opacity: 0,
        height: 16,
        width: 16,
        position: 'absolute',
        transitionProperty: 'opacity, transform, visibility',
        transitionDuration: '300ms',
        transform: 'translate(-75%, -50%)',
        top: '50%',
        visibility: 'hidden',
      },

      ':hover > svg': {
        opacity: 0.66,
        visibility: 'visible',
        transform: 'translate(-110%, -50%)',
      },
    }}
    {...props}
  >
    <TriangleLeftIcon />
    {children}
  </Link>
);

// TODO: show updateInProgress and updateSuccessful / updateFailed UI

const ItemDetails = withRouter(
  class ItemDetails extends Component {
    state = {
      copyText: '',
      item: this.props.item,
      itemHasChanged: false,
      showCreateModal: false,
      showDeleteModal: false,
      resetRequested: false,
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
      const { resetRequested } = this.state;
      if (event.defaultPrevented) return;

      switch (event.key) {
        case 'Escape':
          if (resetRequested) {
            return this.hideConfirmResetMessage();
          }
        case 'Enter':
          if (event.metaKey) {
            return this.onSave();
          }
      }
    };
    onDelete = deletePromise => {
      const { adminPath, history, list, item } = this.props;
      deletePromise
        .then(() => {
          if (this.mounted) {
            this.setState({ showDeleteModal: false });
          }
          history.push(`${adminPath}/${list.path}`);

          toastItemSuccess(this.props.toast, item, 'Deleted successfully');
        })
        .catch(error => {
          toastError(this.props.toast, error);
        });
    };

    showConfirmResetMessage = () => {
      const { itemHasChanged } = this.state;
      if (!itemHasChanged) return;
      this.setState({ resetRequested: true });
    };
    hideConfirmResetMessage = () => {
      this.setState({ resetRequested: false });
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
      this.hideConfirmResetMessage();
    };
    onChange = (field, value) => {
      const { item } = this.state;
      this.setState({
        item: {
          ...item,
          [field.path]: value,
        },
        itemHasChanged: true,
      });
    };

    renderResetInterface = () => {
      const { updateInProgress } = this.props;
      const { itemHasChanged, resetRequested } = this.state;

      return resetRequested ? (
        <div css={{ display: 'flex', alignItems: 'center', marginLeft: gridSize }}>
          <div css={{ fontSize: '0.9rem', marginRight: gridSize }}>Are you sure?</div>
          <Button appearance="danger" autoFocus onClick={this.onReset} variant="ghost">
            Reset
          </Button>
          <Button variant="subtle" onClick={this.hideConfirmResetMessage}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          appearance="warning"
          isDisabled={!itemHasChanged || updateInProgress}
          variant="subtle"
          onClick={this.showConfirmResetMessage}
        >
          Reset Changes
        </Button>
      );
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

      resolveAllKeys(
        // Don't try to update anything that hasn't changed.
        // This is particularly important for access control where a field
        // may be `read: true, update: false`, so will appear in the item
        // details, but is not editable, and would cause an error if a value
        // was sent as part of the update query.
        arrayToObject(
          fields.filter(field => !isEqual(field.getValue(initialData), field.getValue(item))),
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
    onCopy = text => () => {
      this.setState({ copyText: text }, () => {
        setTimeout(() => {
          this.setState({ copyText: '' });
        }, 500);
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
      const { copyText, item, itemHasChanged } = this.state;
      const isCopied = copyText === item.id;
      const copyIcon = isCopied ? (
        <Animation name="pulse" duration="500ms">
          <CheckIcon css={{ color: colors.create }} />
        </Animation>
      ) : (
        <ClippyIcon />
      );
      const listHref = `${adminPath}/${list.path}`;
      const titleText = savedData._label_;
      return (
        <Fragment>
          {itemHasChanged && <PreventNavigation />}
          <FlexGroup align="center" justify="space-between">
            <Title as="h1" margin="both">
              <TitleLink to={listHref}>{list.label}</TitleLink>: {titleText}
            </Title>
            <IconButton appearance="create" icon={PlusIcon} onClick={this.openCreateModal}>
              Create
            </IconButton>
          </FlexGroup>
          <FlexGroup align="center" isContiguous>
            <ItemId>ID: {item.id}</ItemId>
            <CopyToClipboard
              as={Button}
              text={item.id}
              onSuccess={this.onCopy(item.id)}
              variant="subtle"
              title="Copy ID"
            >
              {copyIcon}
              <A11yText>Copy ID</A11yText>
            </CopyToClipboard>
          </FlexGroup>
          <Form>
            <AutocompleteCaptor />
            {list.fields.map((field, i) => {
              const { Field } = FieldTypes[list.key][field.path];
              return (
                <Field
                  autoFocus={!i}
                  field={field}
                  item={item}
                  itemErrors={itemErrors}
                  initialData={savedData}
                  key={field.path}
                  onChange={this.onChange}
                />
              );
            })}
          </Form>

          <Footer
            onSave={this.onSave}
            onDelete={this.openDeleteModal}
            resetInterface={this.renderResetInterface()}
            updateInProgress={updateInProgress}
          />
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
