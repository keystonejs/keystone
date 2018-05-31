import React, { Component, Fragment } from 'react';
import styled from 'react-emotion';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';
import { Link, withRouter } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import CreateItemModal from '../../components/CreateItemModal';
import DeleteItemModal from '../../components/DeleteItemModal';
import Nav from '../../components/Nav';
import Animation from '../../components/Animation';
import DocTitle from '../../components/DocTitle';
import PageError from '../../components/PageError';
import PageLoading from '../../components/PageLoading';
import Footer from './Footer';
import {
  TriangleLeftIcon,
  CheckIcon,
  ClippyIcon,
  PlusIcon,
} from '@keystonejs/icons';
import { Container, FlexGroup } from '@keystonejs/ui/src/primitives/layout';
import { A11yText, H1 } from '@keystonejs/ui/src/primitives/typography';
import { Button, IconButton } from '@keystonejs/ui/src/primitives/buttons';
import { Dialog } from '@keystonejs/ui/src/primitives/modals';
import { Alert } from '@keystonejs/ui/src/primitives/alert';
import { withToastUtils } from '@keystonejs/ui/src/primitives/toasts';
import { colors, gridSize } from '@keystonejs/ui/src/theme';

import { resolveAllKeys } from '@keystonejs/utils';

// This import is loaded by the @keystone/field-views-loader loader.
// It imports all the views required for a keystone app by looking at the adminMetaData
import FieldTypes from '../../FIELD_TYPES';

const getItemQuery = ({ list, itemId }) => gql`
  {
    ${list.itemQueryName}(where: { id: "${itemId}" }) {
      id
      _label_
      ${list.fields.map(field => field.getQueryFragment()).join(' ')}
    }
  }
`;

