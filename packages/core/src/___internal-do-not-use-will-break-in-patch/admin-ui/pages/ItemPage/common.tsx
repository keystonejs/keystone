import { useRouter } from 'next/router'
import { type HTMLAttributes, type ReactNode, Fragment, Key } from 'react'

import { ActionGroup } from '@keystar/ui/action-group'
import { Breadcrumbs, Item } from '@keystar/ui/breadcrumbs'
import { Icon } from '@keystar/ui/icon'
import { allIcons as KeystarIcons } from '@keystar/ui/icon/all'
import { Grid, HStack } from '@keystar/ui/layout'
import { breakpointQueries, css, tokenSchema } from '@keystar/ui/style'
import { Heading, Text } from '@keystar/ui/typography'
import { Container } from '../../../../admin-ui/components/Container'
import type { ListMeta } from '../../../../types'

export function ItemPageHeader({
  label,
  list,
  title = label,
  onAction,
}: {
  label: string
  list: ListMeta
  title: string
  onAction: (key: Key) => void
}) {
  const router = useRouter()
  const actions = list.actions.filter(action => action.itemView.actionMode !== 'hidden')
  const disabledActions = list.actions.filter(action => action.itemView.actionMode === 'disabled').map(action => action.key)

  return (
    <HStack gap="regular">
      {list.isSingleton ? (
        <Heading elementType="h1" size="small">
          {list.label}
        </Heading>
      ) : (
        <Fragment>
          <Breadcrumbs flex size="medium" minWidth="alias.singleLineWidth">
            <Item href={`/${list.path}`}>{list.label}</Item>
            <Item href={router.asPath}>{label}</Item>
          </Breadcrumbs>

          {/* Every page must have an H1 for accessibility. */}
          <Text elementType="h1" visuallyHidden>
            {title}
          </Text>
        </Fragment>
      )}
      <ActionGroup
        disabledKeys={disabledActions}
        onAction={onAction}
        overflowMode="collapse">
        {[...(function* () {
          for (const action of actions) {
            const iconComponent = action.icon ? KeystarIcons[action.icon] : null
            yield <Item
              key={action.key}
              textValue={action.label}>
              {iconComponent ? <Icon src={iconComponent} /> : null}
              <Text>{action.label}</Text>
            </Item>
          }
        })()]}
      </ActionGroup>
  </HStack>
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
