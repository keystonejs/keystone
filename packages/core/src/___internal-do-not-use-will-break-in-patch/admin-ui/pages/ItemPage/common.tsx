import { useRouter } from 'next/router'
import type { HTMLAttributes, Key, ReactNode } from 'react';
import { useMemo } from 'react'

import { ActionGroup } from '@keystar/ui/action-group'
import { Breadcrumbs, Item } from '@keystar/ui/breadcrumbs'
import { Icon } from '@keystar/ui/icon'
import { allIcons as KeystarIcons } from '@keystar/ui/icon/all'
import { Grid, HStack } from '@keystar/ui/layout'
import { breakpointQueries, css, tokenSchema } from '@keystar/ui/style'
import { Heading, Text } from '@keystar/ui/typography'
import { Container } from '../../../../admin-ui/components/Container'
import type { ActionMeta, ListMeta } from '../../../../types'

type ItemPageHeaderProps = {
  label: string
  list: ListMeta
  title: string
  onAction: (key: Key) => void
}

export function ItemPageHeader(props: ItemPageHeaderProps) {
  const router = useRouter()
  
  const { label, list, title = label, onAction } = props
  const actions = list.actions.filter(action => action.itemView.actionMode !== 'hidden')

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
    >
      {list.isSingleton ? (
        <Heading elementType="h1" size="small" gridArea="primary" truncate>
          {list.label}
        </Heading>
      ) : (
        <>
          <Breadcrumbs size="medium" gridArea="primary">
            <Item href={`/${list.path}`}>{list.label}</Item>
            <Item href={router.asPath}>{label}</Item>
          </Breadcrumbs>

          {/* Every page must have an H1 for accessibility. */}
          <Text elementType="h1" visuallyHidden>
            {title}
          </Text>
        </>
      )}

      {actions.length > 0 && (
        <ItemActions actions={actions} onAction={onAction} />
      )}
    </Grid>
  )
}

type ItemActionsProps = {
  actions: ActionMeta[],
  onAction: (key: Key) => void
}

function ItemActions(props: ItemActionsProps) {
  const { actions, onAction } = props

  const items = useMemo(() => actions.map(action => ({
    id: action.key,
    label: action.label,
    icon: action.icon ? KeystarIcons[action.icon] : null,
  })), [actions])

  const disabledKeys = useMemo(() => actions
    .filter(action => action.itemView.actionMode === 'disabled')
    .map(action => action.key),
  [actions])

  return (
    <ActionGroup
      gridArea="secondary"
      disabledKeys={disabledKeys}
      onAction={onAction}
      overflowMode="collapse"
      items={items}
    >
      {item => (
        <Item textValue={item.label}>
          {item.icon && <Icon src={item.icon} />}
          <Text>{item.label}</Text>
        </Item>
      )}
    </ActionGroup>
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
