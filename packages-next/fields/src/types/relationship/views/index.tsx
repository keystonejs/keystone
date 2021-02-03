/* @jsx jsx */

import { Fragment, ReactNode, useState } from 'react';

import { CellContainer, CreateItemDrawer } from '@keystone-next/admin-ui/components';
import { useKeystone, useList } from '@keystone-next/admin-ui/context';
import { Link } from '@keystone-next/admin-ui/router';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
  ListMeta,
} from '@keystone-next/types';
import { Button } from '@keystone-ui/button';
import { Inline, jsx, Stack, useTheme } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, FieldLegend } from '@keystone-ui/fields';
import { DrawerController } from '@keystone-ui/modals';

import { Cards } from './cards';
import { RelationshipSelect } from './RelationshipSelect';

function LinkToRelatedItems({
  value,
  list,
}: {
  value: FieldProps<typeof controller>['value'] & { kind: 'many' | 'one' };
  list: ListMeta;
}) {
  const commonProps = {
    size: 'small',
    tone: 'active',
    weight: 'link',
  } as const;

  if (value.kind === 'many') {
    return (
      <Button
        {...commonProps}
        as={Link}
        // What happens when there are 10,000 ids? The URL would be too
        // big, so we arbitrarily limit it to the first 100
        // TODO: we should be able to filter by this, no?
        href={`/${list.path}?!id_in="${value.value
          .slice(0, 100)
          .map(({ id }) => id)
          .join(',')}"`}
      >
        View related {list.plural}
      </Button>
    );
  }

  return (
    <Button {...commonProps} as={Link} href={`/${list.path}/${value.value?.id}`}>
      View {list.singular} details
    </Button>
  );
}

const RelationshipLinkButton = ({ href, children }: { href: string; children: ReactNode }) => (
  <Button css={{ padding: 0, height: 'auto' }} weight="link" tone="active" as={Link} href={href}>
    {children}
  </Button>
);

const RelationshipDisplay = ({
  list,
  value,
}: {
  list: ListMeta;
  value: SingleRelationshipValue | ManyRelationshipValue;
}) => {
  if (value.kind === 'many') {
    if (value.value.length) {
      return (
        <Inline gap="small">
          {value.value.map(i => (
            <RelationshipLinkButton href={`/${list.path}/${i.id}`}>
              {i.label}
            </RelationshipLinkButton>
          ))}
        </Inline>
      );
    } else {
      return <div>(No {list.plural})</div>;
    }
  } else {
    if (value.value) {
      return (
        <RelationshipLinkButton href={`/${list.path}/${value.value.id}`}>
          {value.value.label}
        </RelationshipLinkButton>
      );
    } else {
      return <div>(No {list.singular})</div>;
    }
  }
};

export const Field = ({
  field,
  autoFocus,
  value,
  onChange,
  forceValidation,
}: FieldProps<typeof controller>) => {
  const keystone = useKeystone();
  const foreignList = useList(field.refListKey);
  const localList = useList(field.listKey);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (value.kind === 'cards-view') {
    return (
      <Stack as="fieldset" gap="medium">
        <FieldLegend>{field.label}</FieldLegend>
        <Cards
          forceValidation={forceValidation}
          field={field as any}
          id={value.id!}
          value={value}
          onChange={onChange}
          foreignList={foreignList}
          localList={localList}
        />
      </Stack>
    );
  }

  return (
    <FieldContainer>
      <FieldLabel as="legend">{field.label}</FieldLabel>
      {onChange ? (
        <Fragment>
          <Stack gap="medium">
            <RelationshipSelect
              controlShouldRenderValue
              autoFocus={autoFocus}
              isDisabled={onChange === undefined}
              list={foreignList}
              state={
                value.kind === 'many'
                  ? {
                      kind: 'many',
                      value: value.value,
                      onChange(newItems) {
                        onChange({
                          ...value,
                          value: newItems,
                        });
                      },
                    }
                  : {
                      kind: 'one',
                      value: value.value,
                      onChange(newVal) {
                        if (value.kind === 'one') {
                          onChange({
                            ...value,
                            value: newVal,
                          });
                        }
                      },
                    }
              }
            />
            <Stack across gap="small">
              {!field.hideCreate && (
                <Button
                  size="small"
                  disabled={isDrawerOpen}
                  onClick={() => {
                    setIsDrawerOpen(true);
                  }}
                >
                  Create related {foreignList.singular}
                </Button>
              )}
              {keystone.authenticatedItem.state === 'authenticated' &&
                keystone.authenticatedItem.listKey === field.refListKey && (
                  <Button
                    size="small"
                    isDisabled={onChange === undefined}
                    onClick={() => {
                      if (keystone.authenticatedItem.state === 'authenticated') {
                        const val = {
                          label: keystone.authenticatedItem.label,
                          id: keystone.authenticatedItem.id,
                        };
                        if (value.kind === 'many') {
                          onChange({
                            ...value,
                            value: [...value.value, val],
                          });
                        } else {
                          onChange({
                            ...value,
                            value: val,
                          });
                        }
                      }
                    }}
                  >
                    {value.kind === 'many' ? 'Add ' : 'Set as '}
                    {keystone.authenticatedItem.label}
                  </Button>
                )}
              {!!(value.kind === 'many'
                ? value.value.length
                : value.kind === 'one' && value.value) && (
                <LinkToRelatedItems list={foreignList} value={value} />
              )}
            </Stack>
          </Stack>
          <DrawerController isOpen={isDrawerOpen}>
            <CreateItemDrawer
              listKey={foreignList.key}
              onClose={() => {
                setIsDrawerOpen(false);
              }}
              onCreate={val => {
                setIsDrawerOpen(false);
                if (value.kind === 'many') {
                  onChange({
                    ...value,
                    value: [...value.value, val],
                  });
                } else if (value.kind === 'one') {
                  onChange({
                    ...value,
                    value: val,
                  });
                }
              }}
            />
          </DrawerController>
        </Fragment>
      ) : (
        <RelationshipDisplay value={value} list={foreignList} />
      )}
    </FieldContainer>
  );
};

