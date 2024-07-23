/** @jsxImportSource @emotion/react */

import { type HTMLAttributes, useEffect, useState } from 'react'
import copy from 'clipboard-copy'

import { CheckIcon } from '@keystone-ui/icons/icons/CheckIcon'
import { Copy } from '../icons/Copy'

type CodeBoxProps = {
  code: string
} & HTMLAttributes<HTMLElement>

export function CodeBox ({ code, ...props }: CodeBoxProps) {
  const [didJustCopy, setDidJustCopy] = useState(false)
  useEffect(() => {
    if (didJustCopy) {
      const timeout = setTimeout(() => setDidJustCopy(false), 1000)
      return () => clearTimeout(timeout)
    }
  }, [didJustCopy])

  const handleCopy = async () => {
    try {
      await copy(code)
      setDidJustCopy(true)
      // we don't want to do anything if the copy fails
    } catch {}
  }

  return (
    <div
      css={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        background: 'var(--code-bg)',
        fontSize: '1.125rem',
        fontFamily: 'var(--font-mono)',
        padding: '0.75rem 1rem',
        ':before': {
          content: '"$"',
          display: 'inline-block',
          color: 'var(--muted)',
          marginRight: '1rem',
        },
      }}
      {...props}
    >
      {code}
      <button
        onClick={handleCopy}
        css={{
          display: 'inline-flex',
          appearance: 'none',
          border: '0 none',
          borderRadius: '100%',
          boxShadow: 'none',
          background: 'transparent',
          padding: '0.25rem',
          marginLeft: '1rem',
          cursor: 'pointer',
          color: 'var(--muted)',
          alignItems: 'center',
        }}
      >
        {didJustCopy ? <CheckIcon color="green" /> : <Copy css={{ height: '1.5rem' }} />}
      </button>
    </div>
  )
}
