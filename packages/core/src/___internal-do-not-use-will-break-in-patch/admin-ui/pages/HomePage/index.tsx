/** @jsxRuntime classic */
/** @jsx jsx */

import { useMemo } from 'react'
import { gql, useQuery } from '../../../../admin-ui/apollo'
import { Inline, Heading, VisuallyHidden, jsx, useTheme } from '@keystone-ui/core'
import { PlusIcon } from '@keystone-ui/icons/icons/PlusIcon'

import { PageContainer } from '../../../../admin-ui/components/PageContainer'
import { useKeystone } from '../../../../admin-ui/context'
import { Link, type LinkProps } from '../../../../admin-ui/router'
import { type ListMeta } from '../../../../types'

function ListCard ({
  list,
  count,
}: {
  list: ListMeta
  count: number
}) {
  const { colors, palette, radii, spacing } = useTheme()
  return (
    <div css={{ position: 'relative' }}>
      <Link
        href={`/${list.path}${list.isSingleton ? '/1' : ''}`}
        css={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderRadius: radii.medium,
          borderWidth: 1,
          // boxShadow: shadow.s100,
          display: 'inline-block',
          minWidth: 280,
          padding: spacing.large,
          textDecoration: 'none',

          ':hover': {
            borderColor: palette.blue400,
          },
          ':hover h3': {
            textDecoration: 'underline',
          },
        }}
      >
        <h3 css={{ margin: `0 0 ${spacing.small}px 0` }}>{list.label} </h3>
        <span css={{ color: colors.foreground, textDecoration: 'none' }}>
          {count} item{count !== 1 ? 's' : ''}
        </span>
      </Link>
      {list.hideCreate === false && !list.isSingleton && (
        <CreateButton title={`Create ${list.singular}`} href={`/${list.path}/create`}>
          <PlusIcon size="large" />
          <VisuallyHidden>Create {list.singular}</VisuallyHidden>
        </CreateButton>
      )}
    </div>
  )
}

function CreateButton (props: LinkProps) {
  const theme = useTheme()
  return (
    <Link
      css={{
        alignItems: 'center',
        backgroundColor: theme.palette.neutral400,
        border: 0,
        borderRadius: theme.radii.xsmall,
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        height: 32,
        justifyContent: 'center',
        outline: 0,
        position: 'absolute',
        right: theme.spacing.large,
        top: theme.spacing.large,
        transition: 'background-color 80ms linear',
        width: 32,
        '&:hover, &:focus': {
          color: 'white',
          backgroundColor: theme.tones.positive.fill[0],
        },
      }}
      {...props}
    />
  )
}

export function HomePage () {
  const { adminMeta } = useKeystone()
  const lists = adminMeta?.lists
  const LIST_COUNTS_QUERY = useMemo(() => gql`
    query GetListCounts {
      ${Object.values(lists ?? [])
        .map(list => `${list.key}: ${list.gqlNames.listQueryCountName}`)
        .join('\n')}
    }
  `, [adminMeta?.lists])
  const { data: counts } = useQuery<{ [key: string]: number }>(LIST_COUNTS_QUERY)

  return (
    <PageContainer header={<Heading type="h3">Dashboard</Heading>}>
      <Inline
        as="ul"
        gap="large"
        paddingY="xlarge"
        css={{
          paddingLeft: '0px',
          marginBottom: '0px',
        }}
      >
        {Object.values(lists ?? []).map((list) => {
          const count = counts?.[list.key] ?? 0
          return <ListCard key={list.key} list={list} count={count} />
        }) ?? [] }
        </Inline>
    </PageContainer>
  )
}
