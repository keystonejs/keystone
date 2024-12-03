/** @jsxRuntime classic */
/** @jsx jsx */

import NextHead from 'next/head'
import {
  type HTMLAttributes,
  type ReactNode,
  Fragment,
  useState
} from 'react'

import { ActionButton } from '@keystar/ui/button'
import { Icon } from '@keystar/ui/icon'
import { menuIcon } from '@keystar/ui/icon/icons/menuIcon'
import { xIcon } from '@keystar/ui/icon/icons/xIcon'
import { breakpointQueries, css, tokenSchema } from '@keystar/ui/style'
import { HStack, VStack } from '@keystar/ui/layout'

import { jsx } from '@keystone-ui/core'
import { Logo } from './Logo'
import { Navigation } from './Navigation'

type PageContainerProps = {
  children: ReactNode
  header: ReactNode
  title?: string
}

const PageWrapper = (props: HTMLAttributes<HTMLElement>) => {
  // const { colors } = useTheme();
  return (
    <Fragment>
      {/* TODO: not sure where to put this */}
      <style>{`body { overflow: hidden; }`}</style>
      <div
        css={{
          // background: colors.background,
          display: 'grid',
          gridTemplateRows: `repeat(2, ${tokenSchema.size.element.large}) auto`,
          height: '100vh',
          isolation: 'isolate',
          [breakpointQueries.above.mobile]: {
            gridTemplateColumns: `${tokenSchema.size.scale[3600]} minmax(0, 1fr)`,
            gridTemplateRows: `${tokenSchema.size.element.xlarge} auto`,
          },
        }}
        {...props}
      />
    </Fragment>
  )
}

const Sidebar = ({
  isSidebarOpen,
  ...props
}: HTMLAttributes<HTMLElement> & {
  isSidebarOpen: boolean
}) => {
  return (
    <div
      className={css({
        gridColumn: '1/2',
        gridRow: '2/4',
        display: isSidebarOpen ? 'block' : 'none',
        height: '100vh',
        [breakpointQueries.above.mobile]: {
          gridColumn: '1/2',
          gridRow: '2/3',
          display: 'block',
          height: '100%',
        },
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      })}
    >
      <aside
        className={css({
          height: '100%',
          minWidth: 0, // resolves collapsing issues in children
        })}
        {...props}
      />
    </div>
  )
}

function Content (props: HTMLAttributes<HTMLElement>) {
  return (
    <VStack
      elementType='main'
      minHeight={0}
      minWidth={0}
      overflow="hidden auto"
      paddingX="xlarge"
      position="relative"
      UNSAFE_className={css({
        WebkitOverflowScrolling: 'touch',

        // prevent focused form fields being hidden behind the sticky toolbar
        // this is particularly important for textareas that may expand
        [breakpointQueries.above.mobile]: {
          // must be kept in-sync with the toolbar height
          scrollPaddingBlockEnd: tokenSchema.size.element.xlarge,
        }
      })}
      {...props}
    />
  )
}

export function PageContainer ({ children, header, title }: PageContainerProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  return (
    <PageWrapper>
      <NextHead>
        <title key="title">{title ? `Keystone - ${title}` : 'Keystone'}</title>
      </NextHead>
      <HStack
        alignItems="center"
        borderBottom="neutral"
        justifyContent="space-between"
        paddingX="xlarge"
      >
        <Logo />
        <ActionButton
          aria-label="open main menu"
          aria-pressed={isSidebarOpen}
          onPress={() => {
            setSidebarOpen(bool => !bool)
          }}
          prominence="low"
          isHidden={{ above: 'mobile' }}
        >
          <Icon src={isSidebarOpen ? xIcon : menuIcon} />
        </ActionButton>
      </HStack>
      <HStack
        elementType='header'
        alignItems="center"
        borderBottom="neutral"
        justifyContent="space-between"
        paddingX="xlarge"
        minWidth={0}
        UNSAFE_style={{ visibility: isSidebarOpen ? 'hidden' : 'visible' }}
      >
        {header}
      </HStack>
      <Sidebar isSidebarOpen={isSidebarOpen}>
        <Navigation />
      </Sidebar>
      <Content>{children}</Content>
    </PageWrapper>
  )
}
