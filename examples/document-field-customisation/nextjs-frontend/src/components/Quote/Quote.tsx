import React, { type ReactNode } from 'react'
import styles from './Quote.module.css'

type QuoteProps = {
  attribution: ReactNode
  content: ReactNode
}

export function Quote ({ attribution, content }: QuoteProps) {
  return (
    <div className={styles.quote}>
      <div style={{ fontStyle: 'italic', color: '#4A5568' }}>{content}</div>
      <div style={{ fontWeight: 'bold', color: '#47546b' }}>— {attribution}</div>
    </div>
  )
}
