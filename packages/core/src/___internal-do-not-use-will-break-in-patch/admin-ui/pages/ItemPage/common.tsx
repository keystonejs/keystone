/** @jsxRuntime classic */
/** @jsx jsx */

import { Heading, jsx, useTheme } from '@keystone-ui/core'
import { ChevronRightIcon } from '@keystone-ui/icons/icons/ChevronRightIcon'
import { Fragment, type HTMLAttributes, type ReactNode } from 'react'
import { Container } from '../../../../admin-ui/components/Container'
import { Link } from '../../../../admin-ui/router'
import { type ListMeta } from '../../../../types'

export function ItemPageHeader (props: { list: ListMeta, label: string }) {
  const { palette, spacing } = useTheme()

  return (
    <Container
      css={{
        alignItems: 'center',
        display: 'flex',
        flex: 1,
        justifyContent: 'space-between',
      }}
    >
      <div
        css={{
          alignItems: 'center',
          display: 'flex',
          flex: 1,
          minWidth: 0,
        }}
      >
        {props.list.isSingleton ? (
          <Heading type="h3">{props.list.label}</Heading>
        ) : (
          <Fragment>
            <Heading type="h3">
              <Link href={`/${props.list.path}`} css={{ textDecoration: 'none' }}>
                {props.list.label}
              </Link>
            </Heading>
            <div
              css={{
                color: palette.neutral500,
                marginLeft: spacing.xsmall,
                marginRight: spacing.xsmall,
              }}
            >
              <ChevronRightIcon />
            </div>
            <Heading
              as="h1"
              type="h3"
              css={{
                minWidth: 0,
                maxWidth: '100%',
                overflow: 'hidden',
                flex: 1,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {props.label}
            </Heading>
          </Fragment>
        )}
      </div>
    </Container>
  )
}

export function ColumnLayout (props: HTMLAttributes<HTMLDivElement>) {
  const { spacing } = useTheme()

  return (
    // this container must be relative to catch absolute children
    // particularly the "expanded" document-field, which needs a height of 100%
    <Container css={{ position: 'relative', height: '100%' }}>
      <div
        css={{
          alignItems: 'start',
          display: 'grid',
          gap: spacing.none,
          gridTemplateColumns: `100vw`,
          '@media (min-width: 576px)': {
            gridTemplateColumns: `2fr 1fr`,
            gap: spacing.xlarge,
          },
        }}
        {...props}
      />
    </Container>
  )
}

export function BaseToolbar (props: { children: ReactNode }) {
  const { colors, spacing } = useTheme()

  return (
    <div
      css={{
        background: colors.background,
        borderTop: `1px solid ${colors.border}`,
        bottom: 0,
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: spacing.xlarge,
        paddingBottom: spacing.xlarge,
        paddingTop: spacing.xlarge,
        position: 'sticky',
        zIndex: 20,
      }}
    >
      {props.children}
    </div>
  )
}
