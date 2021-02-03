/** @jsx jsx */

import type { ReactNode } from 'react';
import { Box, BoxProps, Stack, Text, jsx, useTheme } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { FieldProps, ListMeta } from '@keystone-next/types';
import { Button } from '@keystone-ui/button';
import { Tooltip } from '@keystone-ui/tooltip';
import { LoadingDots } from '@keystone-ui/loading';
import {
  getRootGraphQLFieldsFromFieldController,
  makeDataGetter,
} from '@keystone-next/admin-ui-utils';
import { controller } from '../index';
import { useItemState } from './useItemState';
import { InlineEdit } from './InlineEdit';
import { InlineCreate } from './InlineCreate';
import { RelationshipSelect } from '../RelationshipSelect';
import { gql, useApolloClient } from '@keystone-next/admin-ui/apollo';
import { useEffect, useRef, useState } from 'react';
import { Link } from '@keystone-next/admin-ui/router';

type CardContainerProps = {
  children: ReactNode;
  mode: 'view' | 'create' | 'edit';
} & BoxProps;
const CardContainer = ({ mode = 'view', ...props }: CardContainerProps) => {
  const { tones } = useTheme();

  const tone = tones[mode === 'edit' ? 'active' : mode === 'create' ? 'positive' : 'passive'];

  return (
    <Box
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
};

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
  field: ReturnType<typeof controller> & { display: { mode: 'cards' } };
  id: string;
  forceValidation: boolean | undefined;
  value: { kind: 'cards-view' };
} & Pick<FieldProps<typeof controller>, 'value' | 'onChange'>) {
  let selectedFields = [
    ...new Set([...field.display.cardFields, ...(field.display.inlineEdit?.fields || [])]),
  ]
    .map(fieldPath => {
      return foreignList.fields[fieldPath].controller.graphqlSelection;
    })
    .join('\n');
  if (!field.display.cardFields.includes('id')) {
    selectedFields += '\nid';
  }
  if (
    !field.display.cardFields.includes(foreignList.labelField) &&
    foreignList.labelField !== 'id'
  ) {
    selectedFields += `\n${foreignList.labelField}`;
  }

  const { items, setItems, state: itemsState } = useItemState({
    selectedFields,
    localList,
    id,
    field,
  });

  const client = useApolloClient();

  const [isLoadingLazyItems, setIsLoadingLazyItems] = useState(false);
  const [showConnectItems, setShowConnectItems] = useState(false);
  const [hideConnectItemsLabel, setHideConnectItemsLabel] = useState<'Cancel' | 'Done'>('Cancel');

  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  });

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

  return (
    <Stack gap="xlarge">
      {[...value.currentIds].map(id => {
        const itemGetter = items[id];
        return value.itemsBeingEdited.has(id) && onChange !== undefined ? (
          <CardContainer mode="edit" key={id}>
            <InlineEdit
              list={foreignList}
              fields={field.display.inlineEdit!.fields}
              onSave={newItemGetter => {
                setItems({
                  ...items,
                  [id]: newItemGetter,
                });
                const itemsBeingEdited = new Set(value.itemsBeingEdited);
                itemsBeingEdited.delete(id);
                onChange({
                  ...value,
                  itemsBeingEdited,
                });
              }}
              selectedFields={selectedFields}
              itemGetter={itemGetter}
              onCancel={() => {
                const itemsBeingEdited = new Set(value.itemsBeingEdited);
                itemsBeingEdited.delete(id);
                onChange({
                  ...value,
                  itemsBeingEdited,
                });
              }}
            />
          </CardContainer>
        ) : (
          <CardContainer mode="view" key={id}>
            <Stack gap="xlarge">
              {field.display.cardFields.map(fieldPath => {
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
            </Stack>
            <Stack across gap="small" marginTop="xlarge">
              {field.display.inlineEdit && onChange !== undefined && (
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
              {field.display.removeMode === 'disconnect' && onChange !== undefined && (
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
              {field.display.linkToItem && (
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
          </CardContainer>
        );
      })}
      {onChange === undefined ? null : field.display.inlineConnect && showConnectItems ? (
        <CardContainer mode="edit">
          <Stack gap="small" marginY="medium" across>
            <RelationshipSelect
              autoFocus
              controlShouldRenderValue={isLoadingLazyItems}
              isDisabled={onChange === undefined}
              list={foreignList}
              isLoading={isLoadingLazyItems}
              placeholder={`Select a ${foreignList.singular}`}
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
                      items: ${foreignList.gqlNames.listQueryName}(where: {id_in:$ids}) {
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
            fields={field.display.inlineCreate!.fields}
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
      ) : field.display.inlineCreate || field.display.inlineConnect ? (
        <CardContainer mode="create">
          <Stack gap="small" marginTop="medium" across>
            {field.display.inlineCreate && (
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
            {field.display.inlineConnect && (
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
