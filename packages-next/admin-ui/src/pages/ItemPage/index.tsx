/* @jsx jsx */

import copyToClipboard from 'clipboard-copy';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Fragment,
  HTMLAttributes,
  memo,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ListMeta } from '@keystone-next/types';
import { Button } from '@keystone-ui/button';
import { Box, Center, Heading, Stack, Text, jsx, useTheme } from '@keystone-ui/core';
import { LoadingDots } from '@keystone-ui/loading';
import { ClipboardIcon } from '@keystone-ui/icons/icons/ClipboardIcon';
import { ChevronRightIcon } from '@keystone-ui/icons/icons/ChevronRightIcon';
import { AlertDialog, DrawerController } from '@keystone-ui/modals';
import { Notice } from '@keystone-ui/notice';
import { useToasts } from '@keystone-ui/toast';
import { Tooltip } from '@keystone-ui/tooltip';
import { FieldLabel, TextInput } from '@keystone-ui/fields';
import {
  DataGetter,
  DeepNullable,
  makeDataGetter,
  deserializeValue,
  ItemData,
  useInvalidFields,
  Fields,
  useChangedFieldsAndDataForUpdate,
} from '@keystone-next/admin-ui-utils';

import { gql, useMutation, useQuery } from '../../apollo';
import { useList } from '../../context';
import { PageContainer, HEADER_HEIGHT } from '../../components/PageContainer';
import { GraphQLErrorNotice } from '../../components/GraphQLErrorNotice';
import { CreateItemDrawer } from '../../components/CreateItemDrawer';
import { Container } from '../../components/Container';

type ItemPageProps = {
  listKey: string;
};

function useEventCallback<Func extends (...args: any) => any>(callback: Func): Func {
  const callbackRef = useRef(callback);
  const cb = useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
  useEffect(() => {
    callbackRef.current = callback;
  });
  return cb as any;
}

function ItemForm({
  listKey,
  itemGetter,
  selectedFields,
  fieldModes,
  showDelete,
}: {
  listKey: string;
  itemGetter: DataGetter<ItemData>;
  selectedFields: string;
  fieldModes: Record<string, 'edit' | 'read' | 'hidden'>;
  showDelete: boolean;
}) {
  const list = useList(listKey);

  const [update, { loading, error, data }] = useMutation(
    gql`mutation ($data: ${list.gqlNames.updateInputName}!, $id: ID!) {
      item: ${list.gqlNames.updateMutationName}(id: $id, data: $data) {
        ${selectedFields}
      }
    }`,
    {
      errorPolicy: 'all',
    }
  );
  itemGetter =
    useMemo(() => {
      if (data) {
        return makeDataGetter(data, error?.graphQLErrors).get('item');
      }
    }, [data, error]) ?? itemGetter;

  const [state, setValue] = useState(() => {
    const value = deserializeValue(list.fields, itemGetter);
    return {
      value,
      item: itemGetter.data,
    };
  });
  if (
    !loading &&
    state.item !== itemGetter.data &&
    (itemGetter.errors || []).every(x => x.path?.length !== 1)
  ) {
    const value = deserializeValue(list.fields, itemGetter);
    setValue({
      value,
      item: itemGetter.data,
    });
  }

  const { changedFields, dataForUpdate } = useChangedFieldsAndDataForUpdate(
    list.fields,
    itemGetter,
    state.value
  );

  const invalidFields = useInvalidFields(list.fields, state.value);

  const [forceValidation, setForceValidation] = useState(false);
  const toasts = useToasts();
  const onSave = useEventCallback(() => {
    const newForceValidation = invalidFields.size !== 0;
    setForceValidation(newForceValidation);
    if (newForceValidation) return;

    update({
      variables: {
        data: dataForUpdate,
        id: itemGetter.get('id').data,
      },
    })
      // TODO -- Experimenting with less detail in the toasts, so the data lines are commented
      // out below. If we're happy with this, clean up the unused lines.
      .then(({ /* data, */ errors }) => {
        // we're checking for path.length === 1 because errors with a path larger than 1 will
        // be field level errors which are handled seperately and do not indicate a failure to
        // update the item
        const error = errors?.find(x => x.path?.length === 1);
        if (error) {
          toasts.addToast({
            title: 'Failed to update item',
            tone: 'negative',
            message: error.message,
          });
        } else {
          toasts.addToast({
            // title: data.item[list.labelField] || data.item.id,
            tone: 'positive',
            title: 'Saved successfully',
            // message: 'Saved successfully',
          });
        }
      })
      .catch(err => {
        toasts.addToast({
          title: 'Failed to update item',
          tone: 'negative',
          message: err.message,
        });
      });
  });
  return (
    <Box marginTop="xlarge">
      <GraphQLErrorNotice
        networkError={error?.networkError}
        // we're checking for path.length === 1 because errors with a path larger than 1 will be field level errors
        // which are handled seperately and do not indicate a failure to update the item
        errors={error?.graphQLErrors.filter(x => x.path?.length === 1)}
      />
      <Fields
        fieldModes={fieldModes}
        fields={list.fields}
        forceValidation={forceValidation}
        invalidFields={invalidFields}
        onChange={useCallback(
          value => {
            setValue(state => ({
              item: state.item,
              value: value(state.value),
            }));
          },
          [setValue]
        )}
        value={state.value}
      />
      <Toolbar
        onSave={onSave}
        hasChangedFields={!!changedFields.size}
        onReset={useEventCallback(() => {
          setValue({
            item: itemGetter.data,
            value: deserializeValue(list.fields, itemGetter),
          });
        })}
        loading={loading}
        deleteButton={useMemo(
          () =>
            showDelete ? (
              <DeleteButton
                list={list}
                itemLabel={(itemGetter.data?.[list.labelField] ?? itemGetter.data?.id!) as string}
                itemId={itemGetter.data?.id!}
              />
            ) : undefined,
          [showDelete, list, itemGetter.data?.[list.labelField], itemGetter.data?.id]
        )}
      />
    </Box>
  );
}

