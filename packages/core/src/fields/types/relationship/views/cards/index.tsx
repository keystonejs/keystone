/** @jsxRuntime classic */
/** @jsx jsx */

import { ReactNode } from 'react';
import {
  Box,
  BoxProps,
  Stack,
  Text,
  jsx,
  useTheme,
  forwardRefWithAs,
  VisuallyHidden,
} from '@keystone-ui/core';

import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { Button } from '@keystone-ui/button';
import { Tooltip } from '@keystone-ui/tooltip';
import { LoadingDots } from '@keystone-ui/loading';
import { useEffect, useRef, useState } from 'react';
import { FieldProps, ListMeta } from '../../../../../types';
import {
  getRootGraphQLFieldsFromFieldController,
  makeDataGetter,
} from '../../../../../admin-ui/utils';
import { Link } from '../../../../../admin-ui/router';
import { gql, useApolloClient } from '../../../../../admin-ui/apollo';
import { controller } from '../index';
import { RelationshipSelect } from '../RelationshipSelect';
import { useItemState } from './useItemState';
import { InlineEdit } from './InlineEdit';
import { InlineCreate } from './InlineCreate';

type CardContainerProps = {
  children: ReactNode;
  mode: 'view' | 'create' | 'edit';
} & BoxProps;
const CardContainer = forwardRefWithAs(({ mode = 'view', ...props }: CardContainerProps, ref) => {
  const { tones } = useTheme();

  const tone = tones[mode === 'edit' ? 'active' : mode === 'create' ? 'positive' : 'passive'];

  return (
    <Box
      ref={ref}
      paddingLeft="xlarge"
      css={{
        position: 'relative',

        ':before': {
          content: '" "',
          backgroundColor: tone.border,
          borderRadius: 4,
          width: 4,
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1,
        },
      }}
      {...props}
    />
  );
});

