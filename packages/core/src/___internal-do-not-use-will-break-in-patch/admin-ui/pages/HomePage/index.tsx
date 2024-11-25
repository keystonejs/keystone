import React, {
  type PropsWithChildren,
  useId,
  useMemo,
  useRef
} from 'react'

import { ActionButton } from '@keystar/ui/button'
import { Icon } from '@keystar/ui/icon'
import { plusIcon } from '@keystar/ui/icon/icons/plusIcon'
import { Grid, VStack } from '@keystar/ui/layout'
import { useLink } from '@keystar/ui/link'
import { Notice } from '@keystar/ui/notice'
import { ProgressCircle } from '@keystar/ui/progress'
import { css, FocusRing, tokenSchema, transition } from '@keystar/ui/style'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { Heading, Text } from '@keystar/ui/typography'

import { makeDataGetter } from '../../../../admin-ui/utils'
import { PageContainer } from '../../../../admin-ui/components/PageContainer'
import { gql, useQuery } from '../../../../admin-ui/apollo'
import { useKeystone, useList } from '../../../../admin-ui/context'

type ListCardProps = {
  listKey: string
  hideCreate: boolean
  count:
    | { type: 'success', count: number }
    | { type: 'no-access' }
    | { type: 'error', message: string }
    | { type: 'loading' }
}

export function HomePage () {
  const {
    adminMeta: { lists },
    visibleLists,
  } = useKeystone()
  const query = useMemo(
    () => gql`
    query {
      keystone {
        adminMeta {
          lists {
            key
            hideCreate
          }
        }
      }
      ${Object.values(lists)
        .filter(list => !list.isSingleton)
        .map(list => `${list.key}: ${list.graphql.names.listQueryCountName}`)
        .join('\n')}
    }`,
    [lists]
  )
  const { data, error } = useQuery(query, { errorPolicy: 'all' })

  const dataGetter = makeDataGetter(data, error?.graphQLErrors)

  const stateAwareElement = (() => {
    if (visibleLists.state === 'error') {
      return (
        <Notice tone="critical">
          {visibleLists.error instanceof Error
            ? visibleLists.error.message
            : visibleLists.error[0].message}
        </Notice>
      )
    }
    if (visibleLists.state === 'loading') {
      return (
        <VStack height="100%" alignItems="center" justifyContent="center">
          <ProgressCircle aria-label='loading lists' size="large" isIndeterminate  />
        </VStack>
      )
    }

    return (
      <Grid
        autoRows="element.xlarge"
        columns={`repeat(
          auto-fill,
          minmax(${tokenSchema.size.scale[3000]}, 1fr)
        )`}
        gap="large"
      >
        {Object.keys(lists).map(key => {
          if (!visibleLists.lists.has(key)) {
            return null
          }
          const result = dataGetter.get(key)
          return (
            <ListCard
              count={
                data
                  ? result.errors
                    ? { type: 'error', message: result.errors[0].message }
                    : { type: 'success', count: data[key] }
                  : { type: 'loading' }
              }
              hideCreate={
                data?.keystone.adminMeta.lists.find((list: any) => list.key === key)
                  ?.hideCreate ?? false
              }
              key={key}
              listKey={key}
            />
          )
        })}
      </Grid>
    )
  })()

  return (
    <PageContainer header={<Heading elementType="h1" size="small">Dashboard</Heading>}>
      <Text elementType="h2" visuallyHidden>Lists</Text>
      <VStack paddingY="xlarge">
        {stateAwareElement}
      </VStack>
    </PageContainer>
  )
}

function ListCard ({ listKey, count, hideCreate }: ListCardProps) {
  const list = useList(listKey)
  const countElementId = useId()
  const countElement = (() => {
    if (list.isSingleton) {
      return null
    }

    switch (count.type) {
      case 'success':
        return (
          <Text id={countElementId} color="neutralSecondary">
            {count.count} item{count.count !== 1 ? 's' : ''}
          </Text>
        )
      case 'error':
        return <Text id={countElementId} color="critical">{count.message}</Text>
      case 'loading':
        return <Text id={countElementId} aria-label="loading count" color="neutralTertiary">--</Text>
      default:
        return <Text id={countElementId} color="neutralTertiary">No access</Text>
    }
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
          <CardLink aria-describedby={countElementId} href={`/${list.path}${list.isSingleton ? '/1' : ''}`}>
            {list.label}
          </CardLink>
        </Heading>

        {countElement}
      </VStack>

      {hideCreate === false && !list.isSingleton && (
        <TooltipTrigger>
          <ActionButton aria-label="add" href={`/${list.path}/create`}>
            <Icon src={plusIcon} />
          </ActionButton>
          <Tooltip>Add {list.singular.toLowerCase()}</Tooltip>
        </TooltipTrigger>
      )}
    </Grid>
  )
}

function CardLink (props: PropsWithChildren<{ href: string }>) {
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
