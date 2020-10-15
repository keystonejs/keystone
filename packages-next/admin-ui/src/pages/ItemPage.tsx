/* @jsx jsx */

import { Fragment, ReactNode, useMemo, useState } from 'react';
import { gql, useMutation, useQuery } from '../apollo';
import { Box, jsx, Stack, useTheme } from '@keystone-ui/core';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useList } from '../context';
import { PageContainer } from '../components/PageContainer';
import { Button } from '@keystone-ui/button';
import isDeepEqual from 'fast-deep-equal';
import { Notice } from '@keystone-ui/notice';
import { Tooltip } from '@keystone-ui/tooltip';
import copyToClipboard from 'clipboard-copy';
import { DataGetter, DeepNullable, makeDataGetter } from '../utils/dataGetter';
import { deserializeValue, ItemData, serializeValueToObjByFieldKey } from '../utils/serialization';
import { ListMeta } from '@keystone-spike/types';
import { AlertDialog } from '@keystone-ui/modals';
import { useToasts } from '@keystone-ui/toast';

type ItemPageProps = {
  listKey: string;
};

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

  const [update, { loading, error }] = useMutation(
    gql`mutation ($data: ${list.gqlNames.updateInputName}!, $id: ID!) {
      item: ${list.gqlNames.updateMutationName}(id: $id, data: $data) {
        id
        _label_
        ${selectedFields}
      }
    }`
  );

  const [state, setValue] = useState(() => {
    const value = deserializeValue(list, itemGetter);
    return {
      value,
      item: itemGetter.data,
    };
  });

  if (state.item !== itemGetter.data) {
    const value = deserializeValue(list, itemGetter);
    setValue({
      value,
      item: itemGetter.data,
    });
  }

  const serializedValuesFromItem = useMemo(() => {
    const value = deserializeValue(list, itemGetter);
    return serializeValueToObjByFieldKey(list, value);
  }, [list, itemGetter]);
  const serializedFieldValues = useMemo(() => {
    return serializeValueToObjByFieldKey(list, state.value);
  }, [state.value, list]);

  const fieldsEquality = useMemo(() => {
    let someFieldsChanged = false;
    let fieldsChanged: Record<string, boolean> = {};
    Object.keys(serializedFieldValues).forEach(fieldKey => {
      let isEqual = isDeepEqual(
        serializedFieldValues[fieldKey],
        serializedValuesFromItem[fieldKey]
      );
      if (!isEqual && someFieldsChanged === false) {
        someFieldsChanged = true;
      }
      fieldsChanged[fieldKey] = !isEqual;
    });
    return {
      someFieldsChanged,
      fieldsChanged,
    };
  }, [serializedFieldValues, serializedValuesFromItem, list]);
  const toasts = useToasts();
  const saveButtonProps = {
    isLoading: loading,
    weight: 'bold',
    tone: 'active',
    onClick: () => {
      const data: Record<string, any> = {};
      Object.keys(fieldsEquality.fieldsChanged).forEach(fieldKey => {
        if (fieldsEquality.fieldsChanged[fieldKey]) {
          Object.assign(data, serializedFieldValues[fieldKey]);
        }
      });
      update({
        variables: {
          data,
          id: itemGetter.get('id').data,
        },
      })
        .then(({ data }) => {
          toasts.addToast({
            title: data.item._label_,
            tone: 'positive',
            message: 'Saved successfully',
          });
        })
        .catch(() => {});
    },
    children: 'Save Changes',
  } as const;
  const fields = Object.keys(list.fields)
    .filter(fieldKey => fieldModes[fieldKey] !== 'hidden')
    .map(fieldKey => {
      const field = list.fields[fieldKey];
      const value = state.value[fieldKey];
      const fieldMode = fieldModes[fieldKey];
      const Field = list.fields[fieldKey].views.Field;

      if (value.kind === 'error') {
        return (
          <div>
            {field.label}: <span css={{ color: 'red' }}>{value.errors[0].message}</span>
          </div>
        );
      }
      return (
        <Field
          key={fieldKey}
          field={field.controller}
          value={value.value}
          onChange={
            fieldMode === 'edit'
              ? fieldValue => {
                  setValue({
                    value: { ...state.value, [fieldKey]: { kind: 'value', value: fieldValue } },
                    item: state.item,
                  });
                }
              : undefined
          }
        />
      );
    });
  return (
    <Fragment>
      {error && <Notice tone="negative">{error.message}</Notice>}
      {fields}
      {fields.length === 0 && 'There are no fields that you can read or edit'}
      <Toolbar>
        <Stack across gap="small">
          {fieldsEquality.someFieldsChanged ? (
            <Button {...saveButtonProps} />
          ) : (
            <Tooltip content="No fields have been modified so you cannot save changes">
              {props => (
                <Button
                  {...props}
                  {...saveButtonProps}
                  // making onClick undefined instead of making the button disabled so the button can be focussed so keyboard users can see the tooltip
                  onClick={undefined}
                />
              )}
            </Tooltip>
          )}
          <Button
            onClick={() => {
              setValue({
                item: itemGetter.data,
                value: deserializeValue(list, itemGetter),
              });
            }}
          >
            Reset changes
          </Button>
        </Stack>
        {showDelete && (
          <DeleteButton
            list={list}
            itemLabel={itemGetter.data?._label_ ?? null}
            itemId={itemGetter.data?.id!}
          />
        )}
      </Toolbar>
    </Fragment>
  );
}

function DeleteButton({
  itemLabel,
  itemId,
  list,
}: {
  itemLabel: string | null;
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
        weight="outline"
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
                title: itemLabel ?? itemId,
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
  const { spacing } = useTheme();

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
      id
      _label_
      ${selectedFields}
    }
    keystone {
      adminMeta {
        list(key: $listKey) {
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
  });

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
  const errorsFromMetaQuery = dataGetter.get('keystone').errors;
  return (
    <PageContainer>
      <h2>
        List:{' '}
        <Link href={`/${list.path}`}>
          <a>{list.label}</a>
        </Link>
      </h2>
      {loading ? (
        'Loading...'
      ) : errorsFromMetaQuery ? (
        <div css={{ color: 'red' }}>{errorsFromMetaQuery[0].message}</div>
      ) : (
        <Fragment>
          <div
            css={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <h3>Item: {data.item._label_}</h3>
            <div css={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span css={{ marginRight: spacing.small }}>ID: {data.item.id}</span>
              <Button
                // TODO: this should be an IconButton
                onClick={() => {
                  copyToClipboard(data.item.id);
                }}
              >
                Copy
              </Button>
            </div>
          </div>
          <FormContainer>
            <ItemForm
              fieldModes={itemViewFieldModesByField}
              selectedFields={selectedFields}
              showDelete={!data.keystone.adminMeta.list!.hideDelete}
              listKey={listKey}
              itemGetter={dataGetter.get('item')}
            />
          </FormContainer>
        </Fragment>
      )}
    </PageContainer>
  );
};

const Toolbar = ({ children }: { children: ReactNode }) => {
  const { colors } = useTheme();
  return (
    <Box
      paddingTop="large"
      marginTop="xlarge"
      css={{
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      {children}
    </Box>
  );
};

const FormContainer = ({ children }: { children: ReactNode }) => {
  const { colors, shadow } = useTheme();
  return (
    <Box
      padding="large"
      rounding="medium"
      css={{
        background: colors.background,
        boxShadow: shadow.s200,
      }}
    >
      {children}
    </Box>
  );
};
