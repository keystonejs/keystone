import React from 'react'
import styles from './Carousel.module.css'

type CarouselProps = {
  items: {
    title: string
    imageSrc: string
  }[]
}

export function Carousel ({ items = [] }: CarouselProps) {
  return (
    <div className={styles.carousel}>
      {items.map(item => {
        return (
          <div key={item.imageSrc} className={styles.carouselItem}>
            <img role="presentation" src={item.imageSrc} className={styles.carouselImage} />
            <h1 className={styles.title}>{item.title}</h1>
          </div>
        )
      })}
    </div>
  )
}
