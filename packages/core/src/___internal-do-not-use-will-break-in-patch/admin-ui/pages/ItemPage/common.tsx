'use client'
import type { HTMLAttributes, ReactNode } from 'react'
import { Fragment, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

import { ActionGroup } from '@keystar/ui/action-group'
import { Breadcrumbs, Item } from '@keystar/ui/breadcrumbs'
import { AlertDialog, DialogContainer } from '@keystar/ui/dialog'
import { Icon } from '@keystar/ui/icon'
import { allIcons as KeystarIcons } from '@keystar/ui/icon/all'
import { Grid, HStack } from '@keystar/ui/layout'
import { breakpointQueries, css, tokenSchema } from '@keystar/ui/style'
import { toastQueue } from '@keystar/ui/toast'
import { Heading, Text } from '@keystar/ui/typography'
import { gql, useApolloClient } from '../../../../admin-ui/apollo'
import { Container, CONTAINER_MAX } from '../../../../admin-ui/components/Container'
import { ErrorDetailsDialog } from '../../../../admin-ui/components/Errors'
import type { ActionMeta, ListMeta } from '../../../../types'
import { useKeystone } from '../../../../admin-ui'

export function ItemPageHeader({
  list,
  actions,
  item,
  label,
  title = label,
  onAction,
}: {
  list: ListMeta
  actions: ActionMeta[]
  item: Record<string, unknown> | null
  label: string
  title: string
  onAction: ((action: ActionMeta, resultId: string) => void) | null
}) {
  const pathname = usePathname()
  const { adminPath } = useKeystone()

  return (
    <Grid
      // fill space; take over layout from the `PageContainer` flex wrapper
      flex
      // make sure actions don't run into the primary element, even though it'll truncate
      gap="medium"
      // best efforts to ensure actions collapse first, then the title/breadcrumbs may truncate
      columns={`minmax(50cqw, auto) minmax(${tokenSchema.size.element.regular}, max-content)`}
      // grid areas required because the `ActionGroup` implements focus
      // sentinels (span) before and after the root element
      areas={['primary secondary']}
      // treat this area like a container
      minWidth={0}
      maxWidth={CONTAINER_MAX}
    >
      {list.isSingleton ? (
        <Heading elementType="h1" size="small" gridArea="primary" truncate>
          {list.label}
        </Heading>
      ) : (
        <>
          <Breadcrumbs size="medium" gridArea="primary">
            <Item href={`${adminPath}/${list.path}`}>{list.label}</Item>
            <Item href={`${pathname}`}>{label}</Item>
          </Breadcrumbs>

          {/* Every page must have an H1 for accessibility. */}
          <Text elementType="h1" visuallyHidden>
            {title}
          </Text>
        </>
      )}

      {item && onAction && actions.length > 0 && (
        <ItemActions list={list} item={item} actions={actions} onAction={onAction} />
      )}
    </Grid>
  )
}

function replace(
  s: string,
  list: ListMeta,
  args: {
    itemLabel?: string
  }
) {
  if (s.includes('{Singular}')) s = s.replaceAll('{Singular}', list.singular)
  if (s.includes('{Plural}')) s = s.replaceAll('{Plural}', list.plural)
  if (s.includes('{singular}')) s = s.replaceAll('{singular}', list.singular.toLowerCase())
  if (s.includes('{plural}')) s = s.replaceAll('{plural}', list.plural.toLowerCase())
  if ('itemLabel' in args) s = s.replaceAll('{itemLabel}', args.itemLabel ?? '')
  return s
}

type ActionError = {
  action: ActionMeta
  error: Error
}

export function ItemActions({
  list,
  item,
  actions,
  onAction,
}: {
  list: ListMeta
  item: Record<string, unknown>
  actions: ActionMeta[]
  onAction: (action: ActionMeta, resultId: string) => void
}) {
  const apolloClient = useApolloClient()
  const actionItems = useMemo(
    () =>
      actions.map(action => ({
        id: action.key,
        label: action.label,
        icon: action.icon ? KeystarIcons[action.icon] : null,
      })),
    [actions]
  )
  const [actionError, setActionError] = useState<ActionError | null>(null)
  const [activeAction, setActiveAction] = useState<ActionMeta | null>(null)
  const itemLabel_ = item[list.labelField] ?? item.id
  const itemLabel = typeof itemLabel_ === 'string' ? itemLabel_ : (item.id as string)

  const disabledKeys = useMemo(
    () =>
      actions.filter(action => action.itemView.actionMode === 'disabled').map(action => action.key),
    [actions]
  )

  async function onTryAction(action: ActionMeta, confirmed: boolean) {
    setActiveAction(null)

    if (!confirmed && !action.itemView.hidePrompt) {
      setActiveAction(action)
      return
    }

    const { messages: m } = action
    try {
      const data = await apolloClient.mutate({
        mutation: gql`mutation ${action.graphql.names.one}($id: ID!) {
            result: ${action.graphql.names.one}(where: { id: $id }) {
              id
            }
          }`,
        variables: { id: item.id },
      })

      if (!action.itemView.hideToast) {
        toastQueue.neutral(replace(m.success, list, { itemLabel }), { timeout: 5000 })
      }

      onAction(action, data.data?.result?.id)
    } catch (error: any) {
      toastQueue.critical(replace(m.fail, list, { itemLabel }), {
        actionLabel: 'Details',
        onAction: () => setActionError({ action, error }),
        shouldCloseOnAction: true,
      })
    }
  }

  return (
    <Fragment>
      <ActionGroup
        gridArea="secondary"
        disabledKeys={disabledKeys}
        overflowMode="collapse"
        items={actionItems}
        onAction={key => {
          const action = list.actions.find(action => action.key === key)
          if (!action) return
          onTryAction(action, false)
        }}
      >
        {item => (
          <Item textValue={item.label}>
            {item.icon && <Icon src={item.icon} />}
            <Text>{item.label}</Text>
          </Item>
        )}
      </ActionGroup>
      <DialogContainer onDismiss={() => setActiveAction(null)}>
        {activeAction && (
          <AlertDialog
            title={replace(activeAction.messages.promptTitle, list, { itemLabel })}
            cancelLabel="Cancel"
            primaryActionLabel={replace(activeAction.messages.promptConfirmLabel, list, {
              itemLabel,
            })}
            onPrimaryAction={async () => {
              await onTryAction(activeAction, true)
            }}
          >
            {replace(activeAction.messages.prompt, list, { itemLabel })}
          </AlertDialog>
        )}
      </DialogContainer>

      <DialogContainer onDismiss={() => setActionError(null)} isDismissable>
        {actionError && (
          <ErrorDetailsDialog
            title={replace(actionError.action.messages.fail, list, { itemLabel })}
            error={actionError.error}
          />
        )}
      </DialogContainer>
    </Fragment>
  )
}

export function ColumnLayout(props: HTMLAttributes<HTMLDivElement>) {
  return (
    // this container must be relative to catch absolute children
    // particularly the "expanded" document-field, which needs a height of 100%
    <Container position="relative" height="100%">
      <div
        className={css({
          display: 'grid',
          columnGap: tokenSchema.size.space.xlarge,
          gridTemplateAreas: '"main" "sidebar" "toolbar"',

          [breakpointQueries.above.tablet]: {
            gridTemplateColumns: `2fr minmax(${tokenSchema.size.scale[3600]}, 1fr)`,
            gridTemplateAreas: '"main sidebar" "toolbar toolbar"',
          },
        })}
        {...props}
      />
    </Container>
  )
}

export function StickySidebar(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={css({
        gridArea: 'sidebar',
        marginTop: tokenSchema.size.space.xlarge,

        [breakpointQueries.above.tablet]: {
          alignSelf: 'start',
          marginBottom: tokenSchema.size.element.xlarge,
          // sync with toolbar height
          paddingBottom: tokenSchema.size.element.xlarge,
          position: 'sticky',
          top: tokenSchema.size.space.xlarge,
        },
      })}
      {...props}
    />
  )
}

export function BaseToolbar(props: { children: ReactNode }) {
  return (
    <Grid
      backgroundColor="surface"
      columns="subgrid"
      gridArea="toolbar"
      insetBottom={0}
      marginTop="xlarge"
      position={{ tablet: 'sticky' }}
      zIndex={20}
      UNSAFE_className={css({
        // fuzzy mask sidebar fields, which slide behind the un-bordered portion
        // of the sticky toolbar
        [breakpointQueries.above.tablet]: {
          '&::after': {
            boxShadow: `0 -4px 4px 1px ${tokenSchema.color.background.surface}`,
            content: '""',
          },
        },
      })}
    >
      <HStack
        alignItems="center"
        borderTop="neutral"
        gap="regular"
        height="element.xlarge"
        UNSAFE_className={css({
          // stretch horizontally to ensure field focus-rings are covered
          [breakpointQueries.above.mobile]: {
            backgroundColor: tokenSchema.color.background.surface,
            marginInline: `calc(${tokenSchema.size.alias.focusRing} * -1)`,
            paddingInline: tokenSchema.size.alias.focusRing,
          },
        })}
      >
        {props.children}
      </HStack>
    </Grid>
  )
}