export const Cell: CellComponent<typeof controller> = ({ field, item }) => {
  const list = useList(field.refListKey);
  const data = item[field.path];
  const items = (Array.isArray(data) ? data : [data]).filter(item => item);
  const displayItems = items.length < 5 ? items : items.slice(0, 3);
  const overflow = items.length < 5 ? 0 : items.length - 3;
  const { colors } = useTheme();
  const styles = {
    color: colors.foreground,
    textDecoration: 'none',

    ':hover': {
      textDecoration: 'underline',
    },
  } as const;

  return (
    <CellContainer>
      {displayItems.map((item, index) => (
        <Fragment key={item.id}>
          {!!index ? ', ' : ''}
          <Link href={`/${list.path}/[id]`} as={`/${list.path}/${item.id}`} css={styles}>
            {item.label || item.id}
          </Link>
        </Fragment>
      ))}
      {overflow ? `, and ${overflow} more` : null}
    </CellContainer>
  );
};

export const CardValue: CardValueComponent<typeof controller> = ({ field, item }) => {
  const list = useList(field.refListKey);
  const data = item[field.path];
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {(Array.isArray(data) ? data : [data])
        .filter(item => item)
        .map((item, index) => (
          <Fragment key={item.id}>
            {!!index ? ', ' : ''}
            <Link href={`/${list.path}/[id]`} as={`/${list.path}/${item.id}`}>
              {item.label || item.id}
            </Link>
          </Fragment>
        ))}
    </FieldContainer>
  );
};

type SingleRelationshipValue = {
  kind: 'one';
  initialValue: { label: string; id: string } | null;
  value: { label: string; id: string } | null;
};
type ManyRelationshipValue = {
  kind: 'many';
  initialValue: { label: string; id: string }[];
  value: { label: string; id: string }[];
};
type CardsRelationshipValue = {
  kind: 'cards-view';
  id: null | string;
  itemsBeingEdited: ReadonlySet<string>;
  itemBeingCreated: boolean;
  initialIds: ReadonlySet<string>;
  currentIds: ReadonlySet<string>;
};

type RelationshipController = FieldController<
  ManyRelationshipValue | SingleRelationshipValue | CardsRelationshipValue
> & {
  display:
    | {
        mode: 'select';
        refLabelField: string;
      }
    | {
        mode: 'cards';
        cardFields: string[];
        linkToItem: boolean;
        removeMode: 'disconnect' | 'none';
        inlineCreate: { fields: string[] } | null;
        inlineEdit: { fields: string[] } | null;
        inlineConnect: boolean;
      };
  listKey: string;
  refListKey: string;
  hideCreate: boolean;
  many: boolean;
};

