import { type PropsWithChildren, useId, useMemo, useRef } from 'react'

import { ActionButton } from '@keystar/ui/button'
import { Icon } from '@keystar/ui/icon'
import { plusIcon } from '@keystar/ui/icon/icons/plusIcon'
import { Grid, VStack } from '@keystar/ui/layout'
import { useLink } from '@keystar/ui/link'
import { css, FocusRing, tokenSchema, transition } from '@keystar/ui/style'
import { Tooltip, TooltipTrigger } from '@keystar/ui/tooltip'
import { Heading, Text } from '@keystar/ui/typography'

import { gql, useQuery } from '../../../../admin-ui/apollo'
import { GraphQLErrorNotice } from '../../../../admin-ui/components/GraphQLErrorNotice'
import { PageContainer } from '../../../../admin-ui/components/PageContainer'
import { useKeystone, useList } from '../../../../admin-ui/context'

export function HomePage() {
  const { lists, error: metaError } = useKeystone()
  const visibleLists = Object.values(lists).filter(list => !list.hideNavigation)
  const LIST_COUNTS_QUERY = useMemo(
    () =>
      gql(`
    query KsFetchListCounts {
      ${[
        ...(function* () {
          if (visibleLists.length === 0) yield '__typename' // noop
          for (const list of visibleLists) {
            yield `${list.key}: ${list.graphql.names.listQueryCountName}`
          }
        })(),
      ].join('\n')}
    }`),
    [visibleLists]
  )

  const { data, error: countsError } = useQuery(LIST_COUNTS_QUERY, { errorPolicy: 'all' })
  return (
    <PageContainer
      header={
        <Heading elementType="h1" size="small">
          Dashboard
        </Heading>
      }
    >
      <Text elementType="h2" visuallyHidden>
        Lists
      </Text>
      <VStack paddingY="xlarge">
        <GraphQLErrorNotice
          errors={[
            metaError?.networkError,
            countsError?.networkError,
            ...(metaError?.graphQLErrors ?? []),
            ...(countsError?.graphQLErrors ?? []),
          ]}
        />
        <Grid
          autoRows="element.xlarge"
          columns={`repeat(
            auto-fill,
            minmax(${tokenSchema.size.scale[3000]}, 1fr)
          )`}
          gap="large"
        >
          {visibleLists.map(list => {
            return (
              <ListCard
                key={list.key}
                listKey={list.key}
                count={data?.[list.key] ?? null}
                hideCreate={list.hideCreate ?? false}
              />
            )
          })}
        </Grid>
      </VStack>
    </PageContainer>
  )
}

function ListCard({
  listKey,
  count,
  hideCreate,
}: {
  listKey: string
  count: number | null
  hideCreate: boolean
}) {
  const list = useList(listKey)
  const { adminPath } = useKeystone()
  const countElementId = useId()
  const countElement = (() => {
    if (list.isSingleton) return null
    if (count === null)
      return (
        <Text id={countElementId} color="neutralTertiary">
          Unknown
        </Text>
      )
    return (
      <Text id={countElementId} color="neutralSecondary">
        {count} item{count !== 1 ? 's' : ''}
      </Text>
    )
  })()

  return (
    <Grid
      backgroundColor="canvas"
      borderRadius="medium"
      columns="minmax(0, 1fr) auto"
      gap="regular"
      padding="large"
      position="relative"
    >
      <VStack gap="regular">
        <Heading elementType="h3" size="small" truncate>
          <CardLink
            aria-describedby={countElementId}
            href={`${adminPath}/${list.path}${list.isSingleton ? '/1' : ''}`}
          >
            {list.label}
          </CardLink>
        </Heading>

        {countElement}
      </VStack>

      {hideCreate === false && !list.isSingleton && (
        <TooltipTrigger>
          <ActionButton aria-label="add" href={`${adminPath}/${list.path}/create`}>
            <Icon src={plusIcon} />
          </ActionButton>
          <Tooltip>Add {list.singular.toLowerCase()}</Tooltip>
        </TooltipTrigger>
      )}
    </Grid>
  )
}

function CardLink(props: PropsWithChildren<{ href: string }>) {
  const ref = useRef<HTMLAnchorElement>(null)
  const { isPressed, linkProps } = useLink(props, ref)
  return (
    <FocusRing>
      <a
        ref={ref}
        {...props}
        {...linkProps}
        data-pressed={isPressed}
        className={css({
          color: tokenSchema.color.foreground.neutral,
          outline: 'none',
          textDecoration: 'none',

          '&:hover': {
            color: tokenSchema.color.foreground.neutralEmphasis,

            '::before': {
              backgroundColor: tokenSchema.color.alias.backgroundIdle,
              borderColor: tokenSchema.color.border.neutral,
            },
          },
          '&[data-pressed=true]': {
            '::before': {
              backgroundColor: tokenSchema.color.alias.backgroundHovered,
              borderColor: tokenSchema.color.alias.borderHovered,
            },
          },
          '&[data-focus=visible]::before': {
            outline: `${tokenSchema.size.alias.focusRing} solid ${tokenSchema.color.alias.focusRing}`,
            outlineOffset: tokenSchema.size.alias.focusRingGap,
          },

          // fill available space so the entire card is clickable
          '&::before': {
            border: `${tokenSchema.size.border.regular} solid ${tokenSchema.color.border.muted}`,
            borderRadius: tokenSchema.size.radius.medium,
            content: '""',
            position: 'absolute',
            inset: 0,
            transition: transition(['background-color', 'border-color']),
          },
        })}
      />
    </FocusRing>
  )
}
