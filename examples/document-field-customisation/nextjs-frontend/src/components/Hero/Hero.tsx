import React from 'react'
import styles from './Hero.module.css'

type HeroProps = {
  imageSrc: string
  caption:
    | {
        discriminant: false
      }
    | {
        discriminant: true
        value: React.ReactNode
      }
}

export function Hero ({ imageSrc, caption }: HeroProps) {
  return (
    <div className={styles.hero}>
      <div className={styles.backgroundImage} style={{ backgroundImage: `url(${imageSrc})` }} />
      {caption.discriminant ? <div style={{ textAlign: 'center' }}>{caption.value}</div> : null}
    </div>
  )
}