export const controller = (
  config: FieldControllerConfig<
    {
      refListKey: string;
      many: boolean;
      hideCreate: boolean;
    } & (
      | {
          displayMode: 'select';
          refLabelField: string;
        }
      | {
          displayMode: 'cards';
          cardFields: string[];
          linkToItem: boolean;
          removeMode: 'disconnect' | 'none';
          inlineCreate: { fields: string[] } | null;
          inlineEdit: { fields: string[] } | null;
          inlineConnect: boolean;
        }
    )
  >
): RelationshipController => {
  return {
    many: config.fieldMeta.many,
    listKey: config.listKey,
    path: config.path,
    label: config.label,
    display:
      config.fieldMeta.displayMode === 'cards'
        ? {
            mode: 'cards',
            cardFields: config.fieldMeta.cardFields,
            inlineCreate: config.fieldMeta.inlineCreate,
            inlineEdit: config.fieldMeta.inlineEdit,
            linkToItem: config.fieldMeta.linkToItem,
            removeMode: config.fieldMeta.removeMode,
            inlineConnect: config.fieldMeta.inlineConnect,
          }
        : {
            mode: 'select',
            refLabelField: config.fieldMeta.refLabelField,
          },
    refListKey: config.fieldMeta.refListKey,
    graphqlSelection:
      config.fieldMeta.displayMode === 'cards'
        ? // TODO: namespace this stuff at the Keystone level
          `${config.path}__id: id
           ${config.path} {
            id
           }`
        : `${config.path} {
             id
             label: ${config.fieldMeta.refLabelField}
           }`,
    hideCreate: config.fieldMeta.hideCreate,
    defaultValue: config.fieldMeta.many
      ? {
          kind: 'many',
          initialValue: [],
          value: [],
        }
      : { kind: 'one', value: null, initialValue: null },
    deserialize: data => {
      if (config.fieldMeta.displayMode === 'cards') {
        const initialIds = new Set<string>(
          (Array.isArray(data[config.path])
            ? data[config.path]
            : data[config.path]
            ? [data[config.path]]
            : []
          ).map((x: any) => x.id)
        );
        return {
          kind: 'cards-view',
          id: data[`${config.path}__id`],
          itemsBeingEdited: new Set(),
          itemBeingCreated: false,
          initialIds,
          currentIds: initialIds,
        };
      }
      if (config.fieldMeta.many) {
        let value = (data[config.path] || []).map((x: any) => ({
          id: x.id,
          label: x.label || x.id,
        }));
        return {
          kind: 'many',
          initialValue: value,
          value,
        };
      }
      let value = data[config.path];
      if (value) {
        value = {
          id: value.id,
          label: value.label || value.id,
        };
      }
      return {
        kind: 'one',
        value,
        initialValue: value,
      };
    },
    validate(value) {
      return (
        value.kind !== 'cards-view' ||
        (value.itemsBeingEdited.size === 0 && !value.itemBeingCreated)
      );
    },
    serialize: state => {
      if (state.kind === 'many') {
        const newAllIds = new Set(state.value.map(x => x.id));
        const initialIds = new Set(state.initialValue.map(x => x.id));
        let disconnect = state.initialValue
          .filter(x => !newAllIds.has(x.id))
          .map(x => ({ id: x.id }));
        let connect = state.value.filter(x => !initialIds.has(x.id)).map(x => ({ id: x.id }));
        if (disconnect.length || connect.length) {
          let output: any = {};

          if (disconnect.length) {
            output.disconnect = disconnect;
          }

          if (connect.length) {
            output.connect = connect;
          }

          return {
            [config.path]: output,
          };
        }
      } else if (state.kind === 'one') {
        if (state.initialValue && !state.value) {
          return {
            [config.path]: {
              disconnect: {
                id: state.initialValue.id,
              },
            },
          };
        } else if (state.value && state.value.id !== state.initialValue?.id) {
          return {
            [config.path]: {
              connect: {
                id: state.value.id,
              },
            },
          };
        }
      } else if (state.kind === 'cards-view') {
        let disconnect = [...state.initialIds]
          .filter(id => !state.currentIds.has(id))
          .map(id => ({ id }));
        let connect = [...state.currentIds]
          .filter(id => !state.initialIds.has(id))
          .map(id => ({ id }));

        if (config.fieldMeta.many) {
          if (disconnect.length || connect.length) {
            return {
              [config.path]: {
                connect: connect.length ? connect : undefined,
                disconnect: disconnect.length ? disconnect : undefined,
              },
            };
          }
        } else if (connect.length) {
          return {
            [config.path]: {
              connect: connect[0],
            },
          };
        } else if (disconnect.length) {
          return {
            [config.path]: {
              disconnect: disconnect[0],
            },
          };
        }
      }
      return {};
    },
  };
};