function DeleteButton({
  itemLabel,
  itemId,
  list,
}: {
  itemLabel: string;
  itemId: string;
  list: ListMeta;
}) {
  const toasts = useToasts();
  const [deleteItem, { loading }] = useMutation(
    gql`mutation ($id: ID!) {
      ${list.gqlNames.deleteMutationName}(id: $id) {
        id
      }
    }`,
    { variables: { id: itemId } }
  );
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <Fragment>
      <Button
        tone="negative"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Delete
      </Button>
      <AlertDialog
        // TODO: change the copy in the title and body of the modal
        title="Delete Confirmation"
        isOpen={isOpen}
        tone="negative"
        actions={{
          confirm: {
            label: 'Delete',
            action: async () => {
              await deleteItem().catch(err => {
                toasts.addToast({
                  title: 'Failed to delete item',
                  message: err.message,
                  tone: 'negative',
                });
              });
              router.push(`/${list.path}`);
              toasts.addToast({
                title: itemLabel,
                message: 'Deleted successfully',
                tone: 'positive',
              });
            },
            loading,
          },
          cancel: {
            label: 'Cancel',
            action: () => {
              setIsOpen(false);
            },
          },
        }}
      >
        Are you sure you want to delete <strong>{itemLabel}</strong>?
      </AlertDialog>
    </Fragment>
  );
}

