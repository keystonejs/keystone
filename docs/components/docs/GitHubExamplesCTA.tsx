
/** @jsxImportSource @emotion/react */

import { Alert } from '../primitives/Alert'
import { Button } from '../primitives/Button'
import { ArrowR } from '../icons/ArrowR'

export function GitHubExamplesCTA () {
  return (
    <Alert css={{ margin: '2rem 0' }}>
      <span
        css={{
          display: 'inline-block',
          margin: '0 1rem 0.5rem 0',
        }}
      >
        All example projects live in the
      </span>
      <Button
        as="a"
        look="secondary"
        size="small"
        href="https://github.com/keystonejs/keystone/tree/main/examples"
        target="_blank"
        rel="noreferrer"
      >
        Keystone GitHub repo <ArrowR />
      </Button>
    </Alert>
  )
}