export function Cards({
  localList,
  field,
  foreignList,
  id,
  value,
  onChange,
  forceValidation,
}: {
  foreignList: ListMeta;
  localList: ListMeta;
  id: string | null;
  value: { kind: 'cards-view' };
} & FieldProps<typeof controller>) {
  const { displayOptions } = value;
  let selectedFields = [
    ...new Set([...displayOptions.cardFields, ...(displayOptions.inlineEdit?.fields || [])]),
  ]
    .map(fieldPath => {
      return foreignList.fields[fieldPath].controller.graphqlSelection;
    })
    .join('\n');
  if (!displayOptions.cardFields.includes('id')) {
    selectedFields += '\nid';
  }
  if (
    !displayOptions.cardFields.includes(foreignList.labelField) &&
    foreignList.labelField !== 'id'
  ) {
    selectedFields += `\n${foreignList.labelField}`;
  }

  const {
    items,
    setItems,
    state: itemsState,
  } = useItemState({
    selectedFields,
    localList,
    id,
    field,
  });

  const client = useApolloClient();

  const [isLoadingLazyItems, setIsLoadingLazyItems] = useState(false);
  const [showConnectItems, setShowConnectItems] = useState(false);
  const [hideConnectItemsLabel, setHideConnectItemsLabel] = useState<'Cancel' | 'Done'>('Cancel');
  const editRef = useRef<HTMLDivElement | null>(null);

  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  });

  useEffect(() => {
    if (value.itemsBeingEdited) {
      editRef?.current?.focus();
    }
  }, [value]);

  if (itemsState.kind === 'loading') {
    return (
      <div>
        <LoadingDots label={`Loading items for ${field.label} field`} />
      </div>
    );
  }
  if (itemsState.kind === 'error') {
    return <span css={{ color: 'red' }}>{itemsState.message}</span>;
  }

  const currentIdsArrayWithFetchedItems = [...value.currentIds]
    .map(id => ({ itemGetter: items[id], id }))
    .filter(x => x.itemGetter);

  return (
    <Stack gap="medium">
      {currentIdsArrayWithFetchedItems.length !== 0 && (
        <Stack
          as="ul"
          gap="medium"
          css={{
            padding: 0,
            margin: 0,
            li: {
              listStyle: 'none',
            },
          }}
        >
          {currentIdsArrayWithFetchedItems.map(({ id, itemGetter }, index) => {
            const isEditMode = !!(onChange !== undefined) && value.itemsBeingEdited.has(id);
            return (
              <CardContainer role="status" mode={isEditMode ? 'edit' : 'view'} key={id}>
                <VisuallyHidden as="h2">{`${field.label} ${index + 1} ${
                  isEditMode ? 'edit' : 'view'
                } mode`}</VisuallyHidden>
                {isEditMode ? (
                  <InlineEdit
                    list={foreignList}
                    fields={displayOptions.inlineEdit!.fields}
                    onSave={newItemGetter => {
                      setItems({
                        ...items,
                        [id]: newItemGetter,
                      });
                      const itemsBeingEdited = new Set(value.itemsBeingEdited);
                      itemsBeingEdited.delete(id);
                      onChange!({
                        ...value,
                        itemsBeingEdited,
                      });
                    }}
                    selectedFields={selectedFields}
                    itemGetter={itemGetter}
                    onCancel={() => {
                      const itemsBeingEdited = new Set(value.itemsBeingEdited);
                      itemsBeingEdited.delete(id);
                      onChange!({
                        ...value,
                        itemsBeingEdited,
                      });
                    }}
                  />
                ) : (
                  <Stack gap="xlarge">
                    {displayOptions.cardFields.map(fieldPath => {
                      const field = foreignList.fields[fieldPath];
                      const itemForField: Record<string, any> = {};
                      for (const graphqlField of getRootGraphQLFieldsFromFieldController(
                        field.controller
                      )) {
                        const fieldGetter = itemGetter.get(graphqlField);
                        if (fieldGetter.errors) {
                          const errorMessage = fieldGetter.errors[0].message;
                          return (
                            <FieldContainer>
                              <FieldLabel>{field.label}</FieldLabel>
                              {errorMessage}
                            </FieldContainer>
                          );
                        }
                        itemForField[graphqlField] = fieldGetter.data;
                      }
                      return (
                        <field.views.CardValue
                          key={fieldPath}
                          field={field.controller}
                          item={itemForField}
                        />
                      );
                    })}
                    <Stack across gap="small">
                      {displayOptions.inlineEdit && onChange !== undefined && (
                        <Button
                          size="small"
                          disabled={onChange === undefined}
                          onClick={() => {
                            onChange({
                              ...value,
                              itemsBeingEdited: new Set([...value.itemsBeingEdited, id]),
                            });
                          }}
                          tone="active"
                        >
                          Edit
                        </Button>
                      )}
                      {displayOptions.removeMode === 'disconnect' && onChange !== undefined && (
                        <Tooltip content="This item will not be deleted. It will only be removed from this field.">
                          {props => (
                            <Button
                              size="small"
                              disabled={onChange === undefined}
                              onClick={() => {
                                const currentIds = new Set(value.currentIds);
                                currentIds.delete(id);
                                onChange({
                                  ...value,
                                  currentIds,
                                });
                              }}
                              {...props}
                              tone="negative"
                            >
                              Remove
                            </Button>
                          )}
                        </Tooltip>
                      )}
                      {displayOptions.linkToItem && (
                        <Button
                          size="small"
                          weight="link"
                          tone="active"
                          css={{ textDecoration: 'none' }}
                          as={Link}
                          href={`/${foreignList.path}/${id}`}
                        >
                          View {foreignList.singular} details
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                )}
              </CardContainer>
            );
          })}
        </Stack>
      )}
      {onChange === undefined ? null : displayOptions.inlineConnect && showConnectItems ? (
        <CardContainer mode="edit">
          <Stack
            gap="small"
            across
            css={{
              width: '100%',
              justifyContent: 'space-between',
              'div:first-of-type': {
                flex: '2',
              },
            }}
          >
            <RelationshipSelect
              autoFocus
              controlShouldRenderValue={isLoadingLazyItems}
              isDisabled={onChange === undefined}
              list={foreignList}
              labelField={field.refLabelField}
              searchFields={field.refSearchFields}
              isLoading={isLoadingLazyItems}
              placeholder={`Select a ${foreignList.singular}`}
              portalMenu
              state={{
                kind: 'many',
                async onChange(options) {
                  // TODO: maybe use the extraSelection prop on RelationshipSelect here
                  const itemsToFetchAndConnect: string[] = [];
                  options.forEach(item => {
                    if (!value.currentIds.has(item.id)) {
                      itemsToFetchAndConnect.push(item.id);
                    }
                  });
                  if (itemsToFetchAndConnect.length) {
                    try {
                      const { data, errors } = await client.query({
                        query: gql`query ($ids: [ID!]!) {
                      items: ${foreignList.gqlNames.listQueryName}(where: { id: { in: $ids }}) {
                        ${selectedFields}
                      }
                    }`,
                        variables: { ids: itemsToFetchAndConnect },
                      });
                      if (isMountedRef.current) {
                        const dataGetters = makeDataGetter(data, errors);
                        const itemsDataGetter = dataGetters.get('items');
                        let newItems = { ...items };
                        let newCurrentIds = field.many
                          ? new Set(value.currentIds)
                          : new Set<string>();
                        if (Array.isArray(itemsDataGetter.data)) {
                          itemsDataGetter.data.forEach((item, i) => {
                            if (item?.id != null) {
                              newCurrentIds.add(item.id);
                              newItems[item.id] = itemsDataGetter.get(i);
                            }
                          });
                        }
                        if (newCurrentIds.size) {
                          setItems(newItems);
                          onChange({
                            ...value,
                            currentIds: newCurrentIds,
                          });
                          setHideConnectItemsLabel('Done');
                        }
                      }
                    } finally {
                      if (isMountedRef.current) {
                        setIsLoadingLazyItems(false);
                      }
                    }
                  }
                },
                value: (() => {
                  let options: { label: string; id: string }[] = [];
                  Object.keys(items).forEach(id => {
                    if (value.currentIds.has(id)) {
                      options.push({ id, label: id });
                    }
                  });
                  return options;
                })(),
              }}
            />
            <Button onClick={() => setShowConnectItems(false)}>{hideConnectItemsLabel}</Button>
          </Stack>
        </CardContainer>
      ) : value.itemBeingCreated ? (
        <CardContainer mode="create">
          <InlineCreate
            selectedFields={selectedFields}
            fields={displayOptions.inlineCreate!.fields}
            list={foreignList}
            onCancel={() => {
              onChange({ ...value, itemBeingCreated: false });
            }}
            onCreate={itemGetter => {
              const id = itemGetter.data.id;
              setItems({ ...items, [id]: itemGetter });
              onChange({
                ...value,
                itemBeingCreated: false,
                currentIds: field.many ? new Set([...value.currentIds, id]) : new Set([id]),
              });
            }}
          />
        </CardContainer>
      ) : displayOptions.inlineCreate || displayOptions.inlineConnect ? (
        <CardContainer mode="create">
          <Stack gap="small" across>
            {displayOptions.inlineCreate && (
              <Button
                size="small"
                disabled={onChange === undefined}
                tone="positive"
                onClick={() => {
                  onChange({
                    ...value,
                    itemBeingCreated: true,
                  });
                }}
              >
                Create {foreignList.singular}
              </Button>
            )}
            {displayOptions.inlineConnect && (
              <Button
                size="small"
                weight="none"
                tone="passive"
                onClick={() => {
                  setShowConnectItems(true);
                  setHideConnectItemsLabel('Cancel');
                }}
              >
                Link existing {foreignList.singular}
              </Button>
            )}
          </Stack>
        </CardContainer>
      ) : null}
      {/* TODO: this may not be visible to the user when they invoke the save action. Maybe scroll to it? */}
      {forceValidation && (
        <Text color="red600" size="small">
          You must finish creating and editing any related {foreignList.label.toLowerCase()} before
          saving the {localList.singular.toLowerCase()}
        </Text>
      )}
    </Stack>
  );
}
