import React, {
  type HTMLAttributes,
  type ReactNode,
  Fragment,
} from 'react'
import { useRouter } from 'next/router'

import { Breadcrumbs, Item } from '@keystar/ui/breadcrumbs'
import { HStack } from '@keystar/ui/layout'
import { breakpointQueries, css, tokenSchema } from '@keystar/ui/style'
import { Heading, Text } from '@keystar/ui/typography'

import { Container } from '../../../../admin-ui/components/Container'
import type { ListMeta } from '../../../../types'

type ItemPageHeaderProps = {
  label: string
  list: ListMeta
  title: string
}

export function ItemPageHeader (props: ItemPageHeaderProps) {
  const { label, list, title = label } = props
  const router = useRouter()

  return (
    <Container flex>
      {list.isSingleton ? (
        <Heading elementType="h1" size="small">{list.label}</Heading>
      ) : (
        <Fragment>
          <Breadcrumbs flex size="medium" minWidth="alias.singleLineWidth">
            <Item href={`/${list.path}`}>
              {list.label}
            </Item>
            <Item href={router.asPath}>
              {label}
            </Item>
          </Breadcrumbs>

          {/* Every page must have an H1 for accessibility. */}
          <Text elementType="h1" visuallyHidden>
            {title}
          </Text>
        </Fragment>
      )}
    </Container>
  )
}

export function ColumnLayout (props: HTMLAttributes<HTMLDivElement>) {
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
            gridTemplateColumns: `2fr minmax(${tokenSchema.size.alias.singleLineWidth}, 1fr)`,
            gridTemplateAreas: '"main sidebar" "toolbar ."',
          },
        })}
        {...props}
      />
    </Container>
  )
}

export function StickySidebar (props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={css({
        gridArea: 'sidebar',
        marginTop: tokenSchema.size.space.xlarge,

        [breakpointQueries.above.tablet]: {
          position: 'sticky',
          top: tokenSchema.size.space.xlarge,
        },
      })}
      {...props}
    />
  )
}

export function BaseToolbar (props: { children: ReactNode }) {
  return (
    <HStack
      alignItems="center"
      backgroundColor="surface"
      borderTop="neutral"
      gap="regular"
      gridArea="toolbar"
      height="element.xlarge"
      insetBottom={0}
      marginTop="xlarge"
      // paddingY={{
      //   mobile: 'medium',
      //   tablet: 'xlarge',
      // }}
      position={{
        tablet: 'sticky',
      }}
      zIndex={20}
    >
      {props.children}
    </HStack>
  )
}