export const ItemPage = ({ listKey }: ItemPageProps) => {
  const router = useRouter();
  const { id } = router.query;
  const list = useList(listKey);
  const { palette, spacing, typography } = useTheme();

  const { query, selectedFields } = useMemo(() => {
    let selectedFields = Object.keys(list.fields)
      .map(fieldPath => {
        return list.fields[fieldPath].controller.graphqlSelection;
      })
      .join('\n');
    return {
      selectedFields,
      query: gql`
        query ItemPage($id: ID!, $listKey: String!) {
          item: ${list.gqlNames.itemQueryName}(where: {id: $id}) {
            ${selectedFields}
          }
          keystone {
            adminMeta {
              list(key: $listKey) {
                hideCreate
                hideDelete
                fields {
                  path
                  itemView(id: $id) {
                    fieldMode
                  }
                }
              }
            }
          }
        }
      `,
    };
  }, [list]);
  let { data, error, loading } = useQuery(query, {
    variables: { id, listKey },
    errorPolicy: 'all',
    skip: id === undefined,
  });
  loading ||= id === undefined;

  const dataGetter = makeDataGetter<
    DeepNullable<{
      item: ItemData;
      keystone: {
        adminMeta: {
          list: {
            fields: {
              path: string;
              itemView: {
                fieldMode: 'edit' | 'read' | 'hidden';
              };
            }[];
          };
        };
      };
    }>
  >(data, error?.graphQLErrors);

  let itemViewFieldModesByField = useMemo(() => {
    let itemViewFieldModesByField: Record<string, 'edit' | 'read' | 'hidden'> = {};
    dataGetter.data?.keystone?.adminMeta?.list?.fields?.forEach(field => {
      if (field !== null && field.path !== null && field?.itemView?.fieldMode != null) {
        itemViewFieldModesByField[field.path] = field.itemView.fieldMode;
      }
    });
    return itemViewFieldModesByField;
  }, [dataGetter.data?.keystone?.adminMeta?.list?.fields]);

  const metaQueryErrors = dataGetter.get('keystone').errors;

  // NOTE: The create button is always hidden on this page for now, while we work on the
  // placment of the save and delete buttons.
  const hideCreate = true; // data?.keystone.adminMeta.list.hideCreate;

  return (
    <PageContainer
      header={
        <Container
          css={{
            alignItems: 'center',
            display: 'flex',
            flex: 1,
            justifyContent: 'space-between',
          }}
        >
          <div
            css={{
              alignItems: 'center',
              display: 'flex',
              flex: 1,
              minWidth: 0,
            }}
          >
            <Heading type="h3">
              <Link href={`/${list.path}`} passHref>
                <a css={{ textDecoration: 'none' }}>{list.label}</a>
              </Link>
            </Heading>
            <div
              css={{
                color: palette.neutral500,
                marginLeft: spacing.xsmall,
                marginRight: spacing.xsmall,
              }}
            >
              <ChevronRightIcon />
            </div>
            <Heading
              as="h1"
              type="h3"
              css={{
                minWidth: 0,
                maxWidth: '100%',
                overflow: 'hidden',
                flex: 1,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {loading
                ? 'Loading...'
                : (data && data.item && (data.item[list.labelField] || data.item.id)) || id}
            </Heading>
          </div>
          {!hideCreate && <CreateButton listKey={listKey} id={data.item.id} />}
        </Container>
      }
    >
      {loading ? (
        <Center css={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
          <LoadingDots label="Loading item data" size="large" tone="passive" />
        </Center>
      ) : metaQueryErrors ? (
        <Box marginY="xlarge">
          <Notice tone="negative">{metaQueryErrors[0].message}</Notice>
        </Box>
      ) : (
        <Fragment>
          <ColumnLayout>
            <ItemForm
              fieldModes={itemViewFieldModesByField}
              selectedFields={selectedFields}
              showDelete={!data.keystone.adminMeta.list!.hideDelete}
              listKey={listKey}
              itemGetter={dataGetter.get('item') as DataGetter<ItemData>}
            />

            <StickySidebar>
              <FieldLabel>Item ID</FieldLabel>
              <div
                css={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <TextInput
                  css={{
                    marginRight: spacing.medium,
                    fontFamily: typography.fontFamily.monospace,
                    fontSize: typography.fontSize.small,
                  }}
                  readOnly
                  value={data.item.id}
                />
                <Tooltip content="Copy ID">
                  {props => (
                    <Button
                      {...props}
                      aria-label="Copy ID"
                      onClick={() => {
                        copyToClipboard(data.item.id);
                      }}
                    >
                      <ClipboardIcon size="small" />
                    </Button>
                  )}
                </Tooltip>
              </div>
            </StickySidebar>
          </ColumnLayout>
        </Fragment>
      )}
    </PageContainer>
  );
};

const CreateButton = ({ id, listKey }: { id: string; listKey: string }) => {
  const list = useList(listKey);
  const router = useRouter();

  const [createModalState, setModalState] = useState<
    { state: 'closed' } | { state: 'open'; id: string }
  >({
    state: 'closed',
  });

  if (createModalState.state === 'open' && createModalState.id !== id) {
    setModalState({ state: 'closed' });
  }

  return (
    <Fragment>
      <Button
        disabled={createModalState.state === 'open'}
        onClick={() => {
          setModalState({ state: 'open', id: id as string });
        }}
        tone="positive"
        size="small"
      >
        Create New {list.singular}
      </Button>

      <DrawerController isOpen={createModalState.state === 'open'}>
        <CreateItemDrawer
          listKey={listKey}
          onCreate={({ id }) => {
            router.push(`/${list.path}/[id]`, `/${list.path}/${id}`);
            setModalState({ state: 'closed' });
          }}
          onClose={() => {
            setModalState({ state: 'closed' });
          }}
        />
      </DrawerController>
    </Fragment>
  );
};

// Styled Components
// ------------------------------

const Toolbar = memo(function Toolbar({
  hasChangedFields,
  loading,
  onSave,
  onReset,
  deleteButton,
}: {
  hasChangedFields: boolean;
  loading: boolean;
  onSave: () => void;
  onReset: () => void;
  deleteButton?: ReactElement;
}) {
  const { colors, spacing } = useTheme();
  return (
    <div
      css={{
        background: colors.background,
        borderTop: `1px solid ${colors.border}`,
        bottom: 0,
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: spacing.xlarge,
        paddingBottom: spacing.xlarge,
        paddingTop: spacing.xlarge,
        position: 'sticky',
        zIndex: 10,
      }}
    >
      <Stack align="center" across gap="small">
        <Button
          isDisabled={!hasChangedFields}
          isLoading={loading}
          weight="bold"
          tone="active"
          onClick={onSave}
        >
          Save changes
        </Button>
        {hasChangedFields ? (
          <Button weight="none" onClick={onReset}>
            Reset changes
          </Button>
        ) : (
          <Text weight="medium" paddingX="large" color="neutral600">
            No changes
          </Text>
        )}
      </Stack>
      {deleteButton}
    </div>
  );
});

const ColumnLayout = (props: HTMLAttributes<HTMLDivElement>) => {
  const { spacing } = useTheme();

  return (
    <Container css={{ position: 'relative' }}>
      <div
        css={{
          alignItems: 'start',
          display: 'grid',
          gap: spacing.xlarge,
          gridTemplateColumns: `2fr 1fr`,
        }}
        {...props}
      />
    </Container>
  );
};

const StickySidebar = (props: HTMLAttributes<HTMLDivElement>) => {
  const { spacing } = useTheme();
  return (
    <div
      css={{
        marginTop: spacing.xlarge,
        marginBottom: spacing.xxlarge,
        position: 'sticky',
        top: spacing.xlarge,
      }}
      {...props}
    />
  );
};
