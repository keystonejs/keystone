import React, { Component, type ReactNode } from 'react'

import { Button } from '@keystar/ui/button'
import { Dialog } from '@keystar/ui/dialog'
import { Icon } from '@keystar/ui/icon'
import { alertTriangleIcon } from '@keystar/ui/icon/icons/alertTriangleIcon'
import { Box, Grid, VStack } from '@keystar/ui/layout'
import { Content, SlotProvider } from '@keystar/ui/slots'
import { css, tokenSchema } from '@keystar/ui/style'
import { Heading, Text } from '@keystar/ui/typography'


type ErrorBoundaryProps = {
  children: ReactNode
}
type ErrorBoundaryState = {
  error?: any
  hasError: boolean
  isReloading: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, isReloading: false }
  static getDerivedStateFromError (error: any) {
    return { error, hasError: true }
  }
  reloadPage = () => {
    this.setState({ isReloading: true })
    window.location.reload()
  }
  render () {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <Icon color="neutral" src={alertTriangleIcon} size="large" />
          <Heading elementType="h1" margin={0}>Unknown error</Heading>
          <Text>Something went wrong, please try reloading the page. If the problem persists contact your system administrator.</Text>
          <Button
            // isPending={this.state.isReloading}
            prominence="high"
            onPress={this.reloadPage}
          >
            Reload page
          </Button>
        </ErrorContainer>
      )
    }

    return this.props.children
  }
}

type ErrorContainerProps = {
  children: ReactNode
}

const errorContainerSlots = {
  heading: { align: 'center', margin: 0 },
  text: { align: 'center' }
} as const
export const ErrorContainer = ({ children }: ErrorContainerProps) => {
  return (
    <Grid minHeight="100vh" minWidth="100vw" alignItems="center" justifyContent="center">
      <VStack
        alignItems="center"
        backgroundColor="canvas"
        border="neutral"
        borderRadius="large"
        gap="xlarge"
        margin="xlarge"
        minWidth="container.xsmall"
        maxWidth="container.small"
        padding="xxlarge"
      >
        <SlotProvider slots={errorContainerSlots}>
          {children}
        </SlotProvider>
      </VStack>
    </Grid>
  )
}

export function ErrorDetailsDialog (props: { error: Error }) {
  return (
    <Dialog>
      <Heading>Error details</Heading>
      <Content>
        <VStack gap="large">
          <Text weight="medium">
            {props.error.message}
          </Text>
          {props.error.stack && (
            <Box
              elementType="pre"
              backgroundColor="critical"
              borderRadius="regular"
              maxHeight="100%"
              padding="medium"
              overflow="auto"
            >
              <Text
                color="critical"
                trim={false}
                UNSAFE_className={css({
                  fontFamily: tokenSchema.typography.fontFamily.code
                })}
              >
                {props.error.stack}
              </Text>
            </Box>
          )}
        </VStack>
      </Content>
    </Dialog>
  )
}