const ItemId = styled.div({
  color: colors.N30,
  fontFamily: 'Monaco, Consolas, monospace',
  fontSize: '0.85em',
});
const Form = styled.div({
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

class ConfirmResetModal extends Component {
  onKeyDown = e => {
    if (e.key === 'Escape') {
      this.props.onCancel();
    }
  };
  render() {
    const { onCancel, onConfirm } = this.props;
    return (
      <Dialog isOpen onClose={onCancel} onKeyDown={this.onKeyDown} width={400}>
        <p style={{ marginTop: 0 }}>
          Are you sure you want reset your changes?
        </p>
        <footer>
          <Button appearance="danger" onClick={onConfirm}>
            Reset
          </Button>
          <Button variant="subtle" onClick={onCancel}>
            Cancel
          </Button>
        </footer>
      </Dialog>
    );
  }
}

// TODO: show updateInProgress and updateSuccessful / updateFailed UI

const ItemDetails = withRouter(
  class ItemDetails extends Component {
    state = {
      copyText: '',
      item: this.props.item,
      itemHasChanged: false,
      showCreateModal: false,
      showDeleteModal: false,
      showResetChangesModal: false,
    };
    componentDidMount() {
      this.mounted = true;
    }
    componentWillUnmount() {
      this.mounted = false;
    }
    showDeleteModal = () => {
      this.setState({ showDeleteModal: true });
    };
    closeDeleteModal = () => {
      this.setState({ showDeleteModal: false });
    };
    onDelete = () => {
      const { adminPath, history, list } = this.props;
      if (this.mounted) {
        this.setState({ showDeleteModal: false });
      }
      history.push(`${adminPath}/${list.path}`);
    };
    showConfirmResetModal = () => {
      const { itemHasChanged } = this.state;
      if (!itemHasChanged) return;
      this.setState({ showConfirmResetModal: true });
    };
    closeConfirmResetModal = () => {
      this.setState({ showConfirmResetModal: false });
    };
    onReset = () => {
      this.setState({
        item: this.props.item,
      });
      this.closeConfirmResetModal();
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
    renderConfirmResetModal() {
      const { showConfirmResetModal } = this.state;
      if (!showConfirmResetModal) return;

      return (
        <ConfirmResetModal
          onCancel={this.closeConfirmResetModal}
          onConfirm={this.onReset}
        />
      );
    }
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
        toast,
        updateItem,
      } = this.props;

      resolveAllKeys(
        fields.reduce(
          (values, field) => ({
            [field.path]: field.getValue(item),
            ...values,
          }),
          {}
        )
      )
        .then(data => {
          updateItem({ variables: { id: item.id, data } });

          const toastContent = (
            <div>
              {item.name ? <strong>{item.name}</strong> : null}
              <div>Saved successfully</div>
            </div>
          );

          toast.addToast(toastContent, {
            autoDismiss: true,
            appearance: 'success',
          })();
        })
        .then(onUpdate);
    };
    onCopy = (text, success) => {
      if (success) {
        this.setState({ copyText: text }, () => {
          setTimeout(() => {
            this.setState({ copyText: '' });
          }, 500);
        });
      }
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
      const { id } = data[list.createMutationName];
      history.push(`${adminPath}/${list.path}/${id}`);
    };

    render() {
      const {
        adminPath,
        list,
        updateInProgress,
        updateErrorMessage,
      } = this.props;
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

      return (
        <Fragment>
          {updateErrorMessage ? (
            <Alert appearance="danger" css={{ marginTop: gridSize * 3 }}>
              {updateErrorMessage}
            </Alert>
          ) : null}
          <FlexGroup align="center" justify="space-between">
            <H1>
              <TitleLink to={listHref}>{list.label}</TitleLink>: {item.name}
            </H1>
            <IconButton
              appearance="create"
              icon={PlusIcon}
              onClick={this.openCreateModal}
            >
              Create
            </IconButton>
          </FlexGroup>
          <FlexGroup align="center" isContiguous>
            <ItemId>ID: {item.id}</ItemId>
            <CopyToClipboard text={item.id} onCopy={this.onCopy}>
              <Button variant="subtle" title="Copy ID">
                {copyIcon}
                <A11yText>Copy ID</A11yText>
              </Button>
            </CopyToClipboard>
          </FlexGroup>
          <Form>
            {list.fields.map((field, i) => {
              const { Field } = FieldTypes[list.key][field.path];
              return (
                <Field
                  autoFocus={!i}
                  field={field}
                  item={item}
                  key={field.path}
                  onChange={this.onChange}
                />
              );
            })}
          </Form>

          <Footer
            onSave={this.onSave}
            onDelete={this.showDeleteModal}
            onReset={itemHasChanged ? this.showConfirmResetModal : undefined}
            updateInProgress={updateInProgress}
          />
          {this.renderCreateModal()}
          {this.renderDeleteModal()}
          {this.renderConfirmResetModal()}
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

const ItemPage = ({ list, itemId, adminPath, getListByKey, toast }) => {
  const itemQuery = getItemQuery({ list, itemId });
  return (
    <Fragment>
      <Nav />
      <Query query={itemQuery}>
        {({ loading, error, data, refetch }) => {
          if (loading) return <PageLoading />;

          if (error) {
            return (
              <Fragment>
                <DocTitle>{list.singular} not found</DocTitle>
                <ItemNotFound
                  adminPath={adminPath}
                  errorMessage={error.message}
                  list={list}
                />
              </Fragment>
            );
          }

          const item = data[list.itemQueryName];
          return item ? (
            <main>
              <DocTitle>
                {item.name} - {list.singular}
              </DocTitle>
              <Container id="toast-boundary">
                <Mutation mutation={list.updateMutation}>
                  {(
                    updateItem,
                    { loading: updateInProgress, error: updateError }
                  ) => {
                    if (updateError) {
                      const [title, ...rest] = updateError.message.split(/\:/);
                      const toastContent = rest.length ? (
                        <div>
                          <strong>{title.trim()}</strong>
                          <div>{rest.join('').trim()}</div>
                        </div>
                      ) : (
                        updateError.message
                      );

                      toast.addToast(toastContent, {
                        appearance: 'error',
                      })();
                    }

                    return (
                      <ItemDetails
                        adminPath={adminPath}
                        item={item}
                        key={itemId}
                        list={list}
                        getListByKey={getListByKey}
                        onUpdate={refetch}
                        toast={toast}
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

export default withToastUtils(ItemPage);
