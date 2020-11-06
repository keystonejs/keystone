/** @jsx jsx */

import { jsx, Stack, useTheme } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { FieldProps, ListMeta } from '@keystone-next/types';
import { Button } from '@keystone-ui/button';
import { Tooltip } from '@keystone-ui/tooltip';
import { LoadingDots } from '@keystone-ui/loading';
import {
  getRootGraphQLFieldsFromFieldController,
  makeDataGetter,
} from '@keystone-next/admin-ui/pages/ItemPage';
import { controller } from '../index';
import { useItemState } from './useItemState';
import { InlineEdit } from './InlineEdit';
import { InlineCreate } from './InlineCreate';
import { RelationshipSelect } from '../RelationshipSelect';
import { gql, useApolloClient } from '@keystone-next/admin-ui/apollo';
import { useEffect, useRef, useState } from 'react';
import { Link } from '@keystone-next/admin-ui/router';

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

  const theme = useTheme();

  const client = useApolloClient();

  const [isLoadingLazyItems, setIsLoadingLazyItems] = useState(false);
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
    <Stack gap="medium">
      {Object.keys(items).map(id => {
        if (!value.currentIds.has(id)) return null;
        const itemGetter = items[id];
        return (
          <div
            css={{
              boxShadow: theme.shadow.s300,
              padding: theme.spacing.small,
              borderRadius: theme.radii.medium,
            }}
            key={id}
          >
            {value.itemsBeingEdited.has(id) ? (
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
                  onChange?.({
                    ...value,
                    itemsBeingEdited,
                  });
                }}
                selectedFields={selectedFields}
                itemGetter={itemGetter}
                onCancel={() => {
                  const itemsBeingEdited = new Set(value.itemsBeingEdited);
                  itemsBeingEdited.delete(id);
                  onChange?.({
                    ...value,
                    itemsBeingEdited,
                  });
                }}
              />
            ) : (
              <div>
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
                <Stack across gap="medium">
                  {field.display.inlineEdit && (
                    <Button
                      disabled={onChange === undefined}
                      onClick={() => {
                        onChange?.({
                          ...value,
                          itemsBeingEdited: new Set([...value.itemsBeingEdited, id]),
                        });
                      }}
                      weight="bold"
                      tone="active"
                    >
                      Edit
                    </Button>
                  )}
                  {field.display.removeMode === 'disconnect' && (
                    <Tooltip content="This item will not be deleted. It will only be removed from this field.">
                      {props => (
                        <Button
                          disabled={onChange === undefined}
                          onClick={() => {
                            const currentIds = new Set(value.currentIds);
                            currentIds.delete(id);
                            onChange?.({
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
                  <Button
                    css={{ textDecoration: 'none' }}
                    as={Link}
                    href={`/${foreignList.path}/${id}`}
                  >
                    Go to item details
                  </Button>
                </Stack>
              </div>
            )}
          </div>
        );
      })}
      {value.itemBeingCreated ? (
        <InlineCreate
          selectedFields={selectedFields}
          fields={field.display.inlineCreate!.fields}
          list={foreignList}
          onCancel={() => {
            onChange?.({ ...value, itemBeingCreated: false });
          }}
          onCreate={itemGetter => {
            const id = itemGetter.data.id;
            onChange?.({
              ...value,
              itemBeingCreated: false,
              currentIds: new Set([...value.currentIds, id]),
            });
            setItems({ ...items, [id]: itemGetter });
          }}
        />
      ) : (
        <Button
          disabled={onChange === undefined}
          onClick={() => {
            onChange?.({
              ...value,
              itemBeingCreated: true,
            });
          }}
        >
          Create {foreignList.singular}
        </Button>
      )}
      {field.display.linkToItem && (
        <RelationshipSelect
          controlShouldRenderValue={isLoadingLazyItems}
          isDisabled={onChange === undefined}
          list={foreignList}
          isLoading={isLoadingLazyItems}
          state={{
            kind: 'many',
            async onChange(options) {
              const itemsToFetchAndConnect: string[] = [];
              options.forEach(item => {
                if (items[item.id] === undefined) {
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
                    let newCurrentIds = new Set(value.currentIds);
                    if (Array.isArray(itemsDataGetter.data)) {
                      itemsDataGetter.data.forEach((item, i) => {
                        if (item?.id != null) {
                          newCurrentIds.add(item.id);
                          newItems[item.id] = itemsDataGetter.get(i);
                        }
                      });
                    }
                    setItems(newItems);
                    onChange?.({
                      ...value,
                      currentIds: newCurrentIds,
                    });
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
      )}
      {forceValidation && (
        <span css={{ color: 'red' }}>
          You must finish creating and editing any related {foreignList.label.toLowerCase()} before
          saving the {localList.singular.toLowerCase()}
        </span>
      )}
    </Stack>
  );
}